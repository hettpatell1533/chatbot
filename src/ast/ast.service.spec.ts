import { Test, TestingModule } from '@nestjs/testing';
import { AstService } from './ast.service';

describe('AstService', () => {
  let service: AstService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AstService],
    }).compile();

    service = module.get<AstService>(AstService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
