import { useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronRight, FileSearch, SendHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { fetchTaskReviews } from '../features/review/api';
import ReviewDetailModal from '../features/review/components/ReviewDetailModal';
import { reviewKeys, useTasks } from '../features/review/hooks';
import { useProjectTaskMeta } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import StatusPill from '../shared/ui/StatusPill';

export default function ReviewInboxPage() {
  const { currentProject } = useWorkspace();
  const { data: taskMeta = [] } = useProjectTaskMeta(currentProject?.id ?? null);
  const { data: tasks = [] } = useTasks();
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const reviewQueries = useQueries({
    queries: taskMeta.map((meta) => ({
      queryKey: reviewKeys.taskReviews(meta.taskId),
      queryFn: () => fetchTaskReviews(meta.taskId),
    })),
  });

  const inboxRows = useMemo(
    () =>
      taskMeta
        .map((meta, index) => {
          const task = tasks.find((item) => item.id === meta.taskId);
          const latestReview = reviewQueries[index]?.data?.[0] ?? null;

          return {
            meta,
            task,
            latestReview,
          };
        })
        .sort((a, b) => {
          const aTime = a.latestReview?.submittedAt ? new Date(a.latestReview.submittedAt).getTime() : 0;
          const bTime = b.latestReview?.submittedAt ? new Date(b.latestReview.submittedAt).getTime() : 0;
          return bTime - aTime;
        }),
    [reviewQueries, taskMeta, tasks],
  );

  const waitingQueue = inboxRows.filter((row) => row.task?.latestReviewStatus === 'IN_REVIEW');
  const approved = inboxRows.filter((row) => row.latestReview?.status === 'APPROVED');
  const rejected = inboxRows.filter((row) => row.latestReview?.status === 'REJECTED');
  const noReviewCount = inboxRows.filter((row) => !row.latestReview).length;

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-4 pt-2">
        <div className="flex flex-wrap items-center gap-5">
          <InlineStat label="검토 대기" value={`${waitingQueue.length}건`} icon={<SendHorizontal size={15} />} />
          <InlineStat label="최근 승인" value={`${approved.length}건`} icon={<FileSearch size={15} />} />
          <InlineStat label="최근 반려" value={`${rejected.length}건`} icon={<FileSearch size={15} />} />
          <InlineStat label="미상신" value={`${noReviewCount}건`} icon={<ChevronRight size={15} />} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-md">
            {currentProject?.code ?? '검토'}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {inboxRows.length}건
          </Badge>
          <span>프로젝트 검토 큐</span>
        </div>
      </section>

      <section className="bg-background pt-4">
        <div className="flex items-end justify-between gap-3 border-b border-border/70 pb-4 pt-2">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">검토 보관함</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {`${currentProject?.name ?? '프로젝트'} 기준으로 이미 생성된 검토와 아직 첫 상신이 없는 업무를 함께 확인합니다.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-md">
              대기 {waitingQueue.length}
            </Badge>
            <Badge variant="outline" className="rounded-md">
              승인 {approved.length}
            </Badge>
            <Badge variant="outline" className="rounded-md">
              반려 {rejected.length}
            </Badge>
            <Badge variant="outline" className="rounded-md">
              미상신 {noReviewCount}
            </Badge>
          </div>
        </div>

        <div className="pt-5">
          <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(120px,0.8fr)_minmax(120px,0.9fr)_minmax(130px,0.9fr)_minmax(140px,1fr)_minmax(140px,1fr)_96px] gap-4 border-b border-border/70 px-2 pb-3 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground lg:grid">
            <div>업무</div>
            <div>업무 영역</div>
            <div>최신 라운드</div>
            <div>검토 상태</div>
            <div>상신 시각</div>
            <div>처리 시각</div>
            <div className="text-right">상세</div>
          </div>
          <div className="hidden divide-y divide-border/70 lg:block">
            {inboxRows.length > 0 ? inboxRows.map((row) => <InboxDesktopRow key={row.meta.taskId} row={row} onOpenDetail={setSelectedReviewId} />) : <ReviewEmptyState />}
          </div>
          <div className="space-y-3 lg:hidden">
            {inboxRows.length > 0 ? inboxRows.map((row) => <InboxMobileRow key={row.meta.taskId} row={row} onOpenDetail={setSelectedReviewId} />) : <ReviewEmptyState />}
          </div>
        </div>
      </section>

      <ReviewDetailModal
        reviewId={selectedReviewId}
        open={Boolean(selectedReviewId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReviewId(null);
          }
        }}
      />
    </div>
  );
}

function InboxDesktopRow({
  row,
  onOpenDetail,
}: {
  row: {
    meta: { taskId: number; domain: string };
    task?: { title: string; summary: string } | undefined;
    latestReview: {
      reviewId: number;
      roundNo: number;
      status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
      submittedAt: string | null;
      decidedAt: string | null;
    } | null;
  };
  onOpenDetail: (reviewId: number) => void;
}) {
  const { meta, task, latestReview } = row;

  return (
    <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(120px,0.8fr)_minmax(120px,0.9fr)_minmax(130px,0.9fr)_minmax(140px,1fr)_minmax(140px,1fr)_96px] gap-4 px-2 py-4">
      <div className="min-w-0">
        <div className="truncate font-semibold text-foreground">{task?.title ?? `업무 #${meta.taskId}`}</div>
        <div className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {task?.summary ?? '연결된 업무 요약이 아직 없습니다.'}
        </div>
      </div>
      <div className="flex items-start pt-1">
        <StatusPill tone="teal">{meta.domain}</StatusPill>
      </div>
      <div className="pt-1 text-sm font-medium text-foreground">{latestReview ? `${latestReview.roundNo}차` : '-'}</div>
      <div className="flex items-start pt-1">
        {latestReview ? (
          <StatusPill tone={getReviewTone(latestReview.status)}>{getReviewStatusLabel(latestReview.status)}</StatusPill>
        ) : (
          <StatusPill tone="slate">검토 없음</StatusPill>
        )}
      </div>
      <div className="pt-1 text-sm text-muted-foreground">{formatCompactDate(latestReview?.submittedAt ?? null)}</div>
      <div className="pt-1 text-sm text-muted-foreground">{formatCompactDate(latestReview?.decidedAt ?? null)}</div>
      <div className="flex items-start justify-end pt-1">
        {latestReview ? (
          <Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-xs" onClick={() => onOpenDetail(latestReview.reviewId)}>
            상세 보기
            <ChevronRight size={13} />
          </Button>
        ) : (
          <Button asChild variant="outline" className="h-8 rounded-lg px-3 text-xs">
            <Link to={`/tasks/${meta.taskId}/reviews/new`}>첫 상신</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function InboxMobileRow({
  row,
  onOpenDetail,
}: {
  row: {
    meta: { taskId: number; domain: string };
    task?: { title: string } | undefined;
    latestReview: {
      reviewId: number;
      roundNo: number;
      status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
      submittedAt: string | null;
      decidedAt: string | null;
    } | null;
  };
  onOpenDetail: (reviewId: number) => void;
}) {
  const { meta, task, latestReview } = row;

  return (
    <div className="border-b border-border/70 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{task?.title ?? `업무 #${meta.taskId}`}</div>
          <div className="mt-1 text-sm text-muted-foreground">{meta.domain}</div>
        </div>
        <StatusPill tone={latestReview ? getReviewTone(latestReview.status) : 'slate'}>
          {latestReview ? getReviewStatusLabel(latestReview.status) : '검토 없음'}
        </StatusPill>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
        <div className="flex items-center justify-between gap-3">
          <span>최신 라운드</span>
          <span className="font-medium text-foreground">{latestReview ? `${latestReview.roundNo}차` : '-'}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>상신 시각</span>
          <span className="font-medium text-foreground">{formatCompactDate(latestReview?.submittedAt ?? null)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>처리 시각</span>
          <span className="font-medium text-foreground">{formatCompactDate(latestReview?.decidedAt ?? null)}</span>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        {latestReview ? (
          <Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-xs" onClick={() => onOpenDetail(latestReview.reviewId)}>
            상세 보기
            <ChevronRight size={13} />
          </Button>
        ) : (
          <Button asChild variant="outline" className="h-8 rounded-lg px-3 text-xs">
            <Link to={`/tasks/${meta.taskId}/reviews/new`}>첫 상신</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-border/70 px-5 py-12 text-center">
      <div className="text-base font-semibold text-foreground">검토가 아직 없습니다</div>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">
        현재 프로젝트에 생성된 검토 라운드가 없습니다. 업무 화면에서 첫 상신을 시작하면 이 화면에서 최신 검토 흐름을 바로 관리할 수 있습니다.
      </p>
      <Button asChild className="rounded-xl px-4">
        <Link to="/tasks">업무에서 첫 상신 시작</Link>
      </Button>
    </div>
  );
}

function InlineStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <div className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">{value}</div>
      </div>
    </div>
  );
}

function formatCompactDate(value: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
