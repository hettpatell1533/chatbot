import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenModule } from 'src/token/token.module';
import { UsersModule } from 'src/users/users.module';
import { CookieAuthGuard } from './token.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TokenModule, UsersModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, CookieAuthGuard],
})
export class AuthModule {}
