import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../common/prisma.service';
import { activeVerbSlugs } from '../../common/verb-catalog';
import { CreateLearningSessionDto } from './dto/create-learning-session.dto';
import { RecordAttemptDto } from './dto/record-attempt.dto';
import { consecutiveDayCount, nextReviewDate, stateForSuccessCount } from './learning.rules';
import { LearningSessionStore } from './learning-session.store';
import {
  CreateLearningSessionResponse,
  LearningSession,
  NextExerciseResponse,
  RecordAttemptResponse,
  SessionExercise,
  WordState,
} from './learning.types';

@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: LearningSessionStore,
  ) {}

  async createSession(
    userId: string,
    dto: CreateLearningSessionDto,
  ): Promise<CreateLearningSessionResponse> {
    const categorySlug = dto.categorySlug ?? 'technology';
    const allWords = await this.prisma.word.findMany({
      where: { OR: [{ categorySlug: { not: 'verbs' } }, { slug: { in: activeVerbSlugs() } }] },
      orderBy: [{ category: { displayOrder: 'asc' } }, { difficultyScore: 'asc' }],
    });
    const categoryWords = allWords.filter((word) => word.categorySlug === categorySlug);
    if (categoryWords.length === 0) {
      throw new BadRequestException(`No hay ejercicios disponibles para la categoría "${categorySlug}".`);
    }

    let selectedWords = (categorySlug === 'verbs' ? this.shuffle(categoryWords) : categoryWords)
      .slice(0, dto.targetWordCount ?? Math.min(10, categoryWords.length));
    if (dto.wordId) {
      const requested = allWords.find((word) => word.id === dto.wordId);
      if (!requested) throw new NotFoundException('La palabra solicitada no existe.');
      selectedWords = [requested];
    }

    const exercises: SessionExercise[] = selectedWords.map((word, index) => {
      const sameCategory = categoryWords.filter((candidate) => candidate.id !== word.id);
      const fallback = allWords.filter(
        (candidate) => candidate.id !== word.id && !sameCategory.some(({ id }) => id === candidate.id),
      );
      const distractors = this.shuffle([...sameCategory, ...fallback]).slice(0, 3);
      return {
        id: randomUUID(),
        wordId: word.id,
        optionIds: this.shuffle([word, ...distractors]).map(({ id }) => id),
        mode: word.categorySlug !== 'verbs' ? 'image-to-word'
          : index % 3 === 1 ? 'word-to-image'
          : index % 3 === 2 ? 'translation-to-word'
          : 'image-to-word',
      };
    });

    const sessionId = randomUUID();
    const session: LearningSession = {
      id: sessionId,
      userId,
      queue: exercises,
      initialExerciseIds: exercises.map(({ id }) => id),
      processedInitialExerciseIds: [],
      requeuedWordIds: [],
      total: exercises.length,
    };
    await this.sessions.create(session);
    return { sessionId, total: exercises.length, remaining: exercises.length };
  }

  async getNextExercise(userId: string, sessionId: string): Promise<NextExerciseResponse | null> {
    const session = await this.getOwnedSession(userId, sessionId);
    const current = session.queue[0];
    if (!current) return null;

    const word = await this.prisma.word.findUnique({ where: { id: current.wordId } });
    if (!word) throw new NotFoundException('La palabra del ejercicio ya no está disponible.');
    const options = await this.prisma.word.findMany({ where: { id: { in: current.optionIds } } });
    const optionsById = new Map(options.map((option) => [option.id, option]));

    return {
      exercise: {
        id: current.id,
        mode: current.mode ?? 'image-to-word',
        prompt: current.mode === 'word-to-image'
          ? `¿Cuál imagen representa la acción «${word.termEn}»?`
          : current.mode === 'translation-to-word'
            ? `¿Cómo se dice «${word.translationEs}» en inglés?`
          : '¿Qué término en inglés representa esta imagen?',
        termEn: current.mode === 'word-to-image' ? word.termEn : undefined,
        translationEs: current.mode === 'translation-to-word' ? word.translationEs : undefined,
        phoneticIpa: current.mode === 'word-to-image' ? word.phoneticIpa : undefined,
        imageUrl: current.mode === 'image-to-word' ? word.imageUrl : '',
        imageDescription: current.mode === 'image-to-word' ? word.imageDescription : '',
        audioUrl: current.mode === 'translation-to-word' ? undefined : word.audioUrl,
        options: current.optionIds.map((id) => ({
          id,
          label: optionsById.get(id)?.termEn ?? '—',
          imageUrl: current.mode === 'word-to-image' ? optionsById.get(id)?.imageUrl : undefined,
          imageDescription: current.mode === 'word-to-image' ? optionsById.get(id)?.imageDescription : undefined,
        })),
      },
      session: {
        position: Math.min(session.processedInitialExerciseIds.length + 1, session.total),
        total: session.total,
      },
    };
  }

  async recordAttempt(
    userId: string,
    sessionId: string,
    attemptId: string,
    request: RecordAttemptDto,
  ): Promise<RecordAttemptResponse> {
    const existing = await this.prisma.learningAttempt.findUnique({
      where: { clientAttemptId: attemptId },
    });
    if (existing) {
      if (
        existing.userId !== userId ||
        existing.sessionId !== sessionId ||
        existing.exerciseId !== request.exerciseId ||
        existing.selectedOptionId !== request.selectedOptionId ||
        existing.responseTimeMs !== request.responseTimeMs
      ) {
        throw new ConflictException('El attemptId ya fue utilizado con una solicitud diferente.');
      }
      const response = existing.resultPayload as unknown as RecordAttemptResponse;
      const activeSession = await this.sessions.getOptional(sessionId);
      if (activeSession?.userId === userId) {
        await this.advanceSession(activeSession, request.exerciseId, response.shouldRequeue);
      }
      return response;
    }

    const session = await this.getOwnedSession(userId, sessionId);
    const current = session.queue[0];
    if (!current || current.id !== request.exerciseId) {
      throw new ConflictException('Ese ejercicio ya no es el reto actual de la sesión.');
    }
    if (!current.optionIds.includes(request.selectedOptionId)) {
      throw new BadRequestException('La opción seleccionada no pertenece al ejercicio actual.');
    }

    const word = await this.prisma.word.findUnique({
      where: { id: current.wordId },
      include: {
        sentences: {
          where: { isTargetWord: true },
          take: 1,
          include: { sentence: { include: { words: true } } },
        },
      },
    });
    if (!word) throw new NotFoundException('La palabra del ejercicio ya no está disponible.');

    const correct = request.selectedOptionId === word.id;
    const shouldRequeue = !correct && !session.requeuedWordIds.includes(word.id);
    const response = await this.prisma.$transaction(async (transaction) => {
      const now = new Date();
      let progress: RecordAttemptResponse['progress'];
      let previousState: WordState | null = null;
      let resultingState: WordState | null = null;

      if (correct) {
        const currentProgress = await transaction.userWordProgress.findUnique({
          where: { userId_wordId: { userId, wordId: word.id } },
        });
        previousState = (currentProgress?.state as WordState | undefined) ?? null;
        const successCount = (currentProgress?.directSuccessCount ?? 0) + 1;
        resultingState = stateForSuccessCount(successCount);
        await transaction.userWordProgress.upsert({
          where: { userId_wordId: { userId, wordId: word.id } },
          create: {
            userId,
            wordId: word.id,
            state: resultingState,
            directSuccessCount: successCount,
            nextReviewAt: nextReviewDate(resultingState, now),
            lastPracticedAt: now,
          },
          update: {
            state: resultingState,
            directSuccessCount: successCount,
            nextReviewAt: nextReviewDate(resultingState, now),
            lastPracticedAt: now,
          },
        });
        progress = { previousState, state: resultingState, directSuccessCount: successCount };
      }

      const activityDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      await transaction.userStreakLog.upsert({
        where: { userId_activityDate: { userId, activityDate } },
        create: { userId, activityDate, wordsPracticedCount: 1 },
        update: { wordsPracticedCount: { increment: 1 } },
      });
      const activity = await transaction.userStreakLog.findMany({
        where: { userId },
        orderBy: { activityDate: 'desc' },
        take: 366,
      });
      const sentenceLink = word.sentences[0];
      const recalledWordId = sentenceLink?.sentence.words.find((link) => !link.isTargetWord)?.wordId;
      const result: RecordAttemptResponse = {
        correct,
        shouldRequeue,
        hint: correct ? undefined : word.hint,
        reveal: correct
          ? {
              word: {
                id: word.id,
                termEn: word.termEn,
                translationEs: word.translationEs,
                phoneticIpa: word.phoneticIpa,
                audioUrl: word.audioUrl,
              },
              contextSentence: {
                sentenceEn: sentenceLink?.sentence.sentenceEn ?? word.exampleEn ?? `This is a ${word.termEn.toLowerCase()}.`,
                translationEs: sentenceLink?.sentence.translationEs ?? word.exampleEs ?? `Esto es ${word.translationEs.toLowerCase()}.`,
                recalledWordId,
              },
            }
          : undefined,
        progress,
        streak: {
          days: consecutiveDayCount(activity.map(({ activityDate: date }) => date), now),
          maintainedToday: true,
        },
      };
      const persistedResult = JSON.parse(JSON.stringify(result)) as RecordAttemptResponse;
      await transaction.learningAttempt.create({
        data: {
          clientAttemptId: attemptId,
          userId,
          sessionId,
          exerciseId: request.exerciseId,
          wordId: word.id,
          selectedOptionId: request.selectedOptionId,
          isCorrect: correct,
          responseTimeMs: request.responseTimeMs,
          previousState,
          resultingState,
          resultPayload: persistedResult as unknown as Prisma.InputJsonValue,
        },
      });
      return persistedResult;
    });

    await this.advanceSession(session, request.exerciseId, shouldRequeue);
    return response;
  }

  private async getOwnedSession(userId: string, sessionId: string): Promise<LearningSession> {
    const session = await this.sessions.get(sessionId);
    if (session.userId !== userId) throw new ForbiddenException('La sesión pertenece a otro usuario.');
    return session;
  }

  private async advanceSession(
    session: LearningSession,
    exerciseId: string,
    shouldRequeue: boolean,
  ) {
    const current = session.queue[0];
    if (!current || current.id !== exerciseId) return;
    session.queue.shift();
    if (
      session.initialExerciseIds.includes(exerciseId) &&
      !session.processedInitialExerciseIds.includes(exerciseId)
    ) {
      session.processedInitialExerciseIds.push(exerciseId);
    }
    if (shouldRequeue && !session.requeuedWordIds.includes(current.wordId)) {
      session.requeuedWordIds.push(current.wordId);
      session.queue.push(current);
    }
    await this.sessions.save(session);
  }

  private shuffle<T>(items: T[]): T[] {
    return [...items].sort(() => Math.random() - 0.5);
  }
}
