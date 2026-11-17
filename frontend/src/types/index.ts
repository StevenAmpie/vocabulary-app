export type WordState = 'DISCOVERED' | 'CONSOLIDATING' | 'MASTERED';

export interface User {
  id: string;
  email: string | null;
  displayName: string;
  estimatedLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | null;
  hasCompletedDiagnostic: boolean;
}

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string;
  hasCompletedDiagnostic: boolean;
}

export interface Word {
  id: string;
  termEn: string;
  translationEs: string;
  phoneticIpa: string;
  audioUrl: string;
  imageUrl: string;
  imageUrls?: string[];
  imageCredits?: Array<{ src: string; creditUrl: string; creator: string; license: string }>;
  categorySlug: string;
  difficultyScore: number;
}

export interface ContextSentence {
  sentenceEn: string;
  translationEs: string;
  audioUrl?: string;
  recalledWordId?: string; // Palabra inyectada para el repaso espaciado implícito
}

export interface LearningOption {
  id: string;
  label: string;
  imageUrl?: string;
  imageDescription?: string;
}

export interface LearningExercise {
  id: string;
  mode?: 'image-to-word' | 'word-to-image' | 'translation-to-word';
  termEn?: string;
  phoneticIpa?: string;
  translationEs?: string;
  prompt: string;
  imageUrl: string;
  imageDescription: string;
  audioUrl?: string;
  options: LearningOption[];
}

export interface VerbItem {
  id: string;
  slug: string;
  termEn: string;
  translationEs: string;
  phoneticIpa: string;
  audioUrl: string;
  imageUrls: string[];
  imageCredits?: Array<{ src: string; creditUrl: string; creator: string; license: string }>;
  exampleEn?: string;
  exampleEs?: string;
}

export interface LearningSessionProgress {
  position: number;
  total: number;
}

export interface CreateLearningSessionResponse {
  sessionId: string;
  total: number;
  remaining: number;
}

export interface NextExerciseResponse {
  exercise: LearningExercise;
  session: LearningSessionProgress;
}

export interface RecordAttemptRequest {
  attemptId: string;
  exerciseId: string;
  selectedOptionId: string;
  responseTimeMs: number;
}

export interface RevealedWord {
  id: string;
  termEn: string;
  translationEs: string;
  phoneticIpa: string;
  audioUrl?: string;
}

export interface RecordAttemptResponse {
  correct: boolean;
  shouldRequeue: boolean;
  hint?: string;
  reveal?: {
    word: RevealedWord;
    contextSentence: ContextSentence;
  };
  progress?: {
    previousState: WordState | null;
    state: WordState;
    directSuccessCount: number;
  };
  streak: {
    days: number;
    maintainedToday: boolean;
  };
}

export interface AlmanacWordItem extends Word {
  state: WordState;
  discoveredAt: string;
  masteryPercentage: number;
}

export interface AlmanacMeta {
  totalWords: number;
  filteredTotal: number;
  discoveredCount: number;
  consolidatingCount: number;
  masteredCount: number;
  page: number;
  totalPages: number;
}

export interface AlmanacListResponse {
  data: AlmanacWordItem[];
  meta: AlmanacMeta;
}

export interface AlmanacCategory {
  slug: string;
  name: string;
  description?: string;
  iconUrl?: string;
  collectedCount: number;
}

export interface AlmanacWordDetail extends AlmanacWordItem {
  contextSentence?: ContextSentence;
  progress: {
    directSuccessCount: number;
    contextSuccessCount: number;
    nextReviewAt: string;
    lastPracticedAt: string;
  };
}

export interface UserStats {
  streakDays: number;
  streakMaintainedToday: boolean;
  totalWordsDiscovered: number;
}
