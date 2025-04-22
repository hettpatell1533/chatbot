import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenType } from 'src/utils/token_type.enum';
import * as ms from 'ms';
import { JwtPayload } from './token.interface';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    @Inject('ACCESS_JWT') private readonly accessJwt: JwtService,
    @Inject('REFRESH_JWT') private readonly refreshJwt: JwtService,
    @Inject('VERIFY_JWT') private readonly verifyJwt: JwtService,
    @Inject('RESET_JWT') private readonly resetJwt: JwtService,
  ) {}

  async createToken(
    userId: string,
    tokenType: TokenType,
    role: string,
  ) {
    try {
      const secret =
        tokenType === TokenType.ACCESS_TOKEN
          ? this.configService.get<string>('ACCESS_TOKEN_SECRET')
          : tokenType === TokenType.REFRESH_TOKEN
            ? this.configService.get<string>('REFRESH_TOKEN_SECRET')
            : tokenType === TokenType.VERIFY_TOKEN
              ? this.configService.get<string>('VERIFY_TOKEN_SECRET')
              : this.configService.get<string>('FORGOT_PASSWORD_TOKEN_SECRET');

      const payload = {
        sub: userId,
        role: role,
        type: tokenType,
      };

      if(tokenType === TokenType.ACCESS_TOKEN) {
        return await this.accessJwt.signAsync(payload);
      }
      else if(tokenType === TokenType.REFRESH_TOKEN) {
        return await this.refreshJwt.signAsync(payload);
      }
      else if(tokenType === TokenType.VERIFY_TOKEN) {
        return await this.verifyJwt.signAsync(payload);
      }
      else {
        return await this.resetJwt.signAsync(payload);
      }
    } catch (error) {
      throw new Error(`Error creating token: ${error}`);
    }
  }

  async verifyToken(token: string, tokenType: TokenType): Promise<JwtPayload> {
    try {
      const secret =
        tokenType === TokenType.ACCESS_TOKEN
          ? this.configService.get<string>('ACCESS_TOKEN_SECRET')
          : tokenType === TokenType.REFRESH_TOKEN
            ? this.configService.get<string>('REFRESH_TOKEN_SECRET')
            : tokenType === TokenType.VERIFY_TOKEN
              ? this.configService.get<string>('VERIFY_TOKEN_SECRET')
              : this.configService.get<string>('FORGOT_PASSWORD_TOKEN_SECRET');

      const decoded: JwtPayload = this.jwtService.verify(token, {
        secret,
      });
      return decoded;
    } catch (error) {
      throw new Error(`Error verifying token: ${error}`);
    }
  }

  async deleteToken(tokenId: string) {
    try {
      await this.prismaService.token.delete({
        where: { id: tokenId },
      });
    } catch (error) {
      throw new Error(`Error deleting token: ${error}`);
    }
  }

  async findToken(tokenId: string) {
    try {
      const token = await this.prismaService.token.findUnique({
        where: { id: tokenId },
      });
      return token;
    } catch (error) {
      throw new Error(`Error finding token: ${error}`);
    }
  }

  async generateAuthToken(userId: string, role: string) {
    try {
      const access_token = await this.createToken(
        userId,
        TokenType.ACCESS_TOKEN,
        role,
      );

      const refresh_token = await this.createToken(
        userId,
        TokenType.REFRESH_TOKEN,
        role,
      );

      return {
        access: {
          token: access_token,
          expires_in: ms('30m'),
        },
        refresh: {
          token: refresh_token,
          expires_in: ms('7d'),
        },
      };
    } catch (error) {
      throw new Error(`Error generating auth token: ${error}`);
    }
  }

  async newAuthTokenFromRefreshToken(refreshToken: string) {
    try {
      const decoded = await this.verifyToken(
        refreshToken,
        TokenType.REFRESH_TOKEN,
      );
      const userId = decoded.sub;
      const role = decoded.role;

      const newAuthToken = await this.generateAuthToken(userId, role);

      return newAuthToken;
    } catch (error) {
      throw new Error(`Error generating new auth token: ${error}`);
    }
  }

  async isTokenExpired (token: string) {
    try {
      const decoded = this.jwtService.decode(token);
      const exp = decoded['exp'];
      const currentTime = Math.floor(Date.now() / 1000);
      return exp < currentTime;
    } catch (error) {
      throw new Error(`Error checking token expiration: ${error}`);
    }
  }
}
