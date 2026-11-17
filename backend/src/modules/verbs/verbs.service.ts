import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { activeVerbSlugs } from '../../common/verb-catalog';

@Injectable()
export class VerbsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.word.findMany({
      where: { categorySlug: 'verbs', slug: { in: activeVerbSlugs() } },
      orderBy: { termEn: 'asc' },
      select: {
        id: true,
        slug: true,
        termEn: true,
        translationEs: true,
        phoneticIpa: true,
        hint: true,
        imageDescription: true,
        imageUrls: true,
        imageCredits: true,
        audioUrl: true,
        exampleEn: true,
        exampleEs: true,
      },
    });
  }

  async detail(slug: string) {
    if (!activeVerbSlugs().includes(slug)) throw new NotFoundException('El verbo no existe.');
    const verb = await this.prisma.word.findFirst({
      where: { categorySlug: 'verbs', slug },
      select: {
        id: true,
        slug: true,
        termEn: true,
        translationEs: true,
        phoneticIpa: true,
        hint: true,
        imageDescription: true,
        imageUrls: true,
        imageCredits: true,
        audioUrl: true,
        exampleEn: true,
        exampleEs: true,
      },
    });
    if (!verb) throw new NotFoundException('El verbo no existe.');
    return verb;
  }
}
