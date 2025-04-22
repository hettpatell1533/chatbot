import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as morgan from 'morgan';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  private readonly morganInstance: morgan.Morgan;

  constructor() {
    this.morganInstance = morgan('combined');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.morganInstance(req, res, next);
  }
}
