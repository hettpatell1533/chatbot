import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module';
import { AstModule } from './ast/ast.module';
import { RedisModule } from './redis/redis.module';
import { MessageModule } from './message/message.module';
import { RoomModule } from './room/room.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ChatModule, DashboardModule, PrismaModule, AstModule, MessageModule, RoomModule, UsersModule, AuthModule, TokenModule, ConfigModule.forRoot({
    isGlobal: true,
  }),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
