function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value == null || value === '') {
    return fallback;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error(`Invalid boolean env value: "${value}"`);
}

const publicApiBaseUrl = import.meta.env.VITE_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';
const authBaseUrl =
  import.meta.env.VITE_AUTH_BASE_URL?.replace(/\/$/, '') ?? publicApiBaseUrl;
const useMock = parseBoolean(import.meta.env.VITE_USE_MOCK, true);
const defaultProjectId = Number(import.meta.env.VITE_DEFAULT_PROJECT_ID ?? '10');

if (!Number.isInteger(defaultProjectId) || defaultProjectId <= 0) {
  throw new Error('VITE_DEFAULT_PROJECT_ID must be a positive integer.');
}

export const appConfig = {
  publicApiBaseUrl,
  authBaseUrl,
  useMock,
  defaultProjectId,
} as const;
