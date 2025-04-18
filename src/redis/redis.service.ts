import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redis: Redis;

  onModuleInit() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
      db: 0,
    });
    console.log('Redis connected');
  }

  get client(): Redis {
    return this.redis;
  }
}
