import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private connected = false;

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('DATABASE_URL is required when NODE_ENV=production');
      }
      console.warn('DATABASE_URL no está configurado; los módulos que usan Prisma no estarán disponibles.');
      return;
    }

    await this.$connect();
    this.connected = true;
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.$disconnect();
    }
  }
}
