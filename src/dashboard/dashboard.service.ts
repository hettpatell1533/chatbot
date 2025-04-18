import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from '@langchain/core/documents';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { CreateDashboardDto } from './dtos/create-dashboard.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { project, source_code_embedding } from './dashboard.interface';
import { AstService } from 'src/ast/ast.service';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly astService: AstService,
  ) {}

  async aiSummarizeCommit(diff: string): Promise<string> {
    const response = await model.generateContent([
      `You are an expert programmer, and you are trying to summarize a git diff.
          Reminders about the git diff format:
          For every file, there are a few metadata lines, like (for example):
          \`\`\`
          diff --git a/lib/index.js b/lib/index.js
          index aadf691..bfef603 100644
          --- a/lib/index.js
          +++ b/lib/index.js
          \`\`\`
          This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
          Then there is a specifier of the lines that were modified.
          A line starting with \`+\` means it was added.
          A line that starting with \`-\` means that line was deleted.
          A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
          It is not part of the diff.
          [...]
          EXAMPLE SUMMARY COMMENTS:
          \`\`\`
          * Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
          * Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
          * Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
          * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
          * Lowered numeric tolerance for test files
          \`\`\`
          Most commits will have less comments than this examples list.
          The last comment does not include the file names,
          because there were more than two relevant files in the hypothetical commit.
          Do not include parts of the example in your summary.
          It is given only as an example of appropriate comments.`,
      `Please summarize the following diff file : \n\n${diff}`,
    ]);

    return response.response.text();
  }

  async summariseCode(doc: Document): Promise<string> {
    try {
      const code = doc.pageContent.slice(0, 100000);
      const response = await model.generateContent([
        `You are an intelligent senior software engineer who specialise in onboarding junior software engineers onto projects`,
        `You are onboarding a junior software engineer and explaining to them the purpose of the {source} file
             here is the code:
             ---
             ${code}
             ---    
             give a summary no more than 100 words of the code above
            `,
      ]);
      return response.response.text();
    } catch {
      return '';
    }
  }

  async generateEmbedding(summary: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({
      model: 'text-embedding-004',
    });

    const result = await model.embedContent(summary);
    const embedding = result.embedding;

    return embedding.values;
  }

  async loadGithubRepo(githubUrl: string, githubToken?: string): Promise<any> {
    const loader = new GithubRepoLoader(githubUrl, {
      accessToken: githubToken || process.env.GITHUB_TOKEN,
      branch: 'main',
      ignoreFiles: [
        '.gitattributes',
        'package-lock.json',
        'yarn.lock',
        'bun.lockb',
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
        '.next/*',
        '.vscode/*',
      ],
      recursive: true,
      unknown: 'warn',
      maxConcurrency: 5,
    });
    const docs = await loader.load();

    return docs;
  }

  async indexGithubRepo(createDashboard: CreateDashboardDto, user: string): Promise<project> {
    const { project_name, github_url, github_token } = createDashboard;

    const project = await this.prisma.project.create({
      data: {
        name: project_name,
        github_url,
        user_id: user,
      },
    });

    const docs = await this.loadGithubRepo(github_url, github_token);
    const allEmbeddings = await this.generatEmbeddings(docs);

    const ast = await this.astService.analyzeDependencies(docs, project.id);
    if (!ast) {
      throw new Error('Error analyzing dependencies');
    }
    await Promise.allSettled(
      allEmbeddings.map(async (embedding) => {
        if (!embedding) return;
        try {
          const source_code_embedding = await this.prisma.github_repo.create({
            data: {
              source_code: embedding.source_code,
              embedding: embedding.embedding,
              file_name: embedding.file_name,
              project_id: project.id,
            },
          });

          return source_code_embedding;
        } catch (error) {
          console.log(error.message)
          throw new Error('Error indexing github repo');
        }
      }),
    );
    console.log(project)
    return project;
  }

  async generatEmbeddings(docs: Document[]): Promise<
    {
      summary: string;
      embedding: number[];
      file_name: string;
      source_code: string;
    }[]
  > {
    return await Promise.all(
      docs.map(async (doc) => {
        const summary = await this.summariseCode(doc);
        const embedding = await this.generateEmbedding(summary);
        return {
          summary,
          embedding,
          source_code: JSON.parse(JSON.stringify(doc.pageContent)),
          file_name: doc.metadata.source,
        };
      }),
    );
  }

  async getAllProjects(): Promise<project[]> {
    try{
      const projects = await this.prisma.project.findMany({
        include: {
          room: {
            orderBy: {
              created_at: 'desc',
            }
          },
        }
      });
      return projects;
    }
    catch(error){
      throw new Error(`Error getting projects: ${error}`);
    }
  }
}
