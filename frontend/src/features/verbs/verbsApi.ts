import { apiRequest } from '../../services/apiClient';
import { VerbItem } from '../../types';

export const verbsApi = {
  list(): Promise<VerbItem[]> {
    return apiRequest('/verbs');
  },
};
