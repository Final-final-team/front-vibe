import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronRight, FileSearch, MessageSquareWarning, SendHorizontal } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { fetchTaskReviews } from '../features/review/api';
import ReviewDetailModal from '../features/review/components/ReviewDetailModal';
import { reviewKeys, useTasks } from '../features/review/hooks';
import { useProjectTaskMeta } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import AppModal from '../shared/ui/AppModal';
import StatusPill from '../shared/ui/StatusPill';

export default function ReviewInboxPage() {
  const { currentProject } = useWorkspace();
  const { data: taskMeta = [] } = useProjectTaskMeta(currentProject?.id ?? null);
  const { data: tasks = [] } = useTasks();
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [emptyTaskId, setEmptyTaskId] = useState<number | null>(null);

  const reviewQueries = useQueries({
    queries: taskMeta.map((meta) => ({
      queryKey: reviewKeys.taskReviews(meta.taskId),
      queryFn: () => fetchTaskReviews(meta.taskId),
    })),
  });

  const inboxRows = taskMeta.map((meta, index) => {
    const task = tasks.find((item) => item.id === meta.taskId);
    const latestReview = reviewQueries[index]?.data?.[0];

    return {
      meta,
      task,
      latestReview,
    };
  });

  const waitingQueue = inboxRows.filter((row) => row.task?.latestReviewStatus === 'IN_REVIEW');
  const approved = inboxRows.filter((row) => row.latestReview?.status === 'APPROVED');
  const empty = inboxRows.filter((row) => !row.latestReview);
  const reviewRows = inboxRows.filter(
    (row): row is typeof row & { latestReview: NonNullable<typeof row.latestReview> } => Boolean(row.latestReview),
  );
  const visibleRows = reviewRows.length > 0 ? reviewRows : inboxRows;
  const emptyTask = inboxRows.find((row) => row.meta.taskId === emptyTaskId)?.task ?? null;

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex flex-wrap items-center gap-5">
          <InlineStat label="검토 대기" value={`${waitingQueue.length}건`} icon={<SendHorizontal size={15} />} />
          <InlineStat label="최근 승인" value={`${approved.length}건`} icon={<FileSearch size={15} />} />
          <InlineStat label="미상신" value={`${empty.length}건`} icon={<MessageSquareWarning size={15} />} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-md">{currentProject?.code ?? '검토'}</Badge>
          <Badge variant="outline" className="rounded-md">{inboxRows.length}건</Badge>
          <span>프로젝트 검토 큐</span>
        </div>
      </section>

      <section className="border-t border-border/70 bg-background">
        <div className="flex items-end justify-between gap-3 border-b border-border/70 pb-4 pt-4">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">검토 보관함</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {reviewRows.length > 0
                ? `${currentProject?.name ?? '프로젝트'} 기준 검토 큐와 최신 라운드를 한 화면에서 확인합니다.`
                : `${currentProject?.name ?? '프로젝트'} 기준 검토 이력이 아직 없어, 검토 대상 업무까지 함께 보여줍니다.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-md">대기 {waitingQueue.length}</Badge>
            <Badge variant="outline" className="rounded-md">승인 {approved.length}</Badge>
          </div>
        </div>

        <Table className="mt-4 border-t border-border/70">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>업무</TableHead>
              <TableHead>업무 영역</TableHead>
              <TableHead>현재 상태</TableHead>
              <TableHead>최신 라운드</TableHead>
              <TableHead>상신 시각</TableHead>
              <TableHead className="text-right">상세</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map(({ meta, task, latestReview }) => (
              <TableRow
                key={meta.taskId}
                className="cursor-pointer transition hover:bg-muted/20"
                onClick={() => {
                  if (latestReview) {
                    setSelectedReviewId(latestReview.reviewId);
                    return;
                  }
                  setEmptyTaskId(meta.taskId);
                }}
              >
                <TableCell className="py-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">{task?.title}</div>
                    <div className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {task?.summary}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusPill tone="teal">{meta.domain}</StatusPill>
                </TableCell>
                <TableCell>
                  <StatusPill
                    tone={
                      task?.latestReviewStatus === 'COMPLETED'
                        ? 'green'
                        : task?.latestReviewStatus === 'IN_REVIEW'
                          ? 'amber'
                          : 'slate'
                    }
                  >
                    {task?.latestReviewStatus === 'COMPLETED'
                      ? '완료'
                      : task?.latestReviewStatus === 'IN_REVIEW'
                        ? '검토중'
                        : '진행중'}
                  </StatusPill>
                </TableCell>
                <TableCell>
                  {latestReview ? (
                    <StatusPill
                      tone={
                        latestReview.status === 'APPROVED'
                          ? 'green'
                          : latestReview.status === 'REJECTED'
                            ? 'rose'
                            : latestReview.status === 'CANCELLED'
                              ? 'slate'
                              : 'amber'
                      }
                    >
                      {latestReview.roundNo}차 · {getReviewStatusLabel(latestReview.status)}
                    </StatusPill>
                  ) : (
                    <StatusPill tone="slate">미상신</StatusPill>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {latestReview?.submittedAt
                    ? new Date(latestReview.submittedAt).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '미상신'}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (latestReview) {
                        setSelectedReviewId(latestReview.reviewId);
                        return;
                      }
                      setEmptyTaskId(meta.taskId);
                    }}
                  >
                    상세 보기
                    <ChevronRight size={14} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <AppModal
        open={Boolean(emptyTask)}
        onOpenChange={(open) => {
          if (!open) {
            setEmptyTaskId(null);
          }
        }}
        title={emptyTask?.title ?? '검토 준비'}
        description="이 업무에는 아직 검토 라운드가 없습니다. 첫 검토 상신 전 확인해야 할 맥락을 보여줍니다."
        badges={
          emptyTask ? (
            <>
              <StatusPill tone="slate">미상신</StatusPill>
              <StatusPill tone="teal">검토 준비</StatusPill>
            </>
          ) : null
        }
        className="w-[min(720px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] sm:max-w-[720px]"
        footer={
          <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setEmptyTaskId(null)}>
            닫기
          </Button>
        }
      >
        {emptyTask ? (
          <div className="space-y-4">
            <div className="grid gap-3 border-b border-border/70 pb-4 lg:grid-cols-2">
              <MetaLine label="업무 제목" value={emptyTask.title} />
              <MetaLine label="현재 상태" value={emptyTask.latestReviewStatus === 'COMPLETED' ? '완료' : emptyTask.latestReviewStatus === 'IN_REVIEW' ? '검토중' : '진행중'} />
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">업무 요약</div>
              <div className="mt-3 rounded-2xl border border-border/70 bg-muted/10 px-4 py-4 text-sm leading-6 text-foreground">
                {emptyTask.summary}
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 px-4 py-4 text-sm leading-6 text-muted-foreground">
              아직 검토 이력이 없어서 상세 검토 모달 대신 준비 상태를 보여줍니다. 실제 검토 도메인 API가 연결되면 이 지점은 첫 라운드 상신과 검토 초안 상태로 교체됩니다.
            </div>
          </div>
        ) : null}
      </AppModal>

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

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2 text-sm text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
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
