import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";

@Injectable()
export class CookieAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const accessToken = request.cookies?.access_token;

    if (!accessToken) {
      const refreshToken = request.cookies?.refresh_token;

      if (!refreshToken) {
        throw new UnauthorizedException("Please login first");
      }

      const refreshPyload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
      });

      const newPayload = {
        email: refreshPyload.email,
        sub: refreshPyload.sub,
        role: refreshPyload.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
        expiresIn: "2m",
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
        expiresIn: "3d",
      });

      response.cookie("access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 2 * 60 * 1000,
      });

      response.cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });

      request.headers.authorization = `Bearer ${newAccessToken}`;
      return true;
    }

    request.headers.authorization = `Bearer ${accessToken}`;

    return true;
  }
}
