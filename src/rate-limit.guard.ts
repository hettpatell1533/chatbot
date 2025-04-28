// src/common/guards/rate-limit.guard.ts
import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

interface RateLimitRecord {
  lastRequestTime: number;
  requestCount: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limitWindowMs = 60 * 1000;
  private readonly maxRequests = 5;
  private readonly clients: Map<string, RateLimitRecord> = new Map();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    if(!ip) {
      return false;
    }

    const now = Date.now();
    const clientRecord = this.clients.get(ip as string);

    if (clientRecord) {
      if (now - clientRecord.lastRequestTime < this.limitWindowMs) {
        // Same window
        if (clientRecord.requestCount >= this.maxRequests) {
          throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
        }
        clientRecord.requestCount++;
      } else {
        // New window
        clientRecord.lastRequestTime = now;
        clientRecord.requestCount = 1;
      }
    } else {
      // First time
      this.clients.set(ip as string, { lastRequestTime: now, requestCount: 1 });
    }

    return true;
  }
}
