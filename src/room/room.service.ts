import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoom } from './room.interface';

@Injectable()
export class RoomService {
    constructor(
            private readonly prismaService: PrismaService,
        ){}

    async createRoom(roomData: CreateRoom) {
        try{
            const newRoom = await this.prismaService.room.create({
                data: roomData,
            });
            return newRoom;
        }
        catch(error){
            throw new Error(`Error creating room: ${error}`);
        }
    }

    async getRoomById(roomId: string) {
        try{
            const room = await this.prismaService.room.findUnique({
                where: {
                    id: roomId,
                },
            });
            return room;
        }
        catch(error){
            throw new Error(`Error getting room: ${error}`);
        }
    }

    async getAllRoomsByProjectId(projectId: string) {
        try{
            const rooms = await this.prismaService.room.findMany({
                where: {
                    project_id: projectId,
                },
            });
            return rooms;
        }
        catch(error){
            throw new Error(`Error getting rooms: ${error}`);
        }
    }

    async deleteRoom(roomId: string, projectId: string) {
        try{
            const room = await this.prismaService.room.delete({
                where: {
                    id: roomId,
                    project_id: projectId
                },
            });
            return room;
        }
        catch(error){
            throw new Error(`Error deleting room: ${error}`);
        }
    }
}
