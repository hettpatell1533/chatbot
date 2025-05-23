import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AstModule } from 'src/ast/ast.module';
import { TokenModule } from 'src/token/token.module';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  imports: [AstModule, TokenModule, JwtModule, CacheModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
