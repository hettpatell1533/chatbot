import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AstModule } from 'src/ast/ast.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [AstModule, JwtModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
