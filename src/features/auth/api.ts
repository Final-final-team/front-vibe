import { backendRequest, BackendApiError, toBackendApiError } from '../../shared/lib/http';

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
