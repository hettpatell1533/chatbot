import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [UsersModule, JwtModule, TokenModule],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
