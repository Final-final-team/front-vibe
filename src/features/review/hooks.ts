import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addAdditionalReviewer,
  addReference,
  approveReview,
  cancelReview,
  createComment,
  deleteAttachment,
  deleteComment,
  fetchAttachmentDownload,
  fetchReviewDetail,
  fetchReviewHistories,
  fetchTaskReviews,
  rejectReview,
  removeAdditionalReviewer,
  removeReference,
  submitReview,
  updateComment,
  updateReview,
  uploadAttachment,
} from './api';
import { useProjectTasks } from '../tasks/hooks';
import { appConfig } from '../../shared/config/app-config';
import { getMockTasks } from './mock';
import type { ReviewCancelInput, ReviewCreateInput, ReviewTask, ReviewUpdateInput } from './types';
import { getMockProjectIdForTask } from '../tasks/mock-project';

export const reviewKeys = {
  tasks: ['tasks'] as const,
  taskReviews: (taskId: number) => ['tasks', taskId, 'reviews'] as const,
  detail: (reviewId: number) => ['reviews', reviewId] as const,
  histories: (reviewId: number) => ['reviews', reviewId, 'histories'] as const,
  attachmentDownload: (reviewId: number, attachmentId: number) =>
    ['reviews', reviewId, 'attachments', attachmentId, 'download'] as const,
};

type ReviewTaskListItem = ReviewTask & {
  projectId: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
};

function mapTaskStatus(
  status: 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED',
): ReviewTask['latestReviewStatus'] {
  if (status === 'COMPLETED') {
    return 'COMPLETED';
  }

  if (status === 'IN_REVIEW') {
    return 'IN_REVIEW';
  }

  if (status === 'PENDING') {
    return 'PENDING';
  }

  return 'IN_PROGRESS';
}

export function useTasks(projectId = appConfig.defaultProjectId) {
  const query = useProjectTasks(projectId);
  const data = useMemo(() => {
    if (appConfig.useMock) {
      return getMockTasks()
        .filter((task) => getMockProjectIdForTask(task.id) === projectId)
        .map<ReviewTaskListItem>((task) => ({
          ...task,
          projectId,
          status: task.latestReviewStatus,
        }));
    }

    return (query.data?.items ?? []).map<ReviewTaskListItem>((task) => ({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      summary: `${task.title} 업무 상세는 task detail API 연결 전까지 목록 데이터로 대체합니다.`,
      authorId: task.authorId,
      priority: task.priority,
      startDate: task.startDate ?? task.createdAt,
      dueDate: task.dueDate ?? task.updatedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      latestReviewStatus: mapTaskStatus(task.status),
      status: task.status,
    }));
  }, [projectId, query.data?.items]);

  return {
    ...query,
    data,
  };
}

export function useTaskReviews(taskId: number, enabled = true) {
  return useQuery({
    queryKey: reviewKeys.taskReviews(taskId),
    queryFn: () => fetchTaskReviews(taskId),
    enabled,
  });
}

export function useReviewDetail(reviewId: number, enabled = true) {
  return useQuery({
    queryKey: reviewKeys.detail(reviewId),
    queryFn: () => fetchReviewDetail(reviewId),
    enabled,
  });
}

export function useReviewHistories(reviewId: number, enabled = true) {
  return useQuery({
    queryKey: reviewKeys.histories(reviewId),
    queryFn: () => fetchReviewHistories(reviewId),
    enabled,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: number; input: ReviewCreateInput }) =>
      submitReview(taskId, input),
    onSuccess: (review) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: reviewKeys.taskReviews(review.taskId) });
    },
  });
}

export function useUpdateReview(reviewId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lockVersion, input }: { lockVersion: number; input: ReviewUpdateInput }) =>
      updateReview(reviewId, lockVersion, input),
    onSuccess: (review) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: reviewKeys.detail(review.reviewId) });
      void queryClient.invalidateQueries({ queryKey: reviewKeys.taskReviews(review.taskId) });
      void queryClient.invalidateQueries({ queryKey: reviewKeys.histories(review.reviewId) });
    },
  });
}

export function useApproveReview(reviewId: number) {
  return useReviewMutation(reviewId, ({ lockVersion }: { lockVersion: number }) =>
    approveReview(reviewId, lockVersion),
  );
}

export function useRejectReview(reviewId: number) {
  return useReviewMutation(
    reviewId,
    ({ lockVersion, reason }: { lockVersion: number; reason: string }) =>
      rejectReview(reviewId, lockVersion, reason),
  );
}

export function useCancelReview(reviewId: number) {
  return useReviewMutation(
    reviewId,
    ({ lockVersion, input }: { lockVersion: number; input: ReviewCancelInput }) =>
      cancelReview(reviewId, lockVersion, input),
  );
}

export function useAddReference(reviewId: number) {
  return useReviewMutation(
    reviewId,
    ({ lockVersion, userId }: { lockVersion: number; userId: number }) =>
      addReference(reviewId, lockVersion, userId),
  );
}

export function useRemoveReference(reviewId: number) {
  return useReviewMutation(
    reviewId,
    ({ lockVersion, userId }: { lockVersion: number; userId: number }) =>
      removeReference(reviewId, userId, lockVersion),
  );
}

export function useAddAdditionalReviewer(reviewId: number) {
  return useReviewMutation(
    reviewId,
    ({ lockVersion, userId }: { lockVersion: number; userId: number }) =>
      addAdditionalReviewer(reviewId, lockVersion, userId),
  );
}

export function useRemoveAdditionalReviewer(reviewId: number) {
  return useReviewMutation(
    reviewId,
    ({ lockVersion, userId }: { lockVersion: number; userId: number }) =>
      removeAdditionalReviewer(reviewId, userId, lockVersion),
  );
}

export function useUploadAttachment(reviewId: number) {
  return useReviewMutation(
    reviewId,
    ({ lockVersion, file }: { lockVersion: number; file: File }) =>
      uploadAttachment(reviewId, lockVersion, file),
  );
}

export function useDeleteAttachment(reviewId: number) {
  return useReviewMutation(
    reviewId,
    ({ lockVersion, attachmentId }: { lockVersion: number; attachmentId: number }) =>
      deleteAttachment(reviewId, attachmentId, lockVersion),
  );
}

export function useCreateComment(reviewId: number) {
  return useReviewMutation(reviewId, ({ content }: { content: string }) =>
    createComment(reviewId, content),
  );
}

export function useUpdateComment(reviewId: number) {
  return useReviewMutation(
    reviewId,
    ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment(reviewId, commentId, content),
  );
}

export function useDeleteComment(reviewId: number) {
  return useReviewMutation(reviewId, ({ commentId }: { commentId: number }) =>
    deleteComment(reviewId, commentId),
  );
}

export function useAttachmentDownload(reviewId: number) {
  return useMutation({
    mutationFn: ({ attachmentId }: { attachmentId: number }) =>
      fetchAttachmentDownload(reviewId, attachmentId),
  });
}

function useReviewMutation<TVariables>(
  _reviewId: number,
  mutationFn: (variables: TVariables) => Promise<{ reviewId: number; taskId: number }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (review) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: reviewKeys.detail(review.reviewId) });
      void queryClient.invalidateQueries({ queryKey: reviewKeys.taskReviews(review.taskId) });
      void queryClient.invalidateQueries({ queryKey: reviewKeys.histories(review.reviewId) });
    },
  });
}
