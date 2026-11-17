export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

interface ApiErrorBody {
  message?: string | string[];
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const text = await response.text();
  let body: T | ApiErrorBody | null = null;
  if (text) {
    try {
      body = JSON.parse(text) as T | ApiErrorBody;
    } catch {
      body = null;
    }
  }
  if (!response.ok) {
    const message = (body as ApiErrorBody | null)?.message;
    throw new ApiError(
      Array.isArray(message) ? message.join(' ') : message || 'No se pudo completar la solicitud.',
      response.status,
    );
  }
  return body as T;
}
