import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { apiRequest } from '../../services/apiClient';
import { AuthUser } from '../../types';

interface AuthResponse {
  user: AuthUser;
}

export const authApi = {
  me: () => apiRequest<AuthResponse>('/auth/me'),

  async register(email: string, displayName: string) {
    const options = await apiRequest<Parameters<typeof startRegistration>[0]>(
      '/auth/passkey/register-options',
      { method: 'POST', body: JSON.stringify({ email, displayName }) },
    );
    const registrationResponse = await startRegistration(options);
    return apiRequest<AuthResponse>('/auth/passkey/verify-registration', {
      method: 'POST',
      body: JSON.stringify({ email, registrationResponse }),
    });
  },

  async login(email: string) {
    const options = await apiRequest<Parameters<typeof startAuthentication>[0]>(
      '/auth/passkey/login-options',
      { method: 'POST', body: JSON.stringify({ email }) },
    );
    const authenticationResponse = await startAuthentication(options);
    return apiRequest<AuthResponse>('/auth/passkey/verify-login', {
      method: 'POST',
      body: JSON.stringify({ email, authenticationResponse }),
    });
  },

  logout: () => apiRequest<{ success: boolean }>('/auth/logout', { method: 'POST' }),
};
