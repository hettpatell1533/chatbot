// src/cache/cache.module.ts

import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

@Module({
  imports: [
    NestCacheModule.register({
      store: 'redis',
      host: 'localhost', // Redis server host
      port: 6379, // Redis server port
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
