import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

@Injectable()
export class MessageService {
    constructor(
        private readonly prismaService: PrismaService,
    ){}

    async createMessage(prompt: string, roomId: string) {
        const newMessage = await this.prismaService.messages.create({
            data: {
                content: {"question": prompt},
                role: 'user',
                room_id: roomId,
            },
        });
        return prompt;
    }

    async knowingFilesWhichNeedsToChange(prompt: string, projectId: string){
      try {
          const dependencyGraph = await this.prismaService.code_dependency_graph.findFirst({
              where: {
                  project_id: projectId,
              },
          });
  
          const response = await model.generateContent([
              `Dependency graph: \n\n${JSON.stringify(dependencyGraph)}`,
              `User prompt: \n\n${prompt}`,
              `You are an expert-level AI software engineer.
            
            Your task is to analyze the user's prompt and the given dependency graph and determine which files need to be changed or created in order to fulfill the task.
            
            Dependency graph is an array of objects in this format:
            {
              file: string;
              imports: string[];
              exports: string[];
              functions: string[];
              classes: string[];
              state: string[];
              events: string[];
              render: string[];
              apis: string[];
              variables?: Record<string, string>;
            }
            
            Strict Rules:
            - You MUST only use files listed in the provided dependency graph.
            - DO NOT guess or assume the existence of any files not listed in the dependency graph.
            - Only include file paths from the dependency graph if they are directly relevant and need to be edited or if a new file is clearly required based on the user's prompt.
            - If a new file needs to be created, include it in the list.
            - If no changes are needed, return: []
            
            Final Output:
            Return ONLY a list (JSON array) of file paths.
            Do NOT return code, reasoning, explanations, or extra formatting.
            
            Format Example (strict):
            [
              "src/utils/helper.ts",
              "src/pages/api/user.ts"
            ]`
            ]);
  
          const rawText = response.response.text().trim().replace(/```json|```/g, '').trim();
          return JSON.parse(rawText);
      } catch (error) {
        console.error(`Error in knowingFilesWhichNeedsToChange: ${error}`);
        throw new Error(`Error in knowingFilesWhichNeedsToChange: ${error}`);
      }
    }

    async aiGeneratedResponse(prompt: string, projectId: string, roomId: string) {
       try {
        await this.createMessage(prompt, roomId);
         const dependencyGraph = await this.prismaService.code_dependency_graph.findFirst({
             where: {
                 project_id: projectId,
             },
         });
 
         const files_list = await this.knowingFilesWhichNeedsToChange(prompt, projectId);
 
         const files = await this.prismaService.github_repo.findMany({
             where: {
                 project_id: projectId,
                 file_name: {
                     in: files_list,
                 },
             },
             select: {
                 file_name: true,
                 source_code: true,
             },
         })
 
         const response = await model.generateContent([
             `Dependency graph: \n\n${dependencyGraph}`,
             `User prompt: \n\n${prompt}`,
             `Files list: \n\n${JSON.stringify(files)}`,
             `You are an AI agent with 20+ years of software development engineering experience and a powerful debugger for any coding language, whether it's the latest tech stack or legacy systems.
 
 Guidelines for Task Execution:
 Dependency Graph & File References:
 
 Remember return only list of changed files and their paths like [{'<file_name>': '<newly chaned content of this file>'}] with actual code.
 
 not add any explanations or comments.
 
 Always use the given dependency graph and files (in which you need to rewrite or fix code) for any coding task.
 
 Follow the files exactly and add features as requested by the user without deviation.
 
 Official Documentation & Technology Versioning:
 
 Use only official documentation of the used technology and adhere strictly to the version specified by the user.
 
 Never use versions lower or greater than the specified technology version.
 
 Package Installation:
 
 If new features or code require additional packages, provide the command for installation.
 
 Do not install packages without evaluating if they are needed.
 
 File Analysis & Decision Making:
 
 Before making any edits, analyze the provided file(s) and dependency graph.
 
 Only take action after this analysis and avoid writing redundant code.
 
 If the existing code is outdated or suboptimal, rewrite it to improve efficiency.
 
 Imports, Dependencies & Endpoints (for TypeScript files):
 
 Add all necessary import statements, dependencies, and endpoints required to run the code, but only for .ts and .tsx files.
 
 Avoid Non-Textual Code:
 
 Never generate large hashes, binary files, .ico files, or any non-textual code unless explicitly requested by the user. These are inefficient and expensive to generate.
 
 File Review Before Edits:
 
 Unless the change is a small, easy edit or you’re creating a new file, always review the contents or the section of the file before making edits.
 
 Avoid blind editing or adding new code that is not aligned with the context.
 
 UI Cloning:
 
 If tasked with cloning a UI from a website, scrape the website for screenshots, styling, and assets.
 
 Strive for pixel-perfect cloning, paying attention to every detail like backgrounds, gradients, colors, spacing, and any other small design elements.
 
 Handling Errors:
 
 Linter or Runtime Errors: If you encounter linter or runtime errors:
 
 Fix them if they are clear or easily solvable.
 
 Do not loop more than 3 times on fixing errors in the same file. On the third attempt, ask the user for guidance on what to do next.
 
 Do not fix warnings unless explicitly asked by the user.
 
 If the error prevents the app from running (e.g., server errors like a 502 Bad Gateway), immediately fix the issue by performing simple troubleshooting steps, such as restarting the development server.
 
 Efficient Debugging:
 
 As a debugger, you must be efficient and avoid unnecessary operations. Always aim for the most optimal solution for the issue at hand.`,
             
           ]);
 
         const newMessage = await this.prismaService.messages.create({
             data: {
                 role: 'assistant',
                 content: response.response.text(),
                 room_id: roomId,
             },
         });
         return newMessage;
       } catch (error) {
            console.error(`Error in aiGeneratedResponse: ${error}`);
            throw new Error(`Error in aiGeneratedResponse: ${error}`);
       }
    }

    async getAllMessagesByRoomId(roomId: string) {
        try {
            const messages = await this.prismaService.messages.findMany({
                where: {
                    room_id: roomId,
                },
            });
            return messages;
        } catch (error) {
            console.error(`Error in getAllMessagesByRoomId: ${error}`);
            throw new Error(`Error in getAllMessagesByRoomId: ${error}`);
        }
    }
}
