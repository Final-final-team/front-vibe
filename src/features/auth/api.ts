import { backendRequest, BackendApiError, toBackendApiError } from '../../shared/lib/http';

export type LocalAuthPayload = {
  email: string;
  password: string;
};

export type LocalSignupPayload = LocalAuthPayload & {
  nickname: string;
};

export type LocalAuthResult = {
  userId: number;
  email: string;
  nickname: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
};

export async function refreshSession() {
  await backendRequest<void>('/api/auth/refresh', {
    method: 'POST',
  });
}

export async function verifySession() {
  try {
    await backendRequest('/api/consents/required/check', { method: 'GET' });
    return { authenticated: true as const };
  } catch (error) {
    const apiError = error instanceof BackendApiError ? error : toBackendApiError(error);

    if (apiError.status === 403 && apiError.code === 'CONSENT_REQUIRED') {
      return { authenticated: true as const };
    }

    if (apiError.status !== 401) {
      throw apiError;
    }
  }

  try {
    await refreshSession();
    await backendRequest('/api/consents/required/check', { method: 'GET' });
    return { authenticated: true as const };
  } catch (error) {
    const apiError = error instanceof BackendApiError ? error : toBackendApiError(error);

    if (apiError.status === 403 && apiError.code === 'CONSENT_REQUIRED') {
      return { authenticated: true as const };
    }

    if (apiError.status === 401) {
      return { authenticated: false as const };
    }

    throw apiError;
  }
}

export async function loginWithLocalAccount(payload: LocalAuthPayload) {
  return await backendRequest<LocalAuthResult>('/api/auth/local/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signupWithLocalAccount(payload: LocalSignupPayload) {
  return await backendRequest<LocalAuthResult>('/api/auth/local/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
