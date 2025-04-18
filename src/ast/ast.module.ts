import { Module } from '@nestjs/common';
import { AstService } from './ast.service';
import { AstController } from './ast.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AstController],
  providers: [AstService, PrismaService],
  exports: [AstService],
})
export class AstModule {}
