import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { RoomModule } from 'src/room/room.module';

@Module({
  imports: [RoomModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
