import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenService } from 'src/token/token.service';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import * as ms from 'ms';
import { StringValue } from 'ms';
import { TokenType } from 'src/utils/token_type.enum';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: any, @Res() res: Response): Promise<Response> {
    try{
      const user = await this.userService.createUser(registerDto);
      const sendMail = await this.authService.sendVerificationEmail(
        user.email,
      );
      return res.status(201).json({...user, message: 'Check your inbox for verify email'});
    }
    catch (error) {
      return res.status(500).json({ message: error.message, error });
    }
  }

  @Post('login')
  async login(@Body() loginDto: any, @Res() res: Response): Promise<Response> {
    try {
      const user = await this.userService.findUserByEmail(loginDto.email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const auth_token = await this.tokenService.generateAuthToken(user.id, user.is_admin ? 'admin' : 'user');
      res.cookie('access_token', auth_token.access.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ms(this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') as StringValue ?? "30m")
      });
      res.cookie('refresh_token', auth_token.refresh.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') as StringValue ?? "7d")
      });
      return res.status(200).json({
        message: 'Login successful',
        data: {
          ...user
        },
        auth_token,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error logging in user', error });
    }
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: any, @Res() res: Response): Promise<Response> {
    try {
      const result = await this.authService.verifyEmail(body.token,  TokenType.VERIFY_TOKEN);
      res.cookie('auth_token', result.data.access.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ms(this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') as StringValue ?? "30m")
      });
      res.cookie('refresh_token', result.data.refresh.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') as StringValue ?? "7d")
      });
      return res.status(200).json({ message: 'Email verified successfully', result });
    } catch (error) {
      return res.status(500).json({ message: error.message, error });
    }
  }

  @Get('refresh-auth')
  async refreshAuth(@Res() res: Response, @Req() req: Request): Promise<Response> {
    try {
      const result = await this.tokenService.newAuthTokenFromRefreshToken(req.cookies.refresh_token);
      res.cookie('auth_token', result.access.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ms(this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') as StringValue ?? "30m")
      });
      res.cookie('refresh_token', result.refresh.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') as StringValue ?? "7d")
      });
      return res.status(200).json({ message: 'Refresh token successfully', result });
    } catch (error) {
      return res.status(500).json({ message: error.message, error });
    }
  }
}
