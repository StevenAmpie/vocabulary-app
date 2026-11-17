import { FastifyRequest } from 'fastify';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  displayName: string;
  hasCompletedDiagnostic: boolean;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
  sessionToken: string;
}

export interface PendingRegistration {
  challenge: string;
  userId: string;
  email: string;
  displayName: string;
}

export interface PendingAuthentication {
  challenge: string;
  userId: string;
}
