import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('REFRESH_TOKEN_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('VERIFY_TOKEN_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_VERIFICATION_TOKEN_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('RESET_TOKEN_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_RESET_TOKEN_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TokenController],
  providers: [TokenService, {
    provide: 'ACCESS_JWT',
    useFactory: async (configService: ConfigService) => {
      return new JwtService({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') },
      });
    },
    inject: [ConfigService],
  },
  {
    provide: 'REFRESH_JWT',
    useFactory: async (configService: ConfigService) => {
      return new JwtService({
        secret: configService.get<string>('REFRESH_TOKEN_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') },
      });
    },
    inject: [ConfigService],
  },
  {
    provide: 'VERIFY_JWT',
    useFactory: async (configService: ConfigService) => {
      return new JwtService({
        secret: configService.get<string>('VERIFY_TOKEN_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_VERIFICATION_TOKEN_EXPIRATION') },
      });
    },
    inject: [ConfigService],
  },
  {
    provide: 'RESET_JWT',
    useFactory: async (configService: ConfigService) => {
      return new JwtService({
        secret: configService.get<string>('RESET_TOKEN_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_RESET_TOKEN_EXPIRATION') },
      });
    },
    inject: [ConfigService],
  },],
  exports: [TokenService, 'ACCESS_JWT', 'REFRESH_JWT', 'VERIFY_JWT', 'RESET_JWT'],
})
export class TokenModule {}
