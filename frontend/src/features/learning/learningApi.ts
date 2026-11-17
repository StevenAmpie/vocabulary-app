import {
  CreateLearningSessionResponse,
  NextExerciseResponse,
  RecordAttemptRequest,
  RecordAttemptResponse,
} from '../../types';
import { apiRequest } from '../../services/apiClient';

export interface CreateSessionOptions {
  categorySlug?: string;
  targetWordCount?: number;
  wordId?: string;
}

export const learningApi = {
  createSession(options: CreateSessionOptions = {}): Promise<CreateLearningSessionResponse> {
    return apiRequest('/learning/sessions', {
      method: 'POST',
      body: JSON.stringify({
        categorySlug: options.categorySlug ?? 'technology',
        targetWordCount: options.targetWordCount ?? 4,
        wordId: options.wordId,
      }),
    });
  },

  getNextExercise(sessionId: string): Promise<NextExerciseResponse | null> {
    return apiRequest(`/learning/sessions/${encodeURIComponent(sessionId)}/next`);
  },

  recordAttempt(
    sessionId: string,
    requestBody: RecordAttemptRequest,
  ): Promise<RecordAttemptResponse> {
    const { attemptId, ...body } = requestBody;
    return apiRequest(
      `/learning/sessions/${encodeURIComponent(sessionId)}/attempts/${encodeURIComponent(attemptId)}`,
      { method: 'PUT', body: JSON.stringify(body) },
    );
  },
};
