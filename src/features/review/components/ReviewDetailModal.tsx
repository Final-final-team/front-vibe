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
                <MetaLine label="취소 시각" value={formatDate(review.cancelledAt)} />
                <MetaLine label="잠금 버전" value={`v${review.lockVersion}`} />
                <MetaLine label="참조자" value={`${review.references.length}명`} />
                <MetaLine label="추가 검토자" value={`${review.additionalReviewers.length}명`} />
                <MetaLine label="첨부" value={`${review.attachments.length}개`} />
                <MetaLine label="코멘트" value={`${review.comments.length}개`} />
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">최근 이력</div>
              <div className="mt-3 space-y-2">
                {(historiesQuery.data ?? []).slice(0, 4).map((history) => (
                  <div key={history.historyId} className="border-b border-border/50 pb-2 text-sm">
                    <div className="font-medium text-foreground">{getHistoryActionLabel(history.actionType)}</div>
                    <div className="mt-1 text-muted-foreground">{formatDate(history.occurredAt)}</div>
                    {history.reason ? <div className="mt-1 text-muted-foreground">{history.reason}</div> : null}
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
      size="xl"
      sideClassName="lg:max-w-[320px]"
    >
      {!review ? (
        <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-sm text-muted-foreground">
          검토 상세를 불러오는 중입니다.
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 border-b border-border/70 pb-5 md:grid-cols-4">
            <SummaryTile label="현재 상태" value={getReviewStatusLabel(review.status)} />
            <SummaryTile label="라운드" value={`${review.roundNo}차`} />
            <SummaryTile label="잠금 버전" value={`v${review.lockVersion}`} />
            <SummaryTile label="연결 업무" value={task?.title ?? `업무 #${review.taskId}`} />
          </section>

          <section className="grid gap-4 border-b border-border/70 pb-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <MetaBlock label="검토 본문" value={review.content} multiline />
            <div className="space-y-4">
              <MetaBlock
                label="반려 / 취소 메모"
                value={review.rejectionReason ?? '반려 또는 취소 메모 없음'}
                multiline
              />
              <MetaBlock
                label="업무 요약"
                value={task?.summary ?? '연결된 업무 요약이 아직 없습니다.'}
                multiline
              />
            </div>
          </section>

          <section className="grid gap-4 border-b border-border/70 pb-5 md:grid-cols-3">
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
                  ? review.attachments
                      .map(
                        (attachment) =>
                          `${attachment.originalName} · ${(attachment.sizeBytes / 1024).toFixed(0)}KB`,
                      )
                      .join('\n')
                  : '첨부 없음'
              }
              multiline
            />
            <MetaBlock
              label="최근 코멘트"
              value={
                review.comments.length > 0
                  ? review.comments
                      .slice(0, 4)
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

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/70 bg-muted/10 px-4 py-4">
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-semibold leading-6 text-foreground">{value}</div>
    </div>
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

function getHistoryActionLabel(actionType: string) {
  switch (actionType) {
    case 'REVIEW_CREATED':
      return '검토 생성';
    case 'REVIEW_APPROVED':
      return '검토 승인';
    case 'REVIEW_REJECTED':
      return '검토 반려';
    case 'REVIEW_CANCELLED':
      return '검토 취소';
    case 'REFERENCE_ASSIGNED':
      return '참조자 지정';
    case 'ADDITIONAL_REVIEWER_ASSIGNED':
      return '추가 검토자 지정';
    case 'COMMENT_CREATED':
      return '코멘트 작성';
    case 'ATTACHMENT_ADDED':
      return '첨부 추가';
    default:
      return actionType.replaceAll('_', ' ');
  }
}
