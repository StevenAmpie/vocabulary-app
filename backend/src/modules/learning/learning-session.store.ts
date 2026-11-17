import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '../../common/redis.service';
import { LearningSession } from './learning.types';

const SESSION_TTL_SECONDS = 7_200;

@Injectable()
export class LearningSessionStore {
  constructor(private readonly redis: RedisService) {}

  async create(session: LearningSession) {
    await this.save(session);
  }

  async getOptional(sessionId: string): Promise<LearningSession | null> {
    const raw = await this.redis.get(this.key(sessionId));
    if (!raw) return null;
    await this.redis.expire(this.key(sessionId), SESSION_TTL_SECONDS);
    return JSON.parse(raw) as LearningSession;
  }

  async get(sessionId: string): Promise<LearningSession> {
    const session = await this.getOptional(sessionId);
    if (!session) throw new NotFoundException('La sesión no existe o expiró.');
    return session;
  }

  async save(session: LearningSession) {
    await this.redis.set(this.key(session.id), JSON.stringify(session), SESSION_TTL_SECONDS);
  }

  private key(sessionId: string) {
    return `learning:session:${sessionId}`;
  }
}
