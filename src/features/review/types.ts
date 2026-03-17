import type { PriorityLevel } from '../workspace/types';

export type TaskStatus = 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
export type ReviewStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type ReviewSummary = {
  reviewId: number;
  taskId: number;
  roundNo: number;
  status: ReviewStatus;
  lockVersion: number;
  submittedAt: string | null;
  decidedAt: string | null;
};

export type ReferenceInfo = {
  userId: number;
  addedBy: number;
  createdAt: string;
};

export type AdditionalReviewerInfo = {
  userId: number;
  assignedBy: number;
  createdAt: string;
};

export type AttachmentInfo = {
  attachmentId: number;
  objectKey: string;
  originalName: string;
  contentType: string | null;
  sizeBytes: number;
  sortOrder: number;
  createdAt: string;
};

export type CommentInfo = {
  commentId: number;
  authorId: number;
  content: string;
  edited: boolean;
  editedAt: string | null;
  createdAt: string;
  deletedAt: string | null;
};

export type ReviewDetail = {
  reviewId: number;
  taskId: number;
  roundNo: number;
  status: ReviewStatus;
  content: string;
  rejectionReason: string | null;
  submittedBy: number;
  decidedBy: number | null;
  cancelledBy: number | null;
  lockVersion: number;
  submittedAt: string | null;
  decidedAt: string | null;
  cancelledAt: string | null;
  references: ReferenceInfo[];
  additionalReviewers: AdditionalReviewerInfo[];
  attachments: AttachmentInfo[];
  comments: CommentInfo[];
};

export type ReviewHistoryItem = {
  historyId: number;
  actionType: string;
  targetType: string;
  targetId: number;
  actorId: number;
  reason: string | null;
  metadataJson: string | null;
  occurredAt: string;
};

export type ReviewCreateInput = {
  content: string;
  referenceUserIds: number[];
  attachments: Array<{
    objectKey: string;
    originalName: string;
    contentType: string | null;
    sizeBytes: number;
    sortOrder: number;
  }>;
};

export type ReviewUpdateInput = {
  content: string;
};

export type ReviewDecisionInput = {
  reason: string;
};

export type ReviewCancelInput = {
  reason?: string;
};

export type ReviewCommentInput = {
  content: string;
};

export type ReviewTask = {
  id: number;
  title: string;
  summary: string;
  authorId: number;
  priority: PriorityLevel;
  startDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  latestReviewStatus: TaskStatus;
};

export type ApiErrorShape = {
  code: string;
  message: string;
  status: number;
  path?: string;
};
