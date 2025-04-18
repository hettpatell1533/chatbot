import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import * as sharp from 'sharp';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('')
  async chat(@Body() body: { image: string; dictOfVars: any }) {
    try{
      const { image, dictOfVars } = body;
      const base64Image = image.split(',')[1];
    const buffer = Buffer.from(base64Image, 'base64');

    // Convert buffer to image using sharp
    const images = await sharp(buffer).toBuffer();
    const response = await this.chatService.analyzeImage(images, dictOfVars);
    return response;
    } catch (err) {
      console.error('Error in chat:', err);
      throw new Error('Error in chat');
    }
  }
}
