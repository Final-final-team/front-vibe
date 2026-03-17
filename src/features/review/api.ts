import { backendRequest, buildBackendHeaders, BackendApiError, toBackendApiError } from '../../shared/lib/http';
import { getCurrentActor } from '../../shared/lib/session';
import type {
  ApiErrorShape,
  ReviewAttachmentDownload,
  ReviewCancelInput,
  ReviewCreateInput,
  ReviewDetail,
  ReviewHistoryItem,
  ReviewPageResult,
  ReviewSummary,
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
import { appConfig } from '../../shared/config/app-config';

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

function getActorHeaders(contentType = true, method?: string) {
  const actor = getCurrentActor();
  const headers = buildBackendHeaders({ contentType, method });

  headers.set('X-Actor-Id', String(actor.actorId));
  headers.set('X-Actor-Roles', actor.roles.join(','));
  headers.set('X-Actor-Permissions', actor.permissions.join(','));

  return headers;
}

function getReviewHeaders(contentType = true, method?: string) {
  if (USE_MOCK) {
    return getActorHeaders(contentType, method);
  }

  return buildBackendHeaders({ contentType, method });
}

function toApiError(error: unknown) {
  if (error instanceof ApiError || error instanceof BackendApiError) {
    return error;
  }

  return toBackendApiError(error);
}

export async function fetchTaskReviews(taskId: number) {
  try {
    if (USE_MOCK) {
      const items = await getTaskReviewsMock(taskId);
      return {
        items,
        page: 0,
        size: items.length,
        totalElements: items.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      } satisfies ReviewPageResult<ReviewSummary>;
    }

    return await backendRequest<ReviewPageResult<ReviewSummary>>(`/api/v1/tasks/${taskId}/reviews`);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function fetchReviewDetail(reviewId: number) {
  try {
    if (USE_MOCK) {
      return await getReviewDetailMock(reviewId);
    }

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}`);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function fetchReviewHistories(reviewId: number) {
  try {
    if (USE_MOCK) {
      const items = await getReviewHistoriesMock(reviewId);
      return {
        items,
        page: 0,
        size: items.length,
        totalElements: items.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      } satisfies ReviewPageResult<ReviewHistoryItem>;
    }

    return await backendRequest<ReviewPageResult<ReviewHistoryItem>>(`/api/v1/reviews/${reviewId}/histories`);
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

    return await backendRequest<ReviewDetail>(`/api/v1/tasks/${taskId}/reviews`, {
      method: 'POST',
      headers: getReviewHeaders(true, 'POST'),
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

    const headers = getReviewHeaders(true, 'PATCH');
    headers.set('If-Match', String(lockVersion));

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}`, {
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

    const headers = getReviewHeaders(false, 'POST');
    headers.set('If-Match', String(lockVersion));

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}/approve`, {
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

    const headers = getReviewHeaders(true, 'POST');
    headers.set('If-Match', String(lockVersion));

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}/reject`, {
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

    const headers = getReviewHeaders(true, 'POST');
    headers.set('If-Match', String(lockVersion));

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}/cancel`, {
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

    const headers = getReviewHeaders(true, 'POST');
    headers.set('If-Match', String(lockVersion));

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}/references`, {
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

    const headers = getReviewHeaders(false, 'DELETE');
    headers.set('If-Match', String(lockVersion));

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}/references/${userId}`, {
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

    const headers = getReviewHeaders(true, 'POST');
    headers.set('If-Match', String(lockVersion));

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}/additional-reviewers`, {
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

    const headers = getReviewHeaders(false, 'DELETE');
    headers.set('If-Match', String(lockVersion));

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}/additional-reviewers/${userId}`, {
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

    const presignHeaders = getReviewHeaders(true, 'POST');
    presignHeaders.set('If-Match', String(lockVersion));
    const presign = await backendRequest<{ objectKey: string; uploadUrl: string; expiresAt: string }>(
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

    const uploadResponse = await fetch(presign.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: file.type ? new Headers({ 'Content-Type': file.type }) : undefined,
    });

    if (!uploadResponse.ok) {
      throw new ApiError({
        code: 'REVIEW_ATTACHMENT_UPLOAD_FAILED',
        message: '첨부 파일 업로드에 실패했습니다.',
        status: uploadResponse.status,
      });
    }

    const confirmHeaders = getReviewHeaders(true, 'POST');
    confirmHeaders.set('If-Match', String(lockVersion));

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}/attachments`, {
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

    const headers = getReviewHeaders(false, 'DELETE');
    headers.set('If-Match', String(lockVersion));

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}/attachments/${attachmentId}`, {
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

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}/comments`, {
      method: 'POST',
      headers: getReviewHeaders(true, 'POST'),
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

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}/comments/${commentId}`, {
      method: 'PATCH',
      headers: getReviewHeaders(true, 'PATCH'),
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

    return await backendRequest<ReviewDetail>(`/api/v1/reviews/${reviewId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getReviewHeaders(false, 'DELETE'),
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function fetchAttachmentDownload(reviewId: number, attachmentId: number) {
  try {
    if (USE_MOCK) {
      return {
        attachmentId,
        originalName: 'mock-download',
        downloadUrl: '#',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      } satisfies ReviewAttachmentDownload;
    }

    return await backendRequest<ReviewAttachmentDownload>(
      `/api/v1/reviews/${reviewId}/attachments/${attachmentId}/download`,
      {
        headers: getReviewHeaders(false, 'GET'),
      },
    );
  } catch (error) {
    throw toApiError(error);
  }
}
