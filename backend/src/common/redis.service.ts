import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;
  private connected = false;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('REDIS_URL') ?? 'redis://127.0.0.1:6379';
    this.client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
    });
  }

  async onModuleInit() {
    await this.client.connect();
    this.connected = true;
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.client.quit();
    }
  }

  get(key: string) {
    return this.client.get(key);
  }

  set(key: string, value: string, ttlSeconds: number) {
    return this.client.set(key, value, 'EX', ttlSeconds);
  }

  async getAndDelete(key: string): Promise<string | null> {
    return (await this.client.call('GETDEL', key)) as string | null;
  }

  delete(key: string) {
    return this.client.del(key);
  }

  expire(key: string, ttlSeconds: number) {
    return this.client.expire(key, ttlSeconds);
  }
}
