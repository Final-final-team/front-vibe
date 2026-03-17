import { Button } from '../../../components/ui/button';
import { useReviewDetail, useReviewHistories, useTasks } from '../hooks';
import { formatDate } from '../../../shared/lib/format';
import AppModal from '../../../shared/ui/AppModal';
import StatusPill from '../../../shared/ui/StatusPill';

type Props = {
  reviewId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ReviewDetailModal({ reviewId, open, onOpenChange }: Props) {
  const detailQuery = useReviewDetail(reviewId ?? 0, open && Boolean(reviewId));
  const historiesQuery = useReviewHistories(reviewId ?? 0, open && Boolean(reviewId));
  const { data: tasks = [] } = useTasks();

  const review = detailQuery.data;
  const task = tasks.find((item) => item.id === review?.taskId);

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={task?.title ?? (review ? `검토 #${review.reviewId}` : '검토 상세')}
      description={review ? `${review.roundNo}차 검토 상세와 히스토리, 첨부, 코멘트 상태를 확인합니다.` : '검토 정보를 불러오는 중입니다.'}
      badges={
        review ? (
          <>
            <StatusPill tone={getReviewTone(review.status)}>{getReviewStatusLabel(review.status)}</StatusPill>
            <StatusPill tone="slate">{review.roundNo}차</StatusPill>
            <StatusPill tone="purple">업무 #{review.taskId}</StatusPill>
          </>
        ) : null
      }
      side={
        review ? (
          <div className="space-y-5">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">처리 메타</div>
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                <MetaLine label="상신 시각" value={formatDate(review.submittedAt)} />
                <MetaLine label="처리 시각" value={formatDate(review.decidedAt)} />
                <MetaLine label="잠금 버전" value={`v${review.lockVersion}`} />
                <MetaLine label="참조자" value={`${review.references.length}명`} />
                <MetaLine label="추가 검토자" value={`${review.additionalReviewers.length}명`} />
                <MetaLine label="첨부" value={`${review.attachments.length}개`} />
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">최근 이력</div>
              <div className="mt-3 space-y-2">
                {(historiesQuery.data ?? []).slice(0, 4).map((history) => (
                  <div key={history.historyId} className="border-b border-border/50 pb-2 text-sm">
                    <div className="font-medium text-foreground">{history.actionType.replaceAll('_', ' ')}</div>
                    <div className="mt-1 text-muted-foreground">{formatDate(history.occurredAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null
      }
      footer={
        <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => onOpenChange(false)}>
          닫기
        </Button>
      }
      size="lg"
      sideClassName="lg:max-w-[320px]"
    >
      {!review ? (
        <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-sm text-muted-foreground">
          검토 상세를 불러오는 중입니다.
        </div>
      ) : (
        <div className="space-y-5">
          <section className="grid gap-4 border-b border-border/70 pb-5 lg:grid-cols-2">
            <MetaBlock label="검토 본문" value={review.content} multiline />
            <MetaBlock
              label="반려 사유"
              value={review.rejectionReason ?? '반려 사유 없음'}
              multiline
            />
          </section>

          <section className="grid gap-4 border-b border-border/70 pb-5 lg:grid-cols-3">
            <MetaBlock label="상신자" value={`#${review.submittedBy}`} />
            <MetaBlock label="결정자" value={review.decidedBy ? `#${review.decidedBy}` : '-'} />
            <MetaBlock label="취소자" value={review.cancelledBy ? `#${review.cancelledBy}` : '-'} />
          </section>

          <section className="grid gap-4 border-b border-border/70 pb-5 lg:grid-cols-2">
            <MetaBlock label="참조자" value={review.references.map((ref) => `#${ref.userId}`).join(', ') || '없음'} multiline />
            <MetaBlock
              label="추가 검토자"
              value={review.additionalReviewers.map((reviewer) => `#${reviewer.userId}`).join(', ') || '없음'}
              multiline
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <MetaBlock
              label="첨부"
              value={
                review.attachments.length > 0
                  ? review.attachments.map((attachment) => attachment.originalName).join('\n')
                  : '첨부 없음'
              }
              multiline
            />
            <MetaBlock
              label="코멘트"
              value={
                review.comments.length > 0
                  ? review.comments
                      .slice(0, 3)
                      .map((comment) => `#${comment.authorId} · ${comment.content}`)
                      .join('\n')
                  : '코멘트 없음'
              }
              multiline
            />
          </section>
        </div>
      )}
    </AppModal>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function MetaBlock({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      <div
        className={[
          'mt-3 rounded-2xl border border-border/70 bg-muted/10 px-4 py-4 text-sm leading-6 text-foreground',
          multiline ? 'whitespace-pre-wrap break-keep' : '',
        ].join(' ')}
      >
        {value}
      </div>
    </div>
  );
}

function getReviewStatusLabel(status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED') {
  switch (status) {
    case 'APPROVED':
      return '승인';
    case 'REJECTED':
      return '반려';
    case 'CANCELLED':
      return '취소';
    default:
      return '제출';
  }
}

function getReviewTone(status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED') {
  switch (status) {
    case 'APPROVED':
      return 'green';
    case 'REJECTED':
      return 'rose';
    case 'CANCELLED':
      return 'slate';
    default:
      return 'amber';
  }
}
