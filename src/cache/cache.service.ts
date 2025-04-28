// src/cache/cache.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor( @Inject('CACHE_MANAGER') private readonly cacheManager: Cache,) {}

  async setCache(key: string, value: any, ttl?: number) {
    await this.cacheManager.set(key, value);
  }

  async getCache(key: string) {
    return await this.cacheManager.get(key);
  }

  async delCache(key: string) {
    await this.cacheManager.del(key);
  }
}
