import { useState, type ReactNode } from 'react';
import { AlertTriangle, Clock3, MessageSquareText } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../features/review/api';
import ReviewActionBar from '../features/review/components/ReviewActionBar';
import ReviewAttachmentManager from '../features/review/components/ReviewAttachmentManager';
import ReviewCommentThread from '../features/review/components/ReviewCommentThread';
import ReviewHistoryTimeline from '../features/review/components/ReviewHistoryTimeline';
import ReviewSidebarLists from '../features/review/components/ReviewSidebarLists';
import ReviewStatusBadge from '../features/review/components/ReviewStatusBadge';
import {
  useAddAdditionalReviewer,
  useAddReference,
  useApproveReview,
  useAttachmentDownload,
  useCancelReview,
  useCreateComment,
  useDeleteAttachment,
  useDeleteComment,
  useRemoveAdditionalReviewer,
  useRemoveReference,
  useReviewDetail,
  useReviewHistories,
  useRejectReview,
  useTasks,
  useUpdateComment,
  useUploadAttachment,
} from '../features/review/hooks';
import { appConfig } from '../shared/config/app-config';
import { getCurrentActor } from '../shared/lib/session';
import { formatDate } from '../shared/lib/format';
import Button from '../shared/ui/Button';
import Card from '../shared/ui/Card';
import Dialog from '../shared/ui/Dialog';

export default function ReviewDetailPage() {
  const navigate = useNavigate();
  const { reviewId: reviewIdParam } = useParams();
  const reviewId = Number(reviewIdParam);
  const actorId = appConfig.useMock ? getCurrentActor().actorId : null;
  const detailQuery = useReviewDetail(reviewId);
  const historiesQuery = useReviewHistories(reviewId);
  const { data: tasks = [] } = useTasks();
  const review = detailQuery.data;
  const task = tasks.find((item) => item.id === review?.taskId);

  const approveMutation = useApproveReview(reviewId);
  const rejectMutation = useRejectReview(reviewId);
  const cancelMutation = useCancelReview(reviewId);
  const addReferenceMutation = useAddReference(reviewId);
  const removeReferenceMutation = useRemoveReference(reviewId);
  const addAdditionalReviewerMutation = useAddAdditionalReviewer(reviewId);
  const removeAdditionalReviewerMutation = useRemoveAdditionalReviewer(reviewId);
  const uploadAttachmentMutation = useUploadAttachment(reviewId);
  const deleteAttachmentMutation = useDeleteAttachment(reviewId);
  const downloadAttachmentMutation = useAttachmentDownload(reviewId);
  const createCommentMutation = useCreateComment(reviewId);
  const updateCommentMutation = useUpdateComment(reviewId);
  const deleteCommentMutation = useDeleteComment(reviewId);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [pageError, setPageError] = useState<string | null>(null);

  if (detailQuery.isLoading) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white px-6 py-12 text-sm text-gray-500">
        검토 상세를 불러오는 중입니다.
      </div>
    );
  }

  if (detailQuery.error || !review) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-sm text-rose-700">
        {(detailQuery.error as Error)?.message ?? '검토 정보를 찾을 수 없습니다.'}
      </div>
    );
  }

  const isSubmitted = review.status === 'SUBMITTED';
  const isSubmitter = actorId != null && actorId === review.submittedBy;
  const isApproved = review.status === 'APPROVED';
  const isAdditionalReviewer =
    actorId != null && review.additionalReviewers.some((reviewer) => reviewer.userId === actorId);

  const canEdit = isSubmitted && isSubmitter;
  const canApprove = isSubmitted && (!appConfig.useMock || isAdditionalReviewer || isSubmitter);
  const canReject = isSubmitted && (!appConfig.useMock || isAdditionalReviewer || isSubmitter);
  const canCancel = isSubmitted && isSubmitter;
  const canManageReferences = isSubmitted && isSubmitter;
  const canManageAdditionalReviewers = isSubmitted && isSubmitter;
  const canManageAttachments = isSubmitted && isSubmitter;
  const canCreateComment = isSubmitted || isApproved;
  const canResubmit = review.status === 'REJECTED' || review.status === 'CANCELLED';

  async function runAction<T>(action: () => Promise<T>) {
    setPageError(null);

    try {
      return await action();
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.code === 'REVIEW_VERSION_CONFLICT') {
        await detailQuery.refetch();
        await historiesQuery.refetch();
        setConflictOpen(true);
        return undefined;
      }

      setPageError(apiError.message);
      return undefined;
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white px-6 py-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              검토 상세
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-gray-900">
                {task?.title ?? `검토 #${review.reviewId}`}
              </h2>
              <ReviewStatusBadge status={review.status} />
              <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                {review.roundNo}차
              </span>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              검토 ID #{review.reviewId} · 업무 ID #{review.taskId} · 잠금 버전 v{review.lockVersion}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/projects/${task?.projectId ?? appConfig.defaultProjectId}/tasks/${review.taskId}/reviews`}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-700"
            >
              라운드 목록
            </Link>
            <Button variant="secondary" onClick={() => navigate(`/projects/${task?.projectId ?? appConfig.defaultProjectId}/tasks/${review.taskId}/reviews/new`)}>
              새 검토
            </Button>
          </div>
        </div>
        <div className="mt-6">
          <ReviewActionBar
            projectId={task?.projectId ?? appConfig.defaultProjectId}
            taskId={review.taskId}
            reviewId={review.reviewId}
            status={review.status}
            canEdit={canEdit}
            canApprove={canApprove}
            canReject={canReject}
            canCancel={canCancel}
            canResubmit={canResubmit}
            onApprove={() => setApproveOpen(true)}
            onReject={() => setRejectOpen(true)}
            onCancel={() => setCancelOpen(true)}
          />
        </div>
      </section>

      {pageError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {pageError}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <Card title="본문" description="검토 요청 또는 수정된 내용을 보여줍니다.">
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{review.content}</p>
            {review.rejectionReason && (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle size={16} />
                  반려 사유
                </div>
                <p className="mt-2 whitespace-pre-wrap leading-6">{review.rejectionReason}</p>
              </div>
            )}
          </Card>

          <Card title="메타 정보" description="상태 전이와 처리 시각을 확인합니다.">
            <div className="grid gap-4 md:grid-cols-2">
              <MetaItem label="상신자" value={`#${review.submittedBy}`} />
              <MetaItem label="승인/반려자" value={review.decidedBy ? `#${review.decidedBy}` : '-'} />
              <MetaItem label="취소자" value={review.cancelledBy ? `#${review.cancelledBy}` : '-'} />
              <MetaItem label="상신 시각" value={formatDate(review.submittedAt)} />
              <MetaItem label="처리 시각" value={formatDate(review.decidedAt)} />
              <MetaItem label="취소 시각" value={formatDate(review.cancelledAt)} />
            </div>
          </Card>

          <ReviewAttachmentManager
            attachments={review.attachments}
            canManage={canManageAttachments}
            uploading={uploadAttachmentMutation.isPending}
            onUpload={(file) =>
              runAction(async () => {
                await uploadAttachmentMutation.mutateAsync({
                  lockVersion: review.lockVersion,
                  file,
                });
              }).then(() => undefined)
            }
            onDelete={(attachmentId) =>
              runAction(async () => {
                await deleteAttachmentMutation.mutateAsync({
                  lockVersion: review.lockVersion,
                  attachmentId,
                });
              }).then(() => undefined)
            }
            onDownload={(attachmentId) =>
              runAction(async () => {
                const download = await downloadAttachmentMutation.mutateAsync({ attachmentId });
                window.open(download.downloadUrl, '_blank', 'noopener,noreferrer');
              }).then(() => undefined)
            }
          />

          <ReviewCommentThread
            comments={review.comments}
            status={review.status}
            currentUserId={actorId}
            canCreate={canCreateComment}
            onCreate={(content) =>
              runAction(() => createCommentMutation.mutateAsync({ content })).then(() => undefined)
            }
            onUpdate={(commentId, content) =>
              runAction(() => updateCommentMutation.mutateAsync({ commentId, content })).then(
                () => undefined,
              )
            }
            onDelete={(commentId) =>
              runAction(() => deleteCommentMutation.mutateAsync({ commentId })).then(
                () => undefined,
              )
            }
          />
        </div>

        <div className="space-y-6">
          <ReviewSidebarLists
            references={review.references}
            additionalReviewers={review.additionalReviewers}
            canManage={canManageReferences || canManageAdditionalReviewers}
            onAddReference={(userId) =>
              runAction(() =>
                addReferenceMutation.mutateAsync({ lockVersion: review.lockVersion, userId }),
              ).then(() => undefined)
            }
            onRemoveReference={(userId) =>
              runAction(() =>
                removeReferenceMutation.mutateAsync({ lockVersion: review.lockVersion, userId }),
              ).then(() => undefined)
            }
            onAddAdditionalReviewer={(userId) =>
              runAction(() =>
                addAdditionalReviewerMutation.mutateAsync({
                  lockVersion: review.lockVersion,
                  userId,
                }),
              ).then(() => undefined)
            }
            onRemoveAdditionalReviewer={(userId) =>
              runAction(() =>
                removeAdditionalReviewerMutation.mutateAsync({
                  lockVersion: review.lockVersion,
                  userId,
                }),
              ).then(() => undefined)
            }
          />

          <ReviewHistoryTimeline items={historiesQuery.data?.items ?? []} />

          <Card title="상태 규칙 요약" description="현재 상태에 따라 허용되는 액션을 정리합니다.">
            <div className="space-y-3 text-sm text-gray-600">
              <Rule
                icon={<Clock3 size={15} />}
                title="SUBMITTED"
                body="본문 수정, 승인, 반려, 취소, 참조자/추가검토자/첨부 관리, 코멘트 수정·삭제 가능"
                active={review.status === 'SUBMITTED'}
              />
              <Rule
                icon={<MessageSquareText size={15} />}
                title="APPROVED"
                body="읽기 전용 전환, 코멘트 작성만 허용"
                active={review.status === 'APPROVED'}
              />
              <Rule
                icon={<AlertTriangle size={15} />}
                title="REJECTED / CANCELLED"
                body="읽기 전용, 재상신 유도"
                active={review.status === 'REJECTED' || review.status === 'CANCELLED'}
              />
            </div>
          </Card>
        </div>
      </div>

      <Dialog
        open={approveOpen}
        title="리뷰 승인"
        description="현재 review를 APPROVED 상태로 전환합니다."
        confirmLabel="승인"
        onCancel={() => setApproveOpen(false)}
        onConfirm={() =>
          void runAction(async () => {
            await approveMutation.mutateAsync({ lockVersion: review.lockVersion });
            setApproveOpen(false);
          })
        }
      />

      <Dialog
        open={rejectOpen}
        title="리뷰 반려"
        description="반려 사유는 필수입니다."
        confirmLabel="반려"
        confirmVariant="danger"
        confirmDisabled={!rejectReason.trim()}
        onCancel={() => {
          setRejectOpen(false);
          setRejectReason('');
        }}
        onConfirm={() =>
          void runAction(async () => {
            await rejectMutation.mutateAsync({
              lockVersion: review.lockVersion,
              reason: rejectReason,
            });
            setRejectOpen(false);
            setRejectReason('');
          })
        }
      >
        <textarea
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          placeholder="반려 사유를 입력하세요."
        />
      </Dialog>

      <Dialog
        open={cancelOpen}
        title="리뷰 취소"
        description="제출된 review를 철회하고 task 상태를 IN_PROGRESS로 되돌립니다."
        confirmLabel="취소 실행"
        onCancel={() => {
          setCancelOpen(false);
          setCancelReason('');
        }}
        onConfirm={() =>
          void runAction(async () => {
            await cancelMutation.mutateAsync({
              lockVersion: review.lockVersion,
              input: { reason: cancelReason },
            });
            setCancelOpen(false);
            setCancelReason('');
          })
        }
      >
        <textarea
          value={cancelReason}
          onChange={(event) => setCancelReason(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          placeholder="선택 사항: 취소 사유를 입력하세요."
        />
      </Dialog>

      <Dialog
        open={conflictOpen}
        title="버전 충돌 감지"
        description="다른 사용자가 먼저 review를 수정했습니다. 최신 데이터를 다시 불러왔습니다."
        cancelLabel="확인"
        onCancel={() => setConflictOpen(false)}
      />
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{label}</div>
      <div className="mt-2 text-sm font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function Rule({
  icon,
  title,
  body,
  active,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  active: boolean;
}) {
  return (
    <div
      className={[
        'rounded-2xl border px-4 py-3',
        active ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-gray-100 bg-gray-50',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </div>
      <p className="mt-2 leading-6">{body}</p>
    </div>
  );
}
