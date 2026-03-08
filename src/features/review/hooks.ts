import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addAdditionalReviewer,
  addReference,
  approveReview,
  cancelReview,
  createComment,
  deleteAttachment,
  deleteComment,
  fetchReviewDetail,
  fetchReviewHistories,
  fetchTaskReviews,
  fetchTasks,
  rejectReview,
  removeAdditionalReviewer,
  removeReference,
  submitReview,
  updateComment,
  updateReview,
  uploadAttachment,
} from './api';
import type { ReviewCancelInput, ReviewCreateInput, ReviewUpdateInput } from './types';

export const reviewKeys = {
  tasks: ['tasks'] as const,
  taskReviews: (taskId: number) => ['tasks', taskId, 'reviews'] as const,
  detail: (reviewId: number) => ['reviews', reviewId] as const,
  histories: (reviewId: number) => ['reviews', reviewId, 'histories'] as const,
};

export function useTasks() {
  return useQuery({
    queryKey: reviewKeys.tasks,
    queryFn: fetchTasks,
  });
}

export function useTaskReviews(taskId: number) {
  return useQuery({
    queryKey: reviewKeys.taskReviews(taskId),
    queryFn: () => fetchTaskReviews(taskId),
  });
}

export function useReviewDetail(reviewId: number) {
  return useQuery({
    queryKey: reviewKeys.detail(reviewId),
    queryFn: () => fetchReviewDetail(reviewId),
  });
}

export function useReviewHistories(reviewId: number) {
  return useQuery({
    queryKey: reviewKeys.histories(reviewId),
    queryFn: () => fetchReviewHistories(reviewId),
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: number; input: ReviewCreateInput }) =>
      submitReview(taskId, input),
    onSuccess: (review) => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.tasks });
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

function useReviewMutation<TVariables>(
  _reviewId: number,
  mutationFn: (variables: TVariables) => Promise<{ reviewId: number; taskId: number }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (review) => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.tasks });
      void queryClient.invalidateQueries({ queryKey: reviewKeys.detail(review.reviewId) });
      void queryClient.invalidateQueries({ queryKey: reviewKeys.taskReviews(review.taskId) });
      void queryClient.invalidateQueries({ queryKey: reviewKeys.histories(review.reviewId) });
    },
  });
}
