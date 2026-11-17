import { apiRequest } from '../../services/apiClient';
import {
  AlmanacCategory,
  AlmanacListResponse,
  AlmanacWordDetail,
  WordState,
} from '../../types';

export interface AlmanacFilters {
  state?: WordState;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const almanacApi = {
  list(filters: AlmanacFilters = {}) {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.set(key, String(value));
    });
    return apiRequest<AlmanacListResponse>(`/almanac/words?${query}`);
  },
  categories: () => apiRequest<AlmanacCategory[]>('/almanac/categories'),
  detail: (wordId: string) => apiRequest<AlmanacWordDetail>(`/almanac/words/${wordId}`),
};
