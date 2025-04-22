import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenModule } from 'src/token/token.module';
import { UsersModule } from 'src/users/users.module';
import { CookieAuthGuard } from './token.guard';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from 'src/mailer/mailer.service';
import { JwtStrategy } from './jwt.strategy';


@Module({
  imports: [TokenModule, UsersModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, CookieAuthGuard, MailService, JwtStrategy],
})
export class AuthModule {}
