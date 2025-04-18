import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenService } from 'src/token/token.service';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import ms from 'ms';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly userService: UsersService
  ) {}

  @Post('register')
  async register(@Body() registerDto: any, @Res() res: Response): Promise<Response> {
    try{
      const registeredUser = await this.authService.registerUser(registerDto);
      return res.status(201).json({...registeredUser});
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
      res.cookie('auth_token', auth_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ms('30m'),
      });
      res.cookie('refresh_token', auth_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ms('7d'),
      });
      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          is_admin: user.is_admin,
        },
        auth_token,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error logging in user', error });
    }
  }
}
