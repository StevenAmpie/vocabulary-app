import { Module } from '@nestjs/common';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import { LearningSessionStore } from './learning-session.store';

@Module({
  controllers: [LearningController],
  providers: [LearningService, LearningSessionStore],
})
export class LearningModule {}
