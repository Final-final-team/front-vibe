import { getAccessToken, getCurrentActor } from '../../shared/lib/session';
import { appConfig } from '../../shared/config/app-config';
import type {
  ApiErrorShape,
  ReviewCancelInput,
  ReviewCreateInput,
  ReviewDetail,
  ReviewHistoryItem,
  ReviewSummary,
  ReviewTask,
  ReviewUpdateInput,
} from './types';
import {
  addAdditionalReviewer as addAdditionalReviewerMock,
  addReference as addReferenceMock,
  approveReview as approveReviewMock,
  cancelReview as cancelReviewMock,
  createComment as createCommentMock,
  deleteAttachment as deleteAttachmentMock,
  deleteComment as deleteCommentMock,
  getMockTasks,
  getReviewDetail as getReviewDetailMock,
  getReviewHistories as getReviewHistoriesMock,
  getTaskReviews as getTaskReviewsMock,
  rejectReview as rejectReviewMock,
  removeAdditionalReviewer as removeAdditionalReviewerMock,
  removeReference as removeReferenceMock,
  submitReview as submitReviewMock,
  updateComment as updateCommentMock,
  updateReview as updateReviewMock,
  uploadAttachment as uploadAttachmentMock,
} from './mock';

type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
};

type ErrorResponse = {
  code: string;
  message: string;
  timestamp: string;
  path?: string;
};

const API_BASE_URL = appConfig.publicApiBaseUrl;
const USE_MOCK = appConfig.useMock;

export class ApiError extends Error implements ApiErrorShape {
  code: string;
  status: number;
  path?: string;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.code = shape.code;
    this.status = shape.status;
    this.path = shape.path;
  }
}

function getHeaders(contentType = true) {
  const actor = getCurrentActor();
  const token = getAccessToken();
  const headers = new Headers();

  if (contentType) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('X-Actor-Id', String(actor.actorId));
  headers.set('X-Actor-Roles', actor.roles.join(','));
  headers.set('X-Actor-Permissions', actor.permissions.join(','));

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as ApiResponse<T> | ErrorResponse) : null;

  if (!response.ok) {
    const errorPayload = payload as ErrorResponse | null;
    throw new ApiError({
      code: errorPayload?.code ?? 'INTERNAL_SERVER_ERROR',
      message: errorPayload?.message ?? 'Unexpected server error.',
      status: response.status,
      path: errorPayload?.path,
    });
  }

  return (payload as ApiResponse<T>).data;
}

function toApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    const shape = error as ApiErrorShape;
    return new ApiError(shape);
  }

  return new ApiError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? error.message : 'Unexpected server error.',
    status: 500,
  });
}

export async function fetchTasks() {
  return getMockTasks();
}

export async function fetchTaskReviews(taskId: number) {
  try {
    if (USE_MOCK) {
      return await getTaskReviewsMock(taskId);
    }

    return await request<ReviewSummary[]>(`/api/v1/tasks/${taskId}/reviews`);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function fetchReviewDetail(reviewId: number) {
  try {
    if (USE_MOCK) {
      return await getReviewDetailMock(reviewId);
    }

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}`);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function fetchReviewHistories(reviewId: number) {
  try {
    if (USE_MOCK) {
      return await getReviewHistoriesMock(reviewId);
    }

    return await request<ReviewHistoryItem[]>(`/api/v1/reviews/${reviewId}/histories`);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function submitReview(taskId: number, input: ReviewCreateInput) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await submitReviewMock(taskId, input, actor.actorId);
    }

    return await request<ReviewDetail>(`/api/v1/tasks/${taskId}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(input),
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateReview(reviewId: number, lockVersion: number, input: ReviewUpdateInput) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await updateReviewMock(reviewId, lockVersion, input, actor.actorId);
    }

    const headers = getHeaders();
    headers.set('If-Match', String(lockVersion));

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(input),
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function approveReview(reviewId: number, lockVersion: number) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await approveReviewMock(reviewId, lockVersion, actor.actorId);
    }

    const headers = getHeaders(false);
    headers.set('If-Match', String(lockVersion));

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}/approve`, {
      method: 'POST',
      headers,
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function rejectReview(reviewId: number, lockVersion: number, reason: string) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await rejectReviewMock(reviewId, lockVersion, { reason }, actor.actorId);
    }

    const headers = getHeaders();
    headers.set('If-Match', String(lockVersion));

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}/reject`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason }),
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function cancelReview(reviewId: number, lockVersion: number, input: ReviewCancelInput) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await cancelReviewMock(reviewId, lockVersion, input, actor.actorId);
    }

    const headers = getHeaders();
    headers.set('If-Match', String(lockVersion));

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function addReference(reviewId: number, lockVersion: number, userId: number) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await addReferenceMock(reviewId, lockVersion, userId, actor.actorId);
    }

    const headers = getHeaders();
    headers.set('If-Match', String(lockVersion));

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}/references`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function removeReference(reviewId: number, userId: number, lockVersion: number) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await removeReferenceMock(reviewId, userId, lockVersion, actor.actorId);
    }

    const headers = getHeaders(false);
    headers.set('If-Match', String(lockVersion));

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}/references/${userId}`, {
      method: 'DELETE',
      headers,
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function addAdditionalReviewer(reviewId: number, lockVersion: number, userId: number) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await addAdditionalReviewerMock(reviewId, lockVersion, userId, actor.actorId);
    }

    const headers = getHeaders();
    headers.set('If-Match', String(lockVersion));

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}/additional-reviewers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId }),
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function removeAdditionalReviewer(
  reviewId: number,
  userId: number,
  lockVersion: number,
) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await removeAdditionalReviewerMock(reviewId, userId, lockVersion, actor.actorId);
    }

    const headers = getHeaders(false);
    headers.set('If-Match', String(lockVersion));

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}/additional-reviewers/${userId}`, {
      method: 'DELETE',
      headers,
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function uploadAttachment(reviewId: number, lockVersion: number, file: File) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await uploadAttachmentMock(reviewId, lockVersion, file, actor.actorId);
    }

    const presignHeaders = getHeaders();
    presignHeaders.set('If-Match', String(lockVersion));
    const presign = await request<{ objectKey: string; uploadUrl: string; expiresAt: string }>(
      `/api/v1/reviews/${reviewId}/attachments/presign`,
      {
        method: 'POST',
        headers: presignHeaders,
        body: JSON.stringify({
          originalName: file.name,
          contentType: file.type || null,
          sizeBytes: file.size,
        }),
      },
    );

    await fetch(presign.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: file.type ? new Headers({ 'Content-Type': file.type }) : undefined,
    });

    const confirmHeaders = getHeaders();
    confirmHeaders.set('If-Match', String(lockVersion));

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}/attachments`, {
      method: 'POST',
      headers: confirmHeaders,
      body: JSON.stringify({
        objectKey: presign.objectKey,
        originalName: file.name,
        contentType: file.type || null,
        sizeBytes: file.size,
        sortOrder: 0,
      }),
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deleteAttachment(reviewId: number, attachmentId: number, lockVersion: number) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await deleteAttachmentMock(reviewId, attachmentId, lockVersion, actor.actorId);
    }

    const headers = getHeaders(false);
    headers.set('If-Match', String(lockVersion));

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers,
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function createComment(reviewId: number, content: string) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await createCommentMock(reviewId, content, actor.actorId);
    }

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateComment(reviewId: number, commentId: number, content: string) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await updateCommentMock(reviewId, commentId, content, actor.actorId);
    }

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}/comments/${commentId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deleteComment(reviewId: number, commentId: number) {
  const actor = getCurrentActor();

  try {
    if (USE_MOCK) {
      return await deleteCommentMock(reviewId, commentId, actor.actorId);
    }

    return await request<ReviewDetail>(`/api/v1/reviews/${reviewId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export type { ReviewTask };
