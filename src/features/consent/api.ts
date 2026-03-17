import { backendRequest, BackendApiError, toBackendApiError } from '../../shared/lib/http';
import type {
  ConsentApiError,
  ConsentStatus,
  ConsentSubmitPayload,
  ConsentSubmitResult,
  RequiredConsentCheck,
} from './types';

export class ConsentApiException extends Error implements ConsentApiError {
  code: string;
  status: number;

  constructor({ code, message, status }: ConsentApiError) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function fetchConsentStatuses() {
  try {
    return await backendRequest<ConsentStatus[]>('/api/consents', { method: 'GET' });
  } catch (error) {
    const apiError = error instanceof BackendApiError ? error : toBackendApiError(error);
    throw new ConsentApiException(apiError);
  }
}

export async function fetchRequiredConsentCheck() {
  try {
    return await backendRequest<RequiredConsentCheck>('/api/consents/required/check', { method: 'GET' });
  } catch (error) {
    const apiError = error instanceof BackendApiError ? error : toBackendApiError(error);
    throw new ConsentApiException(apiError);
  }
}

export async function submitConsents(payload: ConsentSubmitPayload) {
  try {
    return await backendRequest<ConsentSubmitResult>('/api/consents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const apiError = error instanceof BackendApiError ? error : toBackendApiError(error);
    throw new ConsentApiException(apiError);
  }
}
