import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { MailService } from './mailer/mailer.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MorganMiddleware } from './utils/morgan.middleware';

@Module({
  imports: [
    ChatModule,
    DashboardModule,
    PrismaModule,
    AstModule,
    MessageModule,
    RoomModule,
    UsersModule,
    AuthModule,
    TokenModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: `smtps://het.patel@rlogical.com:gfba%20wwhl%20zdgs%20fnty@smtp.gmail.com`,
        defaults: {
          from: '"ReCode.ai" <noreply@gmail.com>',
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes("*");
  }
}
