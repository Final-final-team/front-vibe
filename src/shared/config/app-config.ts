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
const useMock = parseBoolean(import.meta.env.VITE_USE_MOCK, true);

if (!useMock && !publicApiBaseUrl) {
  throw new Error('VITE_PUBLIC_API_BASE_URL is required when VITE_USE_MOCK is false.');
}

export const appConfig = {
  publicApiBaseUrl,
  useMock,
} as const;
