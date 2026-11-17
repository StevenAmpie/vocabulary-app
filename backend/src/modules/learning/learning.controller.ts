import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateLearningSessionDto } from './dto/create-learning-session.dto';
import { RecordAttemptDto } from './dto/record-attempt.dto';
import { LearningService } from './learning.service';

@ApiTags('learning')
@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Post('sessions')
  createSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateLearningSessionDto,
  ) {
    return this.learningService.createSession(user.id, body);
  }

  @Get('sessions/:sessionId/next')
  getNextExercise(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
  ) {
    return this.learningService.getNextExercise(user.id, sessionId);
  }

  @Put('sessions/:sessionId/attempts/:attemptId')
  recordAttempt(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Param('attemptId', new ParseUUIDPipe()) attemptId: string,
    @Body() body: RecordAttemptDto,
  ) {
    return this.learningService.recordAttempt(
      user.id,
      sessionId,
      attemptId,
      body,
    );
  }

}
