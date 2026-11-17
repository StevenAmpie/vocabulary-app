export type WordState = 'DISCOVERED' | 'CONSOLIDATING' | 'MASTERED';

export interface LearningOption {
  id: string;
  label: string;
}

export interface LearningExercise {
  id: string;
  prompt: string;
  imageUrl: string;
  imageDescription: string;
  audioUrl?: string;
  options: LearningOption[];
}

export interface CreateLearningSessionResponse {
  sessionId: string;
  total: number;
  remaining: number;
}

export interface NextExerciseResponse {
  exercise: LearningExercise;
  session: { position: number; total: number };
}

export interface RecordAttemptResponse {
  correct: boolean;
  shouldRequeue: boolean;
  hint?: string;
  reveal?: {
    word: {
      id: string;
      termEn: string;
      translationEs: string;
      phoneticIpa: string;
      audioUrl?: string;
    };
    contextSentence: {
      sentenceEn: string;
      translationEs: string;
      recalledWordId?: string;
    };
  };
  progress?: {
    previousState: WordState | null;
    state: WordState;
    directSuccessCount: number;
  };
  streak: { days: number; maintainedToday: boolean };
}

export interface SessionExercise {
  id: string;
  wordId: string;
  optionIds: string[];
}

export interface LearningSession {
  id: string;
  userId: string;
  queue: SessionExercise[];
  initialExerciseIds: string[];
  processedInitialExerciseIds: string[];
  requeuedWordIds: string[];
  total: number;
}
