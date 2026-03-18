import { appConfig } from '../config/app-config';

type ApiEnvelope<T> = {
  data: T;
  errorInfo: {
    code: string;
    message: string;
  } | null;
};

export type BackendApiErrorShape = {
  code: string;
  message: string;
  status: number;
  path?: string;
};

export class BackendApiError extends Error implements BackendApiErrorShape {
  code: string;
  status: number;
  path?: string;

  constructor({ code, message, status, path }: BackendApiErrorShape) {
    super(message);
    this.code = code;
    this.status = status;
    this.path = path;
  }
}

function readCookie(name: string) {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

function isMutationMethod(method?: string) {
  const resolved = (method ?? 'GET').toUpperCase();
  return !['GET', 'HEAD', 'OPTIONS'].includes(resolved);
}

export function buildBackendHeaders({
  headers,
  contentType = true,
  method,
}: {
  headers?: HeadersInit;
  contentType?: boolean;
  method?: string;
}) {
  const resolved = new Headers(headers);

  if (contentType && !resolved.has('Content-Type')) {
    resolved.set('Content-Type', 'application/json');
  }

  if (!resolved.has('ngrok-skip-browser-warning')) {
    resolved.set('ngrok-skip-browser-warning', 'true');
  }

  if (isMutationMethod(method)) {
    const csrfToken = readCookie('XSRF-TOKEN');

    if (csrfToken && !resolved.has('X-XSRF-TOKEN')) {
      resolved.set('X-XSRF-TOKEN', csrfToken);
    }
  }

  return resolved;
}

export async function backendRequest<T>(path: string, init?: RequestInit) {
  const method = init?.method ?? 'GET';
  const response = await fetch(`${appConfig.publicApiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: buildBackendHeaders({
      headers: init?.headers,
      contentType: !(init?.body instanceof FormData) && init?.body !== undefined,
      method,
    }),
  });
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as ApiEnvelope<T>) : null;

  if (!response.ok || payload?.errorInfo) {
    throw new BackendApiError({
      code: payload?.errorInfo?.code ?? 'INTERNAL_SERVER_ERROR',
      message: payload?.errorInfo?.message ?? 'Unexpected server error.',
      status: response.status,
    });
  }

  return payload?.data as T;
}

export function toBackendApiError(error: unknown) {
  if (error instanceof BackendApiError) {
    return error;
  }

  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    const shape = error as BackendApiErrorShape;
    return new BackendApiError(shape);
  }

  return new BackendApiError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? error.message : 'Unexpected server error.',
    status: 500,
  });
}
