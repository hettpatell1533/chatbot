import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { TokenType } from 'src/utils/token_type.enum';
import { TokenService } from 'src/token/token.service';
import * as ms from 'ms';
import { MailService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private configService: ConfigService,
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  async registerUser(userData: any): Promise<any> {
    try {
      const result = await this.prismaService.$transaction(async (prisma) => {
        const user = await this.userService.createUser(userData);
        const auth_token = await this.tokenService.generateAuthToken(
          user.id,
          user.is_admin ? 'admin' : 'user',
        );
        const sendMail = await this.sendVerificationEmail(
          user.email,
        );
        return {
          message: sendMail.message,
          user: {
            id: user.id,
            email: user.email,
            is_admin: user.is_admin,
          },
          auth_token,
        };
      });
    } catch (error) {
      throw new Error(`Error registering user: ${error.message}`);
    }
  }

  async loginUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findUserByEmail(email);

      if (!user) {
        throw new Error('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      const { password: _, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Error logging in user: ${error.message}`);
    }
  }

  async sendVerificationEmail(email: string): Promise<any> {
    try {
      
      const user = await this.userService.findUserByEmail(email);

      if (!user) {
        throw new Error('User not found');
      }

      const verificationToken = await this.tokenService.createToken(
        user.id,
        TokenType.VERIFY_TOKEN,
        user.is_admin ? 'admin' : 'user',
      );

      await this.mailService.sendVerificationEmail(email, verificationToken);

      return { message: 'Verification email sent successfully' };
    } catch (error) {
      throw new Error(`Error sending verification email: ${error.message}`);
    }
  }

  async verifyEmail(token: string, type: TokenType): Promise<any> {
    try {
      const decodedToken = await this.tokenService.verifyToken(
        token,
        type
      );

      if (!decodedToken) {
        throw new Error('Invalid token');
      }

      const user = await this.userService.findUserById(decodedToken.sub);

      if (!user) {
        throw new Error('User not found');
      }

      await this.userService.updateUser(user.id, { is_verified: true });

      const authToken = await this.tokenService.generateAuthToken(
        user.id,
        user.is_admin ? 'admin' : 'user',
      );

      return { data: authToken,message: 'Email verified successfully' };
    } catch (error) {
      throw new Error(`Error verifying email: ${error.message}`);
    }
  }
}
