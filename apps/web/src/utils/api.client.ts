import { env } from './api.env';

export interface ApiError {
  data?: unknown;
  message: string;
  name: 'ApiError';
  status: number;
}

export const apiError = (message: string, status: number, data?: unknown): ApiError => ({
  data,
  message,
  name: 'ApiError',
  status,
});

type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  body?: unknown;
};

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...restOptions } = options;

  const url = `${env.apiUrl}${path}`;

  const headers = new Headers(customHeaders);

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (body !== undefined && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  headers.set('x-timezone', timezone);

  const config: RequestInit = {
    method,
    credentials: 'include',
    headers,
    ...restOptions,
  };

  if (body !== undefined) {
    config.body = isFormData ? (body as BodyInit) : JSON.stringify(body);
  }

  const res = await fetch(url, config);

  if (res.status === 204 || res.status === 205) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') ?? '';
  let data: unknown = null;

  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    throw apiError(
      (data as any)?.error ?? (data as any)?.message ?? `Request failed with status ${res.status}`,
      res.status,
      data
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, { ...options, body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PATCH', path, { ...options, body }),

  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),

  url: (path: string) => `${env.apiUrl}${path}`,
} as const;
