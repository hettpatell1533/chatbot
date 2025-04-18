import { Test, TestingModule } from '@nestjs/testing';
import { AstController } from './ast.controller';
import { AstService } from './ast.service';

describe('AstController', () => {
  let controller: AstController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AstController],
      providers: [AstService],
    }).compile();

    controller = module.get<AstController>(AstController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
