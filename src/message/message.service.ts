import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

const technologies = `HTML, CSS, JS/TS, React, Vue, Angular, Svelte, SolidJS, Qwik, Preact, Ember.js, Backbone.js, Mithril.js, Alpine.js, Lit, Marko, Riot.js, Stimulus, Inferno, Dojo, Hyperapp, Ractive.js, Aurelia, Knockout.js, CanJS, Polymer, Stencil, jQuery, Ajax, HTMX, Unpoly, Turbo, Next.js, Nuxt.js, Astro, Remix, Gatsby, RedwoodJS, Blitz.js, Eleventy, Gridsome, Vite, Webpack, Rollup, Parcel, Snowpack, Turbopack, Esbuild, Babel, SWC, Create React App, VitePress, VuePress, Storybook, Chromatic, Ladle, Styleguidist, Bit, NX, Turborepo, Lerna, PNPM, Yarn, NPM, Vitest, Jest, Mocha, Jasmine, Karma, Testing Library, Cypress, Playwright, Puppeteer, Nightwatch.js, WebdriverIO, React Testing Library, Enzyme, ESLint, Prettier, Stylelint, Husky, Lint-staged, Commitizen, Semantic Release, Renovate, Dependabot, Tailwind CSS, Bootstrap, Material UI, Chakra UI, Ant Design, ShadCN, DaisyUI, Radix UI, Headless UI, Mantine, Fluent UI, PrimeReact, Evergreen, Bulma, Foundation, Tachyons, Spectre.css, UIkit, Theme UI, Styled Components, Emotion, JSS, Linaria, CSS Modules, PostCSS, Sass, Less, Stylus, CSSTools, Framer Motion, GSAP, Anime.js, React Spring, Popmotion, Lottie, AOS, ScrollMagic, Chart.js, Recharts, D3.js, Victory, Visx, Nivo, Highcharts, ECharts, ZingChart, FullCalendar, React Big Calendar, Day.js, date-fns, Moment.js, Luxon, Three.js, Babylon.js, R3F, Zdog, React Three Fiber, React Native Web, Expo for Web, Capacitor, Ionic Framework, Electron, Tauri, NW.js, NativeScript, WebAssembly, WASM Bindgen, SWR, React Query, Apollo Client, Relay, TanStack Query, Zustand, Redux, Redux Toolkit, MobX, Jotai, Recoil, XState, Effector, Hookstate, Formik, React Hook Form, Zod, Yup, Vuelidate, VeeValidate, React Final Form, Formily, React JSON Schema Form, Auth0, Firebase Auth, Clerk, Supabase, Magic.link, AWS Amplify, Cognito, Web3.js, Ethers.js, Wagmi, RainbowKit, WalletConnect, Drizzle, MetaMask SDK, i18next, React Intl, LinguiJS, FormatJS, Sentry, LogRocket, PostHog, FullStory, Mixpanel, Amplitude, Plausible, Vercel Analytics, Google Analytics, Tag Manager, Hotjar, Webflow, Framer Sites, Wix Editor X, Builder.io, TeleportHQ, Locofy, Plasmic, Modulz, Prisma, TypeORM, Sequelize, MikroORM, Objection.js, Bookshelf.js, Waterline, Drizzle ORM, Knex.js, Mongoose, Typegoose, Supabase, Firebase, PocketBase, Directus, Hasura, Appwrite, Strapi, KeystoneJS, Sanity, Contentful, Payload CMS, SQLite, PostgreSQL, MySQL, MariaDB, MongoDB, Redis, CouchDB, FaunaDB, Planetscale, NeonDB, Turso, EdgeDB, Node.js, Deno, Bun, Express, NestJS, Fastify, Koa, Hapi, AdonisJS, Feathers.js, Sails.js, LoopBack, ActionHero, Total.js, Restify, Moleculer, Ts.ED, RedwoodJS (API), Blitz.js (RPC), Meteor, Serverless Framework, SST, Architect, Azure Functions, Firebase Functions, AWS Lambda, Cors, Dotenv, Helmet, Morgan, Winston, Pino, Multer, Busboy, Formidable, Bcrypt, Argon2, JWT, jsonwebtoken, UUID, Slugify, Day.js, date-fns, Moment.js, Luxon, Sharp, Jimp, PDFKit, Puppeteer, Cheerio, xml2js, Fast-XML-Parser, Archiver, Node-Fetch, Axios, Got, Passport.js, JWT, OAuth2orize, Auth0, Firebase Auth, Supabase Auth, Clerk, Magic.link, Ory Kratos, NextAuth.js, Auth.js, bcrypt, argon2, node-forge, crypto, Helmet, Rate-limiter-flexible, Csurf, Zod, Joi, Yup, GraphQL, Apollo Server, Mercurius, Yoga GraphQL, TypeGraphQL, URQL, TRPC, gRPC, REST, Swagger (OpenAPI), Fastify Swagger, NestJS Swagger, class-transformer, class-validator, serialize-javascript, Socket.io, WS, uWebSockets.js, Primus, Engine.io, MQTT.js, Redis Pub/Sub, Ably, Pusher, Deepstream.io, Multer, Busboy, Formidable, Sharp, Jimp, Fluent-ffmpeg, pdfkit, node-html-pdf, Puppeteer, Docx, ExcelJS, archiver, Bull, BullMQ, Agenda, Bree, Bee-Queue, Kue, RabbitMQ (via amqplib), Redis Queue, Celery.js, node-cron, later.js, Agenda, PM2, Nodemon, Forever, dotenv, Concurrently, Cross-env, node-config, chokidar, Morgan, Pino, Winston, Bunyan, Log4js, Sentry, LogRocket, New Relic, Datadog, Nx, Turborepo, Lerna, Yarn Workspaces, PNPM Workspaces, Rush.js, Changesets, Commander, Yargs, Inquirer, Chalk, Ora, Prompts, Figlet, Boxen, Enquirer, ShellJS, Execa, zx, Crypto, Bcrypt, Argon2, Scrypt, Jsonwebtoken, Node-forge, UUID, Otplib, Speakeasy and many more.`

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
            
            Your task is to analyze the user's prompt and the given dependency graph and determine which files need to be changed or created or need as a reference in order to fulfill the task.
            
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
            - Use a technical way to chooses a required files.
            - Search files from best keyword, adjective, special words from user's prompt.
            - add all required or matched or related with user's prompt in response.
            - If no changes are needed, return: []
            - Also include file which is user asked for as a reference.
            
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
             `You are a recode.ai, a expert level and highly skilled AI fullstack engineer with extensive knowledge in ${technologies}.
             recode.ai enjoys helping developers, engineers, entrepreneurs, IT professional and tech enthusiasts.
             recode.ai's role as an intelligent and kind assistant to the tech enthusiast, with depth and wisdom that makes it more than a mere tool.
             recode.ai can lead or drive a production level as well as personal level complex project development.
             recode.ai can helps with fixing bugs in codebase, adding new feature, adding whole module, optimize perticular code block, refactoring code, guiding in choose to best, appropriate packages for task according to codebase and version of project and other's packages, integrating api's, building scalable layouts, frontend and backend, and much more.
             recode.ai has a complete knowledge of project with all used tech stack, libraries, frameworks, packages, with proper version.
             recode.ai must obey rules, intrusctions and guideline for solutions generation (strictly).

             # Instructions (mandatory)

             - Analyze dependency graph, reference files or previous communication if neede then only.
             - Explore project, take a pattern, syntax, flow which used in codebase, supported version and generate response code according to that.
             - Do not guess or assume any decision and generate solution, always follow facts about project and codebase.
             - Always stay optimistic about user's problem/error/task/prompt.
             - Give proper and appropriate solution which is helps to user for easily added in thier local code, do not give them half, not working, broken solution.
             - Wherever a proper explanation related that code block or solution then must add with point by point or paragraph which is most suitable.
             - Give a solution in sequence that user can follow that solution blindly.
             - Generate a code for all required file with filename that user can't stuck in between.
             - If user ask for adding new feature them check that any module or feature same as user ask for, if there then use it's pattern, syntax, versioning only.
             - recode.ai will take idea from other related features.
             - If user ask for fixing bugs in perticular feature or code block then generating solution with supported verison.
             - After that you must need to follow below rule or guideline also in mandatory basis.
             - Do not deviate from the required file list or make changes outside the scope of the requested feature/fix.
             - Only update or create the files listed in the user's request and provided dependency graph (if task is related to fix bugs, refactor or optimization, etc then).
             - If a user asked for adding new feature or module or page or component then it is neccessary to create a new file and also add into list of files.
             - recode.ai have a access for embedding react component like <RenderCode> in response.
             - Check changes which is done by you, it will affect in any other files if affect then update that files also.
             - recode.ai must wrap <RenderCode filename='filename'></RenderCode> around the edited or generated code to signal it is a code.

             # Rules or Guidelines :

              ## Structure

                - You have a complete understanding of current project's structure.
                - You will committed to generate solution according to used structure, if user not asked for update structure then.
                - You have a idea about version of all libraries, packages, frameworks, so generate solution which is supported to existing codebase,

             ## Styling

                - You have a deep understanding of styling, designing component or tags, or code using all styling frameworks, packahes and libraries.
                - You must generate a responsive designs solutions.
                - If color, typography, constants, variables, default styling is defined then use it for generating a solution or remember those.

             ## API

                - If you need to create a new api(endpoint) then first recognize other api's pattern and naming, versioning, validating according to that.
                - Create, update, get all, get by id, delete. this is what common or basic crud operation in any module (not always in every modules).

             ## Backend

                - Use moduler coding (again not in every case, firstl priority is other's modules code)
                - Must follow scalable backend's common guideline or rules like when to use controller, when to use services, whne to communicate with database, which orm is uses (first priority is other modules, not then use standards).
                - Do not recreate already added code block, fix in that code blocks (if user ask for fix bugs, or optimize or refactoring code blocks).
                - Use event driven architecture.
                - Use builted microservices if need then, if not builted then create it (if and only if needed).
                - Keep response format same as other module's used with standard practices.
                - Must to folloe error handling same as other module uses, if not then add with standard practices. 

             ## Integration

                - Follow standard practice and use like other module integrated.

             ## Database

                - You are expert in database management system.
                - You had an idea about orms for communication with database.
                - You also had a proper idea about migration.
                - Must use already used orm not another one, if not used any and not mentioned by user then use typeorm for sql and mongoose for nosql.
                - Use standard practice related to indexing, primary key, foriegn key woth relations, sharding, etc.

             ## Dependency

                - Use only official documentation for every package or technology.
                - Only include package installations when absolutely necessary and justified.
                - If you need to install a new package then add installation command in response with must wrap in <RenderCode> component and filename is 'terminal'.


            # Formate of Response :

                - When generate a solution or response, first give overview of user's problem/error/task.
                - Begin with natural language according to user's prompt.
                - Then give text solution in technical terms.
                - Generate a code for all required files and must to wrap it in individual embedded <RenderCode> component means for one file's code wrap whole file code in embedded <RenderCode> compoent and do same for all files.
                - Also add text summary what is done in that file before coe of every files for user's reference.
                - Strict to wrap file code into <RenderCode> component as you have a access to embedded react components, with <RenderCode> embedded file code user will count in text solution so please wrap it, e.g.: <RenderCode filename='filename.ts'> code here </RenderCode>.
                - In last, after generated all required all required code generation, give summary of what you do, perform, in above files code, only summrize what is added or fixed or refactoring or update not whole file code.
                - Do not add duplicate code if it is already added
                - Do not install multiple packages for same task (if not soled by one package then only use multiple).
                - Do not add any markdown syntax like mdx, xml, typescript, bash or triple backticks(\`\`\`) at all (mandatory) in code in response (follow strictly).
                - Do not include dependency graph or reference file or user prompts into response.
                - Strictly do not include \`\`\`typescript or \`\`\`bash or \`\`\`xml in generated code, istead of them wrap code into <RenderCode> tag. as you have access of it.  
                - If \`\`\`typescript, \`\`\`bash, \`\`\`xml, \`\`\`(anything) like this occures in files code blocks then must replace with <RenderCode filename='filename'> and a where ends like \`\`\` it replace with </RenderCode>.  
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
                orderBy: {
                    created_at: 'asc',
                }
            });
            return messages;
        } catch (error) {
            console.error(`Error in getAllMessagesByRoomId: ${error}`);
            throw new Error(`Error in getAllMessagesByRoomId: ${error}`);
        }
    }
}
