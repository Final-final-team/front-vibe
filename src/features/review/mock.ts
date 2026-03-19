import type {
  AdditionalReviewerInfo,
  ApiErrorShape,
  AttachmentInfo,
  CommentInfo,
  ReferenceInfo,
  ReviewCancelInput,
  ReviewCreateInput,
  ReviewDetail,
  ReviewDecisionInput,
  ReviewHistoryItem,
  ReviewSummary,
  ReviewTask,
  ReviewUpdateInput,
  TaskStatus,
} from './types';
import type { PriorityLevel } from '../workspace/types';

const tasksCatalog: ReviewTask[] = [
  {
    id: 10,
    title: '승인 큐 응답 시간 줄이기',
    summary: '검토 대기 업무가 오래 머물지 않도록 상신, 처리, 후속 확인 흐름을 정리합니다.',
    authorId: 101,
    assignees: [],
    priority: 'HIGHEST',
    startDate: '2026-03-10T09:00:00Z',
    dueDate: '2026-03-14T09:00:00Z',
    createdAt: '2026-03-07T09:20:00Z',
    updatedAt: '2026-03-13T16:30:00Z',
    latestReviewStatus: 'IN_REVIEW',
  },
  {
    id: 11,
    title: '역할 변경 승인 정책 정리',
    summary: '역할 변경 요청 시 승인 기준과 예외 규칙을 운영 정책 문서에 반영합니다.',
    authorId: 101,
    assignees: [],
    priority: 'HIGH',
    startDate: '2026-03-12T09:00:00Z',
    dueDate: '2026-03-18T09:00:00Z',
    createdAt: '2026-03-09T11:00:00Z',
    updatedAt: '2026-03-15T06:40:00Z',
    latestReviewStatus: 'IN_PROGRESS',
  },
  {
    id: 12,
    title: '첨부 버전 관리 UX 개선',
    summary: '업로드 파일 교체 이력과 검토 첨부 확인 흐름을 사용자 기준으로 정리합니다.',
    authorId: 102,
    assignees: [],
    priority: 'MEDIUM',
    startDate: '2026-03-05T09:00:00Z',
    dueDate: '2026-03-12T09:00:00Z',
    createdAt: '2026-03-03T10:00:00Z',
    updatedAt: '2026-03-12T08:10:00Z',
    latestReviewStatus: 'COMPLETED',
  },
  {
    id: 13,
    title: '초대 기반 프로젝트 참여 흐름 정리',
    summary: '초대 발송부터 수락, 만료, 재초대까지 멤버 참여 흐름을 한 화면에서 관리합니다.',
    authorId: 202,
    assignees: [],
    priority: 'HIGH',
    startDate: '2026-03-14T09:00:00Z',
    dueDate: '2026-03-19T09:00:00Z',
    createdAt: '2026-03-10T13:00:00Z',
    updatedAt: '2026-03-16T04:20:00Z',
    latestReviewStatus: 'IN_PROGRESS',
  },
  {
    id: 14,
    title: '프로젝트 역할 정책 템플릿 정리',
    summary: '운영자, 검토 리드, 옵저버 역할별 권한 묶음과 적용 범위를 표준화합니다.',
    authorId: 101,
    assignees: [],
    priority: 'LOWEST',
    startDate: '2026-03-16T09:00:00Z',
    dueDate: '2026-03-22T09:00:00Z',
    createdAt: '2026-03-12T15:00:00Z',
    updatedAt: '2026-03-15T21:10:00Z',
    latestReviewStatus: 'IN_PROGRESS',
  },
  {
    id: 20,
    title: '주간 운영 점검 템플릿 정비',
    summary: '운영 프로젝트에서 공통으로 쓰는 점검 항목과 상태 표현을 정리합니다.',
    authorId: 501,
    assignees: [],
    priority: 'HIGH',
    startDate: '2026-03-15T09:00:00Z',
    dueDate: '2026-03-21T09:00:00Z',
    createdAt: '2026-03-11T09:30:00Z',
    updatedAt: '2026-03-16T09:10:00Z',
    latestReviewStatus: 'IN_PROGRESS',
  },
  {
    id: 21,
    title: '온콜 대응 큐 화면 정리',
    summary: '긴급도 분류와 담당자 라우팅이 한눈에 보이는 운영 큐 화면으로 정리합니다.',
    authorId: 502,
    assignees: [],
    priority: 'MEDIUM',
    startDate: '2026-03-17T09:00:00Z',
    dueDate: '2026-03-23T09:00:00Z',
    createdAt: '2026-03-12T14:10:00Z',
    updatedAt: '2026-03-16T13:45:00Z',
    latestReviewStatus: 'IN_REVIEW',
  },
  {
    id: 22,
    title: '변경 이력 탐색 패턴 정리',
    summary: '운영 로그와 작업 이력을 탐색하는 필터와 상세 패턴을 정리합니다.',
    authorId: 501,
    assignees: [],
    priority: 'HIGH',
    startDate: '2026-03-18T09:00:00Z',
    dueDate: '2026-03-29T09:00:00Z',
    createdAt: '2026-03-13T08:40:00Z',
    updatedAt: '2026-03-16T17:20:00Z',
    latestReviewStatus: 'COMPLETED',
  },
];

let reviewIdCounter = 3003;
let attachmentIdCounter = 4003;
let commentIdCounter = 5003;
let historyIdCounter = 6008;

let reviews: ReviewDetail[] = [
  {
    reviewId: 3001,
    taskId: 10,
    roundNo: 2,
    status: 'SUBMITTED',
    content:
      '리뷰 요청 본문입니다. 프론트 라우터와 API 레이어를 정비했고, 낙관적 락 충돌 UX를 확인 부탁드립니다.',
    rejectionReason: null,
    submittedBy: 101,
    decidedBy: null,
    cancelledBy: null,
    lockVersion: 3,
    submittedAt: '2026-03-08T10:00:00Z',
    decidedAt: null,
    cancelledAt: null,
    references: [
      { userId: 201, addedBy: 101, createdAt: '2026-03-08T10:00:00Z' },
      { userId: 202, addedBy: 101, createdAt: '2026-03-08T10:04:00Z' },
    ],
    additionalReviewers: [{ userId: 301, assignedBy: 101, createdAt: '2026-03-08T10:06:00Z' }],
    attachments: [
      {
        attachmentId: 4001,
        objectKey: 'reviews/10/files/review-spec.pdf',
        originalName: 'review-spec.pdf',
        contentType: 'application/pdf',
        sizeBytes: 204800,
        sortOrder: 0,
        createdAt: '2026-03-08T10:00:00Z',
      },
    ],
    comments: [
      {
        commentId: 5001,
        authorId: 101,
        content: '구조상 크게 문제는 없고, 충돌 UX만 한번 더 확인해주세요.',
        edited: false,
        editedAt: null,
        createdAt: '2026-03-08T10:10:00Z',
        deletedAt: null,
      },
      {
        commentId: 5002,
        authorId: 301,
        content: '추가 검토자 권한이 반영되는지 확인 중입니다.',
        edited: false,
        editedAt: null,
        createdAt: '2026-03-08T10:14:00Z',
        deletedAt: null,
      },
    ],
  },
  {
    reviewId: 3000,
    taskId: 10,
    roundNo: 1,
    status: 'REJECTED',
    content: '이전 라운드 검토입니다.',
    rejectionReason: '댓글 수정 가능 조건이 명확하지 않습니다.',
    submittedBy: 101,
    decidedBy: 201,
    cancelledBy: null,
    lockVersion: 2,
    submittedAt: '2026-03-05T08:00:00Z',
    decidedAt: '2026-03-05T12:00:00Z',
    cancelledAt: null,
    references: [],
    additionalReviewers: [],
    attachments: [],
    comments: [],
  },
  {
    reviewId: 3002,
    taskId: 12,
    roundNo: 1,
    status: 'APPROVED',
    content: '첨부 업로드 UX 설계가 완료되어 승인 대기 없이 마무리되었습니다.',
    rejectionReason: null,
    submittedBy: 102,
    decidedBy: 301,
    cancelledBy: null,
    lockVersion: 1,
    submittedAt: '2026-03-06T07:00:00Z',
    decidedAt: '2026-03-06T09:00:00Z',
    cancelledAt: null,
    references: [{ userId: 202, addedBy: 102, createdAt: '2026-03-06T07:10:00Z' }],
    additionalReviewers: [],
    attachments: [],
    comments: [
      {
        commentId: 5003,
        authorId: 202,
        content: '승인 이후에도 읽기 전용 상태로 충분합니다.',
        edited: false,
        editedAt: null,
        createdAt: '2026-03-06T09:20:00Z',
        deletedAt: null,
      },
    ],
  },
];

const histories: Record<number, ReviewHistoryItem[]> = {
  3001: [
    {
      historyId: 6004,
      actionType: 'REFERENCE_ASSIGNED',
      targetType: 'REFERENCE',
      targetId: 202,
      actorId: 101,
      reason: null,
      metadataJson: '{"userId":202}',
      occurredAt: '2026-03-08T10:04:00Z',
    },
    {
      historyId: 6005,
      actionType: 'ADDITIONAL_REVIEWER_ASSIGNED',
      targetType: 'ADDITIONAL_REVIEWER',
      targetId: 301,
      actorId: 101,
      reason: null,
      metadataJson: '{"userId":301}',
      occurredAt: '2026-03-08T10:06:00Z',
    },
    {
      historyId: 6006,
      actionType: 'COMMENT_CREATED',
      targetType: 'COMMENT',
      targetId: 5001,
      actorId: 101,
      reason: null,
      metadataJson: null,
      occurredAt: '2026-03-08T10:10:00Z',
    },
    {
      historyId: 6007,
      actionType: 'COMMENT_CREATED',
      targetType: 'COMMENT',
      targetId: 5002,
      actorId: 301,
      reason: null,
      metadataJson: null,
      occurredAt: '2026-03-08T10:14:00Z',
    },
  ],
  3000: [
    {
      historyId: 6001,
      actionType: 'REVIEW_CREATED',
      targetType: 'REVIEW',
      targetId: 3000,
      actorId: 101,
      reason: null,
      metadataJson: '{"roundNo":1}',
      occurredAt: '2026-03-05T08:00:00Z',
    },
    {
      historyId: 6002,
      actionType: 'REVIEW_REJECTED',
      targetType: 'REVIEW',
      targetId: 3000,
      actorId: 201,
      reason: '댓글 수정 가능 조건이 명확하지 않습니다.',
      metadataJson: '{"taskId":10}',
      occurredAt: '2026-03-05T12:00:00Z',
    },
  ],
  3002: [
    {
      historyId: 6003,
      actionType: 'REVIEW_APPROVED',
      targetType: 'REVIEW',
      targetId: 3002,
      actorId: 301,
      reason: null,
      metadataJson: '{"taskId":12}',
      occurredAt: '2026-03-06T09:00:00Z',
    },
  ],
};

function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function now() {
  return new Date().toISOString();
}

function computeTaskStatus(task: ReviewTask): TaskStatus {
  const latestReview = reviews
    .filter((review) => review.taskId === task.id)
    .sort((left, right) => right.roundNo - left.roundNo)[0];

  if (!latestReview) {
    return task.latestReviewStatus;
  }

  if (latestReview.status === 'SUBMITTED') {
    return 'IN_REVIEW';
  }

  if (latestReview.status === 'APPROVED') {
    return 'COMPLETED';
  }

  return 'IN_PROGRESS';
}

function updateTaskStatuses() {
  tasksCatalog.forEach((task) => {
    task.latestReviewStatus = computeTaskStatus(task);
  });
}

function addHistory(
  reviewId: number,
  actionType: string,
  targetType: string,
  targetId: number,
  actorId: number,
  reason: string | null = null,
  metadataJson: string | null = null,
) {
  const item: ReviewHistoryItem = {
    historyId: historyIdCounter++,
    actionType,
    targetType,
    targetId,
    actorId,
    reason,
    metadataJson,
    occurredAt: now(),
  };

  histories[reviewId] = [item, ...(histories[reviewId] ?? [])];
}

function findReview(reviewId: number) {
  const review = reviews.find((item) => item.reviewId === reviewId);

  if (!review) {
    throw createMockError('REVIEW_NOT_FOUND', 'Review was not found.', 404);
  }

  return review;
}

function validateReviewVersion(review: ReviewDetail, lockVersion: number) {
  if (review.lockVersion !== lockVersion) {
    throw createMockError('REVIEW_VERSION_CONFLICT', 'Review version conflict detected.', 409);
  }
}

function validateSubmittedReview(review: ReviewDetail, code: string, message: string) {
  if (review.status !== 'SUBMITTED') {
    throw createMockError(code, message, 409);
  }
}

export function createMockError(code: string, message: string, status: number): ApiErrorShape {
  return { code, message, status };
}

export function getMockTasks() {
  return deepCopy(tasksCatalog);
}

export async function createMockTask(input: {
  projectId: number;
  title: string;
  description: string;
  startDate: string | null;
  dueDate: string | null;
  priority: PriorityLevel;
  authorId: number;
}) {
  const projectTasks = tasksCatalog.filter((task) =>
    input.projectId >= 20 && input.projectId < 30 ? task.id >= 20 && task.id < 30 : input.projectId >= 30 && input.projectId < 40 ? task.id >= 30 && task.id < 40 : task.id >= 10 && task.id < 20,
  );
  const nextId = Math.max(...projectTasks.map((task) => task.id), input.projectId) + 1;
  const timestamp = now();

  const created: ReviewTask = {
    id: nextId,
    title: input.title,
    summary: input.description,
    authorId: input.authorId,
    assignees: [],
    priority: input.priority,
    startDate: input.startDate ?? timestamp,
    dueDate: input.dueDate ?? timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
    latestReviewStatus: 'PENDING',
  };

  tasksCatalog.unshift(created);
  return deepCopy(created);
}

export async function assignMockTask(taskId: number, userId: number) {
  const task = tasksCatalog.find((item) => item.id === taskId);

  if (!task) {
    throw createMockError('TASK_NOT_FOUND', 'Task was not found.', 404);
  }

  task.assignees = [{ userId, name: `담당자 #${userId}` }];
  task.updatedAt = now();

  return deepCopy(task);
}

export async function updateMockTaskTitle(taskId: number, title: string) {
  const task = tasksCatalog.find((item) => item.id === taskId);

  if (!task) {
    throw createMockError('TASK_NOT_FOUND', 'Task was not found.', 404);
  }

  task.title = title;
  task.updatedAt = now();
  return deepCopy(task);
}

export async function updateMockTaskDescription(taskId: number, description: string) {
  const task = tasksCatalog.find((item) => item.id === taskId);

  if (!task) {
    throw createMockError('TASK_NOT_FOUND', 'Task was not found.', 404);
  }

  task.summary = description;
  task.updatedAt = now();
  return deepCopy(task);
}

export async function updateMockTaskStartDate(taskId: number, startDate: string | null) {
  const task = tasksCatalog.find((item) => item.id === taskId);

  if (!task) {
    throw createMockError('TASK_NOT_FOUND', 'Task was not found.', 404);
  }

  task.startDate = startDate ?? task.startDate;
  task.updatedAt = now();
  return deepCopy(task);
}

export async function updateMockTaskDueDate(taskId: number, dueDate: string | null) {
  const task = tasksCatalog.find((item) => item.id === taskId);

  if (!task) {
    throw createMockError('TASK_NOT_FOUND', 'Task was not found.', 404);
  }

  task.dueDate = dueDate ?? task.dueDate;
  task.updatedAt = now();
  return deepCopy(task);
}

export async function updateMockTaskPriority(taskId: number, priority: PriorityLevel) {
  const task = tasksCatalog.find((item) => item.id === taskId);

  if (!task) {
    throw createMockError('TASK_NOT_FOUND', 'Task was not found.', 404);
  }

  task.priority = priority;
  task.updatedAt = now();
  return deepCopy(task);
}

export async function unassignMockTask(taskId: number) {
  const task = tasksCatalog.find((item) => item.id === taskId);

  if (!task) {
    throw createMockError('TASK_NOT_FOUND', 'Task was not found.', 404);
  }

  task.assignees = [];
  task.updatedAt = now();
  return deepCopy(task);
}

export async function startMockTask(taskId: number) {
  const task = tasksCatalog.find((item) => item.id === taskId);

  if (!task) {
    throw createMockError('TASK_NOT_FOUND', 'Task was not found.', 404);
  }

  task.latestReviewStatus = 'IN_PROGRESS';
  task.updatedAt = now();
  return deepCopy(task);
}

export async function cancelMockTaskStart(taskId: number) {
  const task = tasksCatalog.find((item) => item.id === taskId);

  if (!task) {
    throw createMockError('TASK_NOT_FOUND', 'Task was not found.', 404);
  }

  task.latestReviewStatus = 'PENDING';
  task.updatedAt = now();
  return deepCopy(task);
}

export async function forceCompleteMockTask(taskId: number) {
  const task = tasksCatalog.find((item) => item.id === taskId);

  if (!task) {
    throw createMockError('TASK_NOT_FOUND', 'Task was not found.', 404);
  }

  task.latestReviewStatus = 'COMPLETED';
  task.updatedAt = now();
  return deepCopy(task);
}

export async function getTaskReviews(taskId: number) {
  return deepCopy(
    reviews
      .filter((review) => review.taskId === taskId)
      .sort((left, right) => right.roundNo - left.roundNo)
      .map<ReviewSummary>((review) => ({
        reviewId: review.reviewId,
        taskId: review.taskId,
        roundNo: review.roundNo,
        status: review.status,
        lockVersion: review.lockVersion,
        submittedAt: review.submittedAt,
        decidedAt: review.decidedAt,
      })),
  );
}

export async function getReviewDetail(reviewId: number) {
  return deepCopy(findReview(reviewId));
}

export async function getReviewHistories(reviewId: number) {
  findReview(reviewId);
  return deepCopy(histories[reviewId] ?? []);
}

export async function submitReview(taskId: number, input: ReviewCreateInput, actorId: number) {
  const task = tasksCatalog.find((item) => item.id === taskId);

  if (!task) {
    throw createMockError('TASK_NOT_FOUND', 'Task was not found.', 404);
  }

  if (computeTaskStatus(task) !== 'IN_PROGRESS') {
    throw createMockError(
      'REVIEW_SUBMIT_NOT_ALLOWED',
      'Task is not in a state that allows review submission.',
      409,
    );
  }

  const nextRoundNo =
    reviews
      .filter((review) => review.taskId === taskId)
      .reduce((max, review) => Math.max(max, review.roundNo), 0) + 1;

  const createdAt = now();
  const review: ReviewDetail = {
    reviewId: reviewIdCounter++,
    taskId,
    roundNo: nextRoundNo,
    status: 'SUBMITTED',
    content: input.content,
    rejectionReason: null,
    submittedBy: actorId,
    decidedBy: null,
    cancelledBy: null,
    lockVersion: 0,
    submittedAt: createdAt,
    decidedAt: null,
    cancelledAt: null,
    references: input.referenceUserIds.map<ReferenceInfo>((userId) => ({
      userId,
      addedBy: actorId,
      createdAt,
    })),
    additionalReviewers: input.additionalReviewerUserIds.map<AdditionalReviewerInfo>((userId) => ({
      userId,
      assignedBy: actorId,
      createdAt,
    })),
    attachments: input.attachments.map<AttachmentInfo>((attachment) => ({
      attachmentId: attachmentIdCounter++,
      objectKey: attachment.objectKey,
      originalName: attachment.originalName,
      contentType: attachment.contentType,
      sizeBytes: attachment.sizeBytes,
      sortOrder: attachment.sortOrder,
      createdAt,
    })),
    comments: [],
  };

  reviews = [review, ...reviews];
  updateTaskStatuses();
  addHistory(
    review.reviewId,
    nextRoundNo > 1 ? 'REVIEW_RESUBMITTED' : 'REVIEW_CREATED',
    'REVIEW',
    review.reviewId,
    actorId,
    null,
    JSON.stringify({ taskId, roundNo: nextRoundNo }),
  );

  return deepCopy(review);
}

export async function updateReview(
  reviewId: number,
  lockVersion: number,
  input: ReviewUpdateInput,
  actorId: number,
) {
  const review = findReview(reviewId);
  validateSubmittedReview(
    review,
    'REVIEW_UPDATE_NOT_ALLOWED',
    'Review content cannot be updated in the current state.',
  );
  validateReviewVersion(review, lockVersion);
  review.content = input.content;
  review.lockVersion += 1;
  addHistory(
    reviewId,
    'REVIEW_UPDATED',
    'REVIEW',
    reviewId,
    actorId,
    null,
    JSON.stringify({ contentLength: input.content.length }),
  );
  return deepCopy(review);
}

export async function approveReview(reviewId: number, lockVersion: number, actorId: number) {
  const review = findReview(reviewId);
  validateSubmittedReview(
    review,
    'REVIEW_APPROVAL_NOT_ALLOWED',
    'Review cannot be approved in the current state.',
  );
  validateReviewVersion(review, lockVersion);
  review.status = 'APPROVED';
  review.decidedBy = actorId;
  review.decidedAt = now();
  review.rejectionReason = null;
  review.lockVersion += 1;
  updateTaskStatuses();
  addHistory(reviewId, 'REVIEW_APPROVED', 'REVIEW', reviewId, actorId, null, null);
  return deepCopy(review);
}

export async function rejectReview(
  reviewId: number,
  lockVersion: number,
  input: ReviewDecisionInput,
  actorId: number,
) {
  const review = findReview(reviewId);
  validateSubmittedReview(
    review,
    'REVIEW_REJECTION_NOT_ALLOWED',
    'Review cannot be rejected in the current state.',
  );
  validateReviewVersion(review, lockVersion);

  if (!input.reason.trim()) {
    throw createMockError('REJECTION_REASON_REQUIRED', 'Rejection reason is required.', 400);
  }

  review.status = 'REJECTED';
  review.decidedBy = actorId;
  review.decidedAt = now();
  review.rejectionReason = input.reason;
  review.lockVersion += 1;
  updateTaskStatuses();
  addHistory(reviewId, 'REVIEW_REJECTED', 'REVIEW', reviewId, actorId, input.reason, null);
  return deepCopy(review);
}

export async function cancelReview(
  reviewId: number,
  lockVersion: number,
  input: ReviewCancelInput,
  actorId: number,
) {
  const review = findReview(reviewId);
  validateSubmittedReview(
    review,
    'REVIEW_CANCEL_NOT_ALLOWED',
    'Review cannot be cancelled in the current state.',
  );
  validateReviewVersion(review, lockVersion);
  review.status = 'CANCELLED';
  review.cancelledBy = actorId;
  review.cancelledAt = now();
  review.lockVersion += 1;
  updateTaskStatuses();
  addHistory(reviewId, 'REVIEW_CANCELLED', 'REVIEW', reviewId, actorId, input.reason ?? null, null);
  return deepCopy(review);
}

export async function addReference(
  reviewId: number,
  lockVersion: number,
  userId: number,
  actorId: number,
) {
  const review = findReview(reviewId);
  validateSubmittedReview(
    review,
    'REFERENCE_ASSIGN_NOT_ALLOWED',
    'References can only be assigned while the review is SUBMITTED.',
  );
  validateReviewVersion(review, lockVersion);

  if (review.references.some((reference) => reference.userId === userId)) {
    throw createMockError('REFERENCE_ALREADY_ASSIGNED', 'The user is already assigned as a reference.', 409);
  }

  review.references.push({ userId, addedBy: actorId, createdAt: now() });
  review.lockVersion += 1;
  addHistory(reviewId, 'REFERENCE_ASSIGNED', 'REFERENCE', userId, actorId, null, null);
  return deepCopy(review);
}

export async function removeReference(
  reviewId: number,
  userId: number,
  lockVersion: number,
  actorId: number,
) {
  const review = findReview(reviewId);
  validateSubmittedReview(
    review,
    'REFERENCE_UNASSIGN_NOT_ALLOWED',
    'References can only be removed while the review is SUBMITTED.',
  );
  validateReviewVersion(review, lockVersion);
  review.references = review.references.filter((reference) => reference.userId !== userId);
  review.lockVersion += 1;
  addHistory(reviewId, 'REFERENCE_REMOVED', 'REFERENCE', userId, actorId, null, null);
  return deepCopy(review);
}

export async function addAdditionalReviewer(
  reviewId: number,
  lockVersion: number,
  userId: number,
  actorId: number,
) {
  const review = findReview(reviewId);
  validateSubmittedReview(
    review,
    'ADDITIONAL_REVIEWER_ASSIGN_NOT_ALLOWED',
    'Additional reviewers can only be assigned while the review is SUBMITTED.',
  );
  validateReviewVersion(review, lockVersion);

  if (review.additionalReviewers.some((reviewer) => reviewer.userId === userId)) {
    throw createMockError(
      'ADDITIONAL_REVIEWER_ALREADY_ASSIGNED',
      'The user is already assigned as an additional reviewer.',
      409,
    );
  }

  review.additionalReviewers.push({ userId, assignedBy: actorId, createdAt: now() });
  review.lockVersion += 1;
  addHistory(reviewId, 'ADDITIONAL_REVIEWER_ASSIGNED', 'ADDITIONAL_REVIEWER', userId, actorId, null, null);
  return deepCopy(review);
}

export async function removeAdditionalReviewer(
  reviewId: number,
  userId: number,
  lockVersion: number,
  actorId: number,
) {
  const review = findReview(reviewId);
  validateSubmittedReview(
    review,
    'ADDITIONAL_REVIEWER_UNASSIGN_NOT_ALLOWED',
    'Additional reviewers can only be removed while the review is SUBMITTED.',
  );
  validateReviewVersion(review, lockVersion);
  review.additionalReviewers = review.additionalReviewers.filter((reviewer) => reviewer.userId !== userId);
  review.lockVersion += 1;
  addHistory(reviewId, 'ADDITIONAL_REVIEWER_REMOVED', 'ADDITIONAL_REVIEWER', userId, actorId, null, null);
  return deepCopy(review);
}

export async function uploadAttachment(
  reviewId: number,
  lockVersion: number,
  file: File,
  actorId: number,
) {
  const review = findReview(reviewId);
  validateSubmittedReview(
    review,
    'ATTACHMENT_ADD_NOT_ALLOWED',
    'Attachments can only be added while the review is SUBMITTED.',
  );
  validateReviewVersion(review, lockVersion);

  const attachment: AttachmentInfo = {
    attachmentId: attachmentIdCounter++,
    objectKey: `reviews/${review.taskId}/files/${Date.now()}-${file.name}`,
    originalName: file.name,
    contentType: file.type || null,
    sizeBytes: file.size,
    sortOrder: review.attachments.length,
    createdAt: now(),
  };

  review.attachments.push(attachment);
  review.lockVersion += 1;
  addHistory(reviewId, 'ATTACHMENT_ADDED', 'ATTACHMENT', attachment.attachmentId, actorId, null, null);
  return deepCopy(review);
}

export async function deleteAttachment(
  reviewId: number,
  attachmentId: number,
  lockVersion: number,
  actorId: number,
) {
  const review = findReview(reviewId);
  validateSubmittedReview(
    review,
    'ATTACHMENT_REMOVE_NOT_ALLOWED',
    'Attachments can only be removed while the review is SUBMITTED.',
  );
  validateReviewVersion(review, lockVersion);
  review.attachments = review.attachments.filter((attachment) => attachment.attachmentId !== attachmentId);
  review.lockVersion += 1;
  addHistory(reviewId, 'ATTACHMENT_REMOVED', 'ATTACHMENT', attachmentId, actorId, null, null);
  return deepCopy(review);
}

export async function createComment(reviewId: number, content: string, actorId: number) {
  const review = findReview(reviewId);

  if (!['SUBMITTED', 'APPROVED'].includes(review.status)) {
    throw createMockError(
      'COMMENT_CREATE_NOT_ALLOWED',
      'Comments cannot be created in the current review state.',
      409,
    );
  }

  const comment: CommentInfo = {
    commentId: commentIdCounter++,
    authorId: actorId,
    content,
    edited: false,
    editedAt: null,
    createdAt: now(),
    deletedAt: null,
  };

  review.comments.push(comment);
  addHistory(reviewId, 'COMMENT_CREATED', 'COMMENT', comment.commentId, actorId, null, null);
  return deepCopy(review);
}

export async function updateComment(reviewId: number, commentId: number, content: string, actorId: number) {
  const review = findReview(reviewId);

  if (review.status !== 'SUBMITTED') {
    throw createMockError(
      'COMMENT_UPDATE_NOT_ALLOWED',
      'Comments cannot be updated in the current review state.',
      409,
    );
  }

  const comment = review.comments.find((item) => item.commentId === commentId);

  if (!comment) {
    throw createMockError('REVIEW_COMMENT_NOT_FOUND', 'Review comment was not found.', 404);
  }

  comment.content = content;
  comment.edited = true;
  comment.editedAt = now();
  addHistory(reviewId, 'COMMENT_UPDATED', 'COMMENT', commentId, actorId, null, null);
  return deepCopy(review);
}

export async function deleteComment(reviewId: number, commentId: number, actorId: number) {
  const review = findReview(reviewId);

  if (review.status !== 'SUBMITTED') {
    throw createMockError(
      'COMMENT_DELETE_NOT_ALLOWED',
      'Comments cannot be deleted in the current review state.',
      409,
    );
  }

  review.comments = review.comments.filter((item) => item.commentId !== commentId);
  addHistory(reviewId, 'COMMENT_DELETED', 'COMMENT', commentId, actorId, null, null);
  return deepCopy(review);
}
