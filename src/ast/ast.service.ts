import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as yaml from 'js-yaml';
import * as dotenv from 'dotenv';
import * as htmlparser from 'htmlparser2';
import { AstMetadata } from './ast.interface';
import { InputJsonValue } from '@prisma/client/runtime/library';

const EXT_TO_PARSER = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'babel',
  '.jsx': 'babel',
  '.json': 'json',
  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.env': 'env',
  '.gitignore': 'line-by-line',
  '.prettierignore': 'line-by-line',
  '.npmrc': 'line-by-line',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'css',
};

@Injectable()
export class AstService {
  constructor(private readonly prisma: PrismaService) {}

  async analyzeFile(doc: any) {
    const ext = path.extname(doc.metadata.source);
    const parserType = EXT_TO_PARSER[ext];
    const raw = doc.pageContent;

    const metadata: AstMetadata = {
      file: doc.metadata.source,
      imports: [],
      exports: [],
      functions: [],
      classes: [],
      state: [],
      events: [],
      render: [],
      apis: [],
      variables: {},
    };

    try {
      switch (parserType) {
        case 'typescript':
        case 'babel':
          const ast = parser.parse(raw, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx', 'classProperties'],
          });
          const result = {
            imports: [] as string[],
            exports: [] as string[],
            functions: [] as string[],
            components: [] as string[],
            state: [] as string[],
          };
          traverse(ast, {
            ImportDeclaration(path) {
              metadata.imports.push(path.node.source.value);
            },
            ExportNamedDeclaration(path) {
              if (path.node.declaration && 'id' in path.node.declaration) {
                metadata.exports.push(
                  (path.node.declaration as any).id?.name ?? 'unknown',
                );
              } else {
                metadata.exports.push('unknown');
              }
            },
            ExportDefaultDeclaration() {
              metadata.exports.push('default');
            },
            FunctionDeclaration(path) {
              metadata.functions.push(path.node.id?.name ?? 'unknown');
            },
            VariableDeclaration(path) {
              for (const declaration of path.node.declarations) {
                const callee = (declaration.init as any)?.callee;
                if (
                  callee?.name === 'useState' &&
                  declaration.id.type === 'Identifier'
                ) {
                  result.state.push(declaration.id.name);
                }
              }
            },
          });
          break;

        case 'json':
          const cleaned = raw.replace(/(\/\/.*|\/\*[\s\S]*?\*\/)/g, '');
          metadata.render = JSON.parse(cleaned);
          break;

        case 'yaml':
          metadata.render = yaml.load(raw);
          break;

        case 'env':
          dotenv.parse(raw);
          const envVars: Record<string, string> = {};
          raw.split('\n').forEach((line) => {
            const [key, ...values] = line.split('=');
            if (key) envVars[key.trim()] = values.join('=').trim();
          });
          metadata.variables = envVars;
          break;

        case 'html':
          const handler = new htmlparser.DefaultHandler((error, dom) => {
            metadata.render = dom.map((node) => {
              return node.toString();
            });
          });
          const htmlParser = new htmlparser.Parser(handler);
          htmlParser.parseComplete(raw);
          break;

        default:
          metadata.render = raw.split('\n').filter(Boolean);
      }
    } catch (err) {
      throw new Error(`Error parsing file ${doc.metadata.source}: ${err}`);
    }

    return metadata;
  }

  async analyzeDependencies(doc: any[], projectId: string) {
    const dependencies: AstMetadata[] = [];
    doc.forEach(async (doc, index) => {
      const temp = await this.analyzeFile(doc);
      if (temp) {
        dependencies.push(temp);
      }
    });

    // for (const sourceFile of sourceFiles) {
    //     const imports = sourceFile.getImportDeclarations();

    //     for (const importDeclaration of imports) {
    //       const moduleSpecifier = importDeclaration.getModuleSpecifier();

    //       if (moduleSpecifier.getKind() === SyntaxKind.StringLiteral) {
    //         const value = moduleSpecifier.getText().replace(/['"]/g, '');
    //         dependencies.push(value);
    //       } else {
    //         console.warn('Skipping non-string import:', importDeclaration.getText());
    //       }
    //     }
    //   }

    const projectData = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!projectData) {
      throw new Error('Project not found');
    }
    const projectDependencies = await this.prisma.code_dependency_graph.create({
      data: {
        project_id: projectId,
        graph: dependencies as unknown as InputJsonValue[],
      },
    });

    return projectDependencies;
  }
}
