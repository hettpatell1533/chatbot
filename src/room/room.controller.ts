import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { RoomService } from './room.service';
import { Response } from 'express';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get(':projectId')
  async getAllRoomsByProjectId(@Param('projectId') projectId: string, @Res() res: Response): Promise<Response> {
    try{
      const rooms = await this.roomService.getAllRoomsByProjectId(projectId);
      return res.status(HttpStatus.OK).json({data: rooms, message: "Fetched rooms successfully"});
    }
    catch(error){
      throw new Error(`Error getting rooms: ${error}`);
    }
  }
}
