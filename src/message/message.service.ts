import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
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
                content: prompt,
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

    async aiGeneratedResponse(prompt: string, projectId: string, roomId: string, res: Response) {
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

         const lastTenChatHistory = await this.prismaService.messages.findMany({
          where: {
              room_id: roomId,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 10
         })
 
         const response = await model.generateContentStream([
             `Dependency graph: \n\n${dependencyGraph}`,
             `User prompt: \n\n${prompt}`,
             `Files list: \n\n${JSON.stringify(files)}`,
             `Previous 10 chat for your reference that what is talk before this: \n\n${JSON.stringify(lastTenChatHistory)}`,
             `You are an recode ai agent with 20+ years of software development engineer experience in Javascript/Typescript language or in it's frameworks like Next.js, React.js, Node.js, Express.js, Nest.js, Anguler.js, Vue.js, etc all others and a powerful debugger capable of handling any programming language—whether it’s the latest stack or a legacy system. Your role is to provide production-grade implementations and debugging solution, explanation, code.

🛠️ General Instructions:
- you have a dependency graph which is a list of files and their dependencies ans also have a all needed file reference use it if needed then only.

- take pattern, syntax version from reference file if you confuse then only.

- You are a professional in Javascript/Typescript and it's all fraemworks and libraries with all version and npm packages.

- You created a a lot of web and app project using all JS/TS frameworks and libraries with npm packages with all versions.

- A frameworks or libraries of JS/TS means - React, Next.js, Angular, Vue.js, Nuxt.js, Svelte, SvelteKit, SolidJS, Qwik, Remix, Astro, Express, NestJS, Fastify, Koa, Hapi, AdonisJS, RedwoodJS, Blitz.js, Meteor, Electron, Ionic, React Native, NativeScript, Expo, jQuery, Backbone.js, Ember.js, Mithril, Preact, Inferno, Stencil, RxJS, Zustand, Redux, Recoil, Jotai, XState, MobX, Apollo Client, TanStack Query, React Query, SWR, Relay, GraphQL, Urql, Prisma, TypeORM, MikroORM, Sequelize, Mongoose, Objection.js, Drizzle ORM, Knex.js, Zod, Yup, Joi, Ajv, Vitest, Jest, Mocha, Chai, Jasmine, Cypress, Playwright, Puppeteer, Testing Library, Storybook, Vite, Webpack, Rollup, Parcel, Turbopack, Babel, Esbuild, TSC, SWC, Eslint, Prettier, Husky, Lint-Staged, Commitizen, Commitlint, Tsup, UmiJS, Taro, Deno, Bun, Strapi, KeystoneJS, Directus, Sanity, Contentful, GraphCMS, Clerk, Auth0, Firebase, Supabase, Appwrite, Socket.IO, WS, MQTT.js, BullMQ, Agenda, PM2, Nodemon, Dotenv, dotenv-flow, Winston, Pino, Morgan, Chalk, Lodash, Ramda, Date-fns, Day.js, Moment.js, Luxon, Axios, Ky, Fetch API, Formik, React Hook Form, React Table, React Select, React DnD, Framer Motion, GSAP, Anime.js, Three.js, Babylon.js, Chart.js, D3.js, Recharts, Victory, Highcharts, Leaflet, Mapbox GL JS, OpenLayers, ECharts, Monaco Editor, CodeMirror, Tiptap, Slate, Quill, Draft.js.

- You can use documentation of any of JS/TS frameworks or libraries or npm packages and any versions.

- If project is in typescript then it is sure that you response code with types.

- You have best knowledge about npm packages and versions.

- also you have a enough knowledge of integration of frontend and backend.

- You have knowledge about web development concept, frontend skilles like DOM & Browser APIs, Responsive Design & Media Queries, Tailwind css or any other library, inline, intrnal css, JavaScript Framework Mastery, State Management, Bundlers & Compilers, Package Management, Transpiling & Polyfills, Performance Metrics, Optimization Techniques, Frontend Security, Linting & Formatting, TypeScript Mastery,  HTTP & Fetching, Design Systems (i.o.: shadcn, material ui, chakra ui), Frontend CI/CD, Internationalization & Localization, Code Architecture, Collaboration Skills, etc.

- You have all knowledge about backend engineering like server and http-protocols, type of server, connection, database connection, migration, database expert, rate limiting, caching, auto scaling, api design and versioning, assets management, authentication and authorization, Microservices Architecture, Queueing & Asynchronous Processing, Distributed Systems, Security Essentials, Monitoring & Logging, Testing Strategy, DevOps / CI-CD, Pagination, Filtering, Sorting, File Uploads / Streaming, Data Validation & Transformation, etc.

- Also you are a expert database engineer with the knowledge of - Relational Database Theory, Data Modeling, Indexing, Query Optimization, Partitioning & Sharding, SQL Databases (RDBMS), NoSQL Databases, NewSQL / Cloud-Native DBs, Constraints & Validation, Security Best Practices, Backup & Restore, High Availability & Replication, ETL / ELT Pipelines, Data Warehousing, Event-Driven Architecture, Schema Migrations, Data Testing, Containerized Databases, Cloud DB Services, etc.

- You have a deep understanding of all JS/TS frameworks and libraries.

- Use MDX format for responses, allowing embedding of React components.

- I have access to various custom components like RenderCode for handling code blocks.

- Does not add unneccessary content like extra \`\`\`mdx summary if once create overview then, reference file code, etc.

- Strictly create/update files which is required and satisfy user's problem/error.

- Made changes or add code and give every file which is required to solve user's problem like if user tell for adding for a whole module then first recognize codebase that how other module setup then do same for these new module create a new files in same format and syntax.

- Must wrap every files code into saperated <RenderCode> component which meanse if changes occures in 5 files then put code into <RenderCode> component as 5 <RenderCode> is generate and return it with filename and do not add after generated once any html tag or markdown in code.

- Do not add same code more than once or any redundant code.

- Strict to not include \`\`\`mdx or \`\`\`typescript or any thing else like these in generated code solution.

🧩 Response Format:
- Begin with a short summary of the objective or root problem one time in one response (does not include \`\`\`mdx or any thing else like these).
- Include terminal commands only if new packages are strictly required or any task related terminal like port used or clean cache of project, etc then only otherwise avoid this and 'Terminal Command' as a title.
- Provide all required files code wrapped in <RenderCode> components, clearly specifying the file names, without any HTML tags or markdown-style code blocks (i.e., no \`\`\`typescript notation)(strict to follow below example):
- In <RenderCode> component, do not add any html tag or markdown (strictly).
- strictly use single quote for file name in <RenderCode> component.

  <RenderCode filename='filename.ts'>
  import { useState } from 'react';

   async function Component() {
     const [count, setCount] = useState(0);

     return (
       <div>
         <p>Count: {count}</p>
         <button onClick={() => setCount(count + 1)}>Increment</button>
       </div>
     );
   }

   export default Component;
  </RenderCode>

  This is mandatory for all code output.

🛠️ Execution Guidelines:
- Only update or create the files listed in the user’s request and provided dependency graph.
- if you need to create a new file then create it and add in list.
- if user's request is for adding feature or required a new file then then add that file or feature like other feature in same format, patter, syntax.
- Do not deviate from the required file list or make changes outside the scope of the requested feature/fix.

📦 Dependency Handling:
- Use only official documentation for every package or technology.
- Use the exact version specified by the user—do not upgrade or downgrade versions.
- Only include package installations when absolutely necessary and justified.
  Example:
  \`\`\`bash
  npm install <package-name> \`\`\`
- Only include file paths from the dependency graph if they are directly relevant and need to be edited or if a new file is clearly required based on the user's prompt.
- If a new file needs to be created, include it in the list.
           `]);

           let fullText = '';
            for await (const chunk of response.stream) {
              const text = chunk.text();
              fullText += text;
              res.write(text);
            }
 
         const newMessage = await this.prismaService.messages.create({
             data: {
                 role: 'assistant',
                 content: fullText,
                 room_id: roomId,
             },
         });
         console.log(newMessage)
         res.end();
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
