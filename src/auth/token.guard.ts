import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenService } from 'src/token/token.service';
import { TokenType } from 'src/utils/token_type.enum';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenService: TokenService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const accessToken = request.cookies?.access_token;

    if (!accessToken || await this.tokenService.isTokenExpired(accessToken)) {
      const refreshToken = request.cookies?.refresh_token;

      if (!refreshToken || await this.tokenService.isTokenExpired(refreshToken)) {
        throw new UnauthorizedException('Please login first');
        return false;
      }

      const refreshPyload = await this.tokenService.verifyToken(
        refreshToken,
        TokenType.REFRESH_TOKEN,
      );

      const newPayload = {
        sub: refreshPyload.sub,
        role: refreshPyload.role,
        type: TokenType.ACCESS_TOKEN,
      };

      const newAuthToken = await this.tokenService.generateAuthToken(
        newPayload.sub,
        newPayload.role,
      );

      const newAccessToken = this.tokenService.createToken(
        newPayload.sub,
        TokenType.ACCESS_TOKEN,
        newPayload.role,
      );

      const newRefreshToken = this.tokenService.createToken(
        newPayload.sub,
        TokenType.REFRESH_TOKEN,
        newPayload.role,
      );

      response.cookie('access_token', newAuthToken.access.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: newAuthToken.access.expires_in,
      });

      response.cookie('refresh_token', newAuthToken.refresh.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: newAuthToken.refresh.expires_in,
      });

      request.headers.authorization = `Bearer ${newAccessToken}`;

      return true;
    }

    request.headers.authorization = `Bearer ${accessToken}`;
    return true;
  }
}
