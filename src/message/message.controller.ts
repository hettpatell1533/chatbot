import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { MessageService } from './message.service';
import { Response } from 'express';
import { RoomService } from 'src/room/room.service';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly roomService: RoomService,
  ) {}
  
  @Post('')
  async startMessage(@Body() body: { prompt: string; projectId: string; roomId: string }, @Res() res: Response): Promise<void> {
    try {
      let { prompt, projectId, roomId } = body;
      if(!roomId){
        const newRoom = await this.roomService.createRoom(projectId, `${prompt.length > 40 ? prompt.slice(0, 40) + "..." : prompt}`);
        roomId = newRoom.id;
      }
      const response = await this.messageService.aiGeneratedResponse(
        prompt,
        projectId,
        roomId,
        res
      );
      return;
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred while processing the request.',
        error: error.message,
      });
      return;
    }
  }

  @Get(':roomId')
  async getAllMessagesByRoomId(@Param('roomId') roomId: string, @Res() res: Response): Promise<Response> {
    try {
      const messages = await this.messageService.getAllMessagesByRoomId(roomId);
      return res.status(HttpStatus.OK).json({data: messages, message: "Success"});
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An error occurred while processing the request.',
        error: error.message,
      });
    }
  }
}
