// src/gemini/gemini.service.ts

import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as genai from '@google/generative-ai';

@Injectable()
export class ChatService {
  private readonly model;

  constructor() {
    const apiKey = "AIzaSyC5K-3FzhFVJ2jGcOdjyn4JzhthxeVhf8I";
    
    const genAI = new genai.GoogleGenerativeAI(apiKey!);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async analyzeImage(image: Buffer<ArrayBufferLike>, dictOfVars?: Record<string, any>) {
    const dictOfVarsStr = JSON.stringify(dictOfVars, null, 2);
    const prompt = `
You are a highly precise frontend expert.

Your only task is to analyze the attached image and generate frontend code that **exactly replicates the image layout and design, pixel by pixel**.

🔒 Strict Guidelines:
1. **DO NOT guess or imagine** features or styles not visible in the image.
2. Reproduce the UI layout, spacing, colors, text, fonts, and positioning **exactly as seen**.
3. Use only:
   - **Next.js 15**
   - **Tailwind CSS**
   - **TypeScript**
   - ShadCN UI (only if it matches what’s in the image)
4. Do not be creative. **Match the visual structure perfectly.**
5. If anything is unclear in the image (e.g. blurry text), use a **clearly marked placeholder** like "???" or "Placeholder".
6. Generate the project **file by file** — each file should be:
   - Fully valid
   - Production-ready
   - Complete and buildable with no missing pieces
7. Return the output in **valid MDX** format with filenames and Markdown code blocks (e.g., \`\`\`tsx).

🛑 Do NOT:
- Add your own design decisions
- Add features not shown
- Add unnecessary dependencies

✅ DO:
- Follow the structure and visuals literally
- Ensure correct folder and file structure
- Write only the code — no descriptions or explanations

📦 Final Output Format:
- Filename
- Markdown code block (with correct language)
- Repeat per file

EXAMPLE:
\`\`\`tsx filename=app/page.tsx
// code here
\`\`\`

Your job is to turn this UI image into a 100% accurate frontend project.
`;

    const result = await this.model.generateContent({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/png',
                data: image.toString('base64'),
              },
            },
          ],
        },
      ],
    });

    let answers: any[] = [];

    try {
      answers = result.response.text();
    } catch (err) {
      console.error('Error parsing Gemini response:', err);
      return [];
    }

    return answers;
  }
}
