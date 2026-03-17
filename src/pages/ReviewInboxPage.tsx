import { useQueries } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Eye, FileSearch, MessageSquareWarning, SendHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { fetchTaskReviews } from '../features/review/api';
import { reviewKeys, useTasks } from '../features/review/hooks';
import { useProjectTaskMeta } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import StatusPill from '../shared/ui/StatusPill';

export default function ReviewInboxPage() {
  const { currentProject } = useWorkspace();
  const { data: taskMeta = [] } = useProjectTaskMeta(currentProject?.id ?? null);
  const { data: tasks = [] } = useTasks();

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

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-4">
        <div className="flex flex-wrap items-center gap-6">
          <InlineStat label="검토 대기" value={`${waitingQueue.length}건`} icon={<SendHorizontal size={15} />} />
          <InlineStat label="최근 승인" value={`${approved.length}건`} icon={<FileSearch size={15} />} />
          <InlineStat label="미상신" value={`${empty.length}건`} icon={<MessageSquareWarning size={15} />} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-md">{currentProject?.code ?? 'REVIEWS'}</Badge>
          <Badge variant="outline" className="rounded-md">{inboxRows.length} rows</Badge>
          <span>project review queue</span>
        </div>
      </section>

      <section className="border-t border-border/70 bg-background">
        <div className="flex items-end justify-between gap-4 border-b border-border/70 pb-4 pt-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Review Inbox</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentProject?.name ?? '프로젝트'} 기준 검토 큐와 최신 라운드를 한 화면에서 확인합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-md">pending {waitingQueue.length}</Badge>
            <Badge variant="outline" className="rounded-md">approved {approved.length}</Badge>
          </div>
        </div>

        <Table className="mt-4 border-t border-border/70">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>업무</TableHead>
              <TableHead>도메인</TableHead>
              <TableHead>현재 상태</TableHead>
              <TableHead>최신 라운드</TableHead>
              <TableHead>진입</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inboxRows.map(({ meta, task, latestReview }) => (
              <TableRow key={meta.taskId}>
                <TableCell className="py-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">{task?.title}</div>
                    <div className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{task?.summary}</div>
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
                      Round {latestReview.roundNo} · {latestReview.status}
                    </StatusPill>
                  ) : (
                    <span className="text-sm text-muted-foreground">미상신</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="h-8 rounded-md px-2.5 text-primary hover:text-primary">
                      <Link to={`/tasks/${meta.taskId}/reviews`}>
                        <Eye size={14} />
                        목록
                      </Link>
                    </Button>
                    {latestReview && (
                      <Link
                        to={`/reviews/${latestReview.reviewId}`}
                        className="text-sm font-semibold text-foreground/70 hover:text-foreground"
                      >
                        상세
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
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
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="mt-1 text-xl font-semibold tracking-tight text-foreground">{value}</div>
      </div>
    </div>
  );
}
