import { appConfig } from '../../shared/config/app-config';
import { getAccessToken } from '../../shared/lib/session';
import type {
  ConsentApiError,
  ConsentStatus,
  ConsentSubmitPayload,
  ConsentSubmitResult,
  RequiredConsentCheck,
} from './types';

type ApiEnvelope<T> = {
  data: T;
  errorInfo: {
    code: string;
    message: string;
  } | null;
};

const API_BASE_URL = appConfig.publicApiBaseUrl;

export class ConsentApiException extends Error implements ConsentApiError {
  code: string;
  status: number;

  constructor({ code, message, status }: ConsentApiError) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function buildHeaders(contentType = true) {
  const headers = new Headers();
  const token = getAccessToken();

  if (contentType) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || payload.errorInfo) {
    throw new ConsentApiException({
      code: payload.errorInfo?.code ?? 'UNEXPECTED_SERVER_ERROR',
      message: payload.errorInfo?.message ?? '동의 정보를 불러오지 못했습니다.',
      status: response.status,
    });
  }

  return payload.data;
}

export async function fetchConsentStatuses() {
  return request<ConsentStatus[]>('/api/consents', {
    method: 'GET',
    headers: buildHeaders(false),
  });
}

export async function fetchRequiredConsentCheck() {
  return request<RequiredConsentCheck>('/api/consents/required/check', {
    method: 'GET',
    headers: buildHeaders(false),
  });
}

export async function submitConsents(payload: ConsentSubmitPayload) {
  return request<ConsentSubmitResult>('/api/consents', {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
}
