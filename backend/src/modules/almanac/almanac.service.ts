import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WordState } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { AlmanacQueryDto } from './almanac-query.dto';

@Injectable()
export class AlmanacService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: AlmanacQueryDto) {
    const progressFilter: Prisma.UserWordProgressWhereInput = {
      userId,
      ...(query.state ? { state: query.state } : {}),
    };
    const where: Prisma.WordWhereInput = {
      ...(query.category ? { categorySlug: query.category } : {}),
      ...(query.search
        ? {
            OR: [
              { termEn: { contains: query.search, mode: 'insensitive' } },
              { translationEs: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      userProgress: { some: progressFilter },
    };
    const [
      words,
      filteredTotal,
      totalWords,
      discoveredCount,
      consolidatingCount,
      masteredCount,
    ] = await this.prisma.$transaction([
      this.prisma.word.findMany({
        where,
        include: { userProgress: { where: { userId }, take: 1 } },
        orderBy: { termEn: 'asc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.word.count({ where }),
      this.prisma.userWordProgress.count({ where: { userId } }),
      this.prisma.userWordProgress.count({ where: { userId, state: WordState.DISCOVERED } }),
      this.prisma.userWordProgress.count({ where: { userId, state: WordState.CONSOLIDATING } }),
      this.prisma.userWordProgress.count({ where: { userId, state: WordState.MASTERED } }),
    ]);

    return {
      data: words.map((word) => this.toListItem(word, word.userProgress[0])),
      meta: {
        totalWords,
        filteredTotal,
        discoveredCount,
        consolidatingCount,
        masteredCount,
        page: query.page,
        totalPages: Math.max(1, Math.ceil(filteredTotal / query.limit)),
      },
    };
  }

  async detail(userId: string, wordId: string) {
    const word = await this.prisma.word.findFirst({
      where: { id: wordId, userProgress: { some: { userId } } },
      include: {
        userProgress: { where: { userId }, take: 1 },
        sentences: {
          where: { isTargetWord: true },
          take: 1,
          include: { sentence: true },
        },
      },
    });
    if (!word) throw new NotFoundException('La palabra no está en tu almanaque.');
    const progress = word.userProgress[0];
    return {
      ...this.toListItem(word, progress),
      contextSentence: word.sentences[0]
        ? {
            sentenceEn: word.sentences[0].sentence.sentenceEn,
            translationEs: word.sentences[0].sentence.translationEs,
            audioUrl: word.sentences[0].sentence.audioUrl ?? undefined,
          }
        : undefined,
      progress: {
        directSuccessCount: progress.directSuccessCount,
        contextSuccessCount: progress.contextSuccessCount,
        nextReviewAt: progress.nextReviewAt,
        lastPracticedAt: progress.lastPracticedAt,
      },
    };
  }

  async categories(userId: string) {
    const categories = await this.prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        words: {
          where: { userProgress: { some: { userId } } },
          select: { id: true },
        },
      },
    });
    return categories.map(({ words, ...category }) => ({ ...category, collectedCount: words.length }));
  }

  private toListItem(
    word: {
      id: string;
      termEn: string;
      translationEs: string;
      phoneticIpa: string;
      imageUrl: string;
      audioUrl: string;
      categorySlug: string;
      difficultyScore: number;
    },
    progress: {
      state: WordState;
      directSuccessCount: number;
      contextSuccessCount: number;
      discoveredAt: Date;
    },
  ) {
    const successes = progress.directSuccessCount + progress.contextSuccessCount;
    return {
      id: word.id,
      termEn: word.termEn,
      translationEs: word.translationEs,
      phoneticIpa: word.phoneticIpa,
      imageUrl: word.imageUrl,
      audioUrl: word.audioUrl,
      categorySlug: word.categorySlug,
      difficultyScore: word.difficultyScore,
      state: progress.state,
      discoveredAt: progress.discoveredAt,
      masteryPercentage: Math.min(100, successes * 25),
    };
  }
}
