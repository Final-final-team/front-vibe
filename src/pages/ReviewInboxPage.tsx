import { useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ChevronRight, FileSearch, SendHorizontal } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { fetchReviewDetail, fetchTaskReviews } from '../features/review/api';
import ReviewDetailModal from '../features/review/components/ReviewDetailModal';
import { reviewKeys } from '../features/review/hooks';
import { useProjectTasks } from '../features/tasks/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { appConfig } from '../shared/config/app-config';
import StatusPill from '../shared/ui/StatusPill';
import { formatDate } from '../shared/lib/format';
import { getCurrentActor } from '../shared/lib/session';

type InboxFilter = 'MINE' | 'ALL';

export default function ReviewInboxPage() {
  const { currentProject, currentUserId } = useWorkspace();
  const { projectId: projectIdParam } = useParams();
  const projectId = Number(projectIdParam ?? currentProject?.id ?? 0);
  const { data: taskPage, isLoading, error } = useProjectTasks(projectId);
  const tasks = useMemo(() => taskPage?.items ?? [], [taskPage?.items]);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>('MINE');
  const actorId = appConfig.useMock ? getCurrentActor().actorId : currentUserId;

  const reviewQueries = useQueries({
    queries: tasks.map((task) => ({
      queryKey: reviewKeys.taskReviews(task.id),
      queryFn: () => fetchTaskReviews(task.id),
    })),
  });

  const inboxRows = useMemo(
    () =>
      tasks
        .map((task, index) => ({
          task,
          latestReview: reviewQueries[index]?.data?.items?.[0] ?? null,
        }))
        .sort((a, b) => {
          const aTime = a.latestReview?.submittedAt ? new Date(a.latestReview.submittedAt).getTime() : 0;
          const bTime = b.latestReview?.submittedAt ? new Date(b.latestReview.submittedAt).getTime() : 0;
          return bTime - aTime;
        }),
    [reviewQueries, tasks],
  );

  const latestReviewDetailQueries = useQueries({
    queries: inboxRows
      .filter((row) => row.latestReview)
      .map((row) => ({
        queryKey: reviewKeys.detail(row.latestReview!.reviewId),
        queryFn: () => fetchReviewDetail(row.latestReview!.reviewId),
      })),
  });

  const latestReviewDetailsById = useMemo(
    () =>
      new Map(
        inboxRows
          .filter((row) => row.latestReview)
          .map((row, index) => [row.latestReview!.reviewId, latestReviewDetailQueries[index]?.data] as const),
      ),
    [inboxRows, latestReviewDetailQueries],
  );

  const myInboxRows = useMemo(() => {
    if (actorId == null) {
      return inboxRows;
    }

    return inboxRows.filter((row) => {
      if (!row.latestReview) {
        return false;
      }

      const detail = latestReviewDetailsById.get(row.latestReview.reviewId);

      if (!detail) {
        return false;
      }

      return (
        detail.submittedBy === actorId ||
        detail.decidedBy === actorId ||
        detail.cancelledBy === actorId ||
        detail.references.some((reference) => reference.userId === actorId) ||
        detail.additionalReviewers.some((reviewer) => reviewer.userId === actorId)
      );
    });
  }, [actorId, inboxRows, latestReviewDetailsById]);

  const visibleRows = inboxFilter === 'MINE' ? myInboxRows : inboxRows;

  const waitingQueue = visibleRows.filter((row) => row.task.status === 'IN_REVIEW');
  const approved = visibleRows.filter((row) => row.latestReview?.status === 'APPROVED');
  const rejected = visibleRows.filter((row) => row.latestReview?.status === 'REJECTED');
  const noReviewCount = visibleRows.filter((row) => !row.latestReview).length;

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] border border-border/70 bg-[var(--surface-panel)] px-6 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:gap-x-10">
          <InlineStat label="검토 대기" value={`${waitingQueue.length}건`} icon={<SendHorizontal size={15} />} />
          <InlineStat label="최근 승인" value={`${approved.length}건`} icon={<FileSearch size={15} />} />
          <InlineStat label="최근 반려" value={`${rejected.length}건`} icon={<FileSearch size={15} />} />
          <InlineStat label="미상신" value={`${noReviewCount}건`} icon={<ChevronRight size={15} />} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-md">
            {currentProject?.code ?? `PRJ-${projectId}`}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {visibleRows.length}건
          </Badge>
          <span>{inboxFilter === 'MINE' ? '내 검토 큐' : '프로젝트 검토 큐'}</span>
        </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">
          {(error as Error).message}
        </div>
      ) : isLoading ? (
        <div className="rounded-3xl border border-border/70 bg-background px-6 py-12 text-sm text-muted-foreground">
          검토 보관함을 불러오는 중입니다.
        </div>
      ) : (
        <section className="rounded-[30px] border border-border/70 bg-white/75 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
          <div className="flex items-end justify-between gap-3 border-b border-border/70 pb-4 pt-2">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                {inboxFilter === 'MINE' ? '내 검토 보관함' : '전체 검토 보관함'}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {inboxFilter === 'MINE'
                  ? '나와 연결된 최신 검토 라운드만 먼저 모아보고, 필요하면 전체 프로젝트 검토로 확장합니다.'
                  : '백엔드 프로젝트 업무를 기준으로 최신 검토 라운드와 미상신 업무를 함께 확인합니다.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip active={inboxFilter === 'MINE'} onClick={() => setInboxFilter('MINE')}>
                내 검토 {myInboxRows.length}
              </FilterChip>
              <FilterChip active={inboxFilter === 'ALL'} onClick={() => setInboxFilter('ALL')}>
                전체 검토 {inboxRows.length}
              </FilterChip>
              <Badge variant="outline" className="rounded-md">대기 {waitingQueue.length}</Badge>
              <Badge variant="outline" className="rounded-md">승인 {approved.length}</Badge>
              <Badge variant="outline" className="rounded-md">반려 {rejected.length}</Badge>
            </div>
          </div>

          <div className="pt-5">
            <div className="hidden grid-cols-[minmax(0,2.2fr)_110px_110px_120px_140px_140px_96px] gap-4 border-b border-border/70 px-2 pb-3 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground lg:grid">
              <div>업무</div>
              <div>업무 상태</div>
              <div>최신 라운드</div>
              <div>검토 상태</div>
              <div>상신 시각</div>
              <div>처리 시각</div>
              <div className="text-right">상세</div>
            </div>
            <div className="hidden divide-y divide-border/70 lg:block">
              {visibleRows.length > 0 ? visibleRows.map((row) => <InboxDesktopRow key={row.task.id} row={row} projectId={projectId} onOpenDetail={setSelectedReviewId} />) : <ReviewEmptyState projectId={projectId} mine={inboxFilter === 'MINE'} />}
            </div>
            <div className="space-y-3 lg:hidden">
              {visibleRows.length > 0 ? visibleRows.map((row) => <InboxMobileRow key={row.task.id} row={row} projectId={projectId} onOpenDetail={setSelectedReviewId} />) : <ReviewEmptyState projectId={projectId} mine={inboxFilter === 'MINE'} />}
            </div>
          </div>
        </section>
      )}

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
  projectId,
  onOpenDetail,
}: {
  row: {
    task: { id: number; title: string; status: string };
    latestReview: {
      reviewId: number;
      roundNo: number;
      status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
      submittedAt: string | null;
      decidedAt: string | null;
    } | null;
  };
  projectId: number;
  onOpenDetail: (reviewId: number) => void;
}) {
  const { task, latestReview } = row;

  return (
    <div className="grid grid-cols-[minmax(0,2.2fr)_110px_110px_120px_140px_140px_96px] gap-4 px-2 py-4">
      <div className="min-w-0">
        <div className="truncate font-semibold text-foreground">{task.title}</div>
        <div className="mt-1 text-sm text-muted-foreground">업무 #{task.id}</div>
      </div>
      <div className="flex items-start pt-1">
        <StatusPill tone={getTaskTone(task.status)}>{getTaskStatusLabel(task.status)}</StatusPill>
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
            <Link to={`/projects/${projectId}/tasks/${task.id}/reviews/new`}>첫 상신</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function InboxMobileRow({
  row,
  projectId,
  onOpenDetail,
}: {
  row: {
    task: { id: number; title: string; status: string };
    latestReview: {
      reviewId: number;
      roundNo: number;
      status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
      submittedAt: string | null;
      decidedAt: string | null;
    } | null;
  };
  projectId: number;
  onOpenDetail: (reviewId: number) => void;
}) {
  const { task, latestReview } = row;

  return (
    <div className="border-b border-border/70 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{task.title}</div>
          <div className="mt-1 text-sm text-muted-foreground">업무 #{task.id}</div>
        </div>
        <StatusPill tone={latestReview ? getReviewTone(latestReview.status) : 'slate'}>
          {latestReview ? getReviewStatusLabel(latestReview.status) : '검토 없음'}
        </StatusPill>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
        <MetaRow label="업무 상태" value={getTaskStatusLabel(task.status)} />
        <MetaRow label="최신 라운드" value={latestReview ? `${latestReview.roundNo}차` : '-'} />
        <MetaRow label="상신 시각" value={formatCompactDate(latestReview?.submittedAt ?? null)} />
        <MetaRow label="처리 시각" value={formatCompactDate(latestReview?.decidedAt ?? null)} />
      </div>
      <div className="mt-3 flex justify-end">
        {latestReview ? (
          <Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-xs" onClick={() => onOpenDetail(latestReview.reviewId)}>
            상세 보기
            <ChevronRight size={13} />
          </Button>
        ) : (
          <Button asChild variant="outline" className="h-8 rounded-lg px-3 text-xs">
            <Link to={`/projects/${projectId}/tasks/${task.id}/reviews/new`}>첫 상신</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewEmptyState({ projectId, mine }: { projectId: number; mine: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-border/70 px-5 py-12 text-center">
      <div className="text-base font-semibold text-foreground">{mine ? '지금 나에게 온 검토가 없습니다' : '검토가 아직 없습니다'}</div>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">
        {mine
          ? '현재 사용자와 연결된 검토가 없습니다. 전체 검토 보기로 전환하거나, 업무 화면에서 새 검토 상신을 시작할 수 있습니다.'
          : '현재 프로젝트에 생성된 검토 라운드가 없습니다. 업무 화면에서 첫 상신을 시작하면 이 화면에서 최신 검토 흐름을 바로 관리할 수 있습니다.'}
      </p>
      <Button asChild className="rounded-xl px-4">
        <Link to={`/projects/${projectId}/tasks`}>업무에서 첫 상신 시작</Link>
      </Button>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
        active
          ? 'border-primary/30 bg-primary/8 text-primary shadow-sm'
          : 'border-border/70 bg-white/70 text-muted-foreground hover:border-border hover:text-foreground',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function InlineStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-white/80 text-primary shadow-sm">
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
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

function getTaskStatusLabel(status: string) {
  switch (status) {
    case 'PENDING':
      return '대기';
    case 'IN_PROGRESS':
      return '진행중';
    case 'IN_REVIEW':
      return '검토중';
    default:
      return '완료';
  }
}

function getTaskTone(status: string) {
  switch (status) {
    case 'PENDING':
      return 'slate';
    case 'IN_PROGRESS':
      return 'blue';
    case 'IN_REVIEW':
      return 'amber';
    default:
      return 'green';
  }
}

function formatCompactDate(value: string | null) {
  return value ? formatDate(value) : '-';
}
