import type { ReactNode } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Eye, FileSearch, MessageSquareWarning, SendHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchTaskReviews } from '../features/review/api';
import { reviewKeys, useTasks } from '../features/review/hooks';
import { useProjectTaskMeta } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import Card from '../shared/ui/Card';
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
    <div className="space-y-4">
      <section className="grid gap-3 xl:grid-cols-3">
        <MiniMetric
          label="검토 대기"
          value={`${waitingQueue.length}건`}
          hint="즉시 처리 대상"
          icon={<SendHorizontal size={16} />}
        />
        <MiniMetric
          label="최근 승인"
          value={`${approved.length}건`}
          hint="완료 라운드"
          icon={<FileSearch size={16} />}
        />
        <MiniMetric
          label="미상신 업무"
          value={`${empty.length}건`}
          hint="review 미생성"
          icon={<MessageSquareWarning size={16} />}
        />
      </section>

      <div className="grid gap-4">
        <Card
          title="Review Inbox"
          description={`${currentProject?.name ?? '프로젝트'} 기준 검토 큐와 최신 라운드를 한 화면에서 확인합니다.`}
          action={
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-lg px-2.5 py-1">{inboxRows.length} rows</Badge>
              <Badge variant="outline" className="rounded-lg px-2.5 py-1">pending {waitingQueue.length}</Badge>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr] border-b border-border/70 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <div>업무</div>
                <div>도메인</div>
                <div>현재 상태</div>
                <div>최신 라운드</div>
                <div>진입</div>
              </div>
              <div className="divide-y divide-border/60">
                {inboxRows.map(({ meta, task, latestReview }) => (
                  <div
                    key={meta.taskId}
                    className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr] gap-4 rounded-xl px-3 py-4 text-sm transition hover:bg-muted/35"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{task?.title}</div>
                      <div className="mt-1 line-clamp-2 text-muted-foreground">{task?.summary}</div>
                    </div>
                    <div className="flex items-center">
                      <StatusPill tone="teal">{meta.domain}</StatusPill>
                    </div>
                    <div className="flex items-center">
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
                    </div>
                    <div className="flex items-center">
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
                        <StatusPill tone="slate">미상신</StatusPill>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="ghost" size="sm" className="h-8 rounded-xl px-2.5 text-primary hover:text-primary">
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <section className="flex items-center justify-between rounded-xl border border-border/70 bg-card/96 px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
        <div className="mt-1 text-[24px] font-semibold tracking-tight text-foreground">{value}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-muted/30 text-foreground/75">
        {icon}
      </div>
    </section>
  );
}
