import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private configService: ConfigService,
    private readonly prismaService: PrismaService
  ) {
    super({
      jwtFromRequest: req => {
        if (!req.headers.authorization) {
          return null;
        }
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: true,
      secretOrKey: configService.get<string>("ACCESS_TOKEN_SECRET"),
    });
  }

  async validate(payload: any) {
    const { sub, email, role } = payload;

    if (!sub || !email) {
      throw new UnauthorizedException("Invalid token payload");
    }

    const user = await this.prismaService.user.findFirst({ where: { id: sub } });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }
}
