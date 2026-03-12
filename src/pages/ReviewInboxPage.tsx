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
    <div className="space-y-6">
      <section className="flex flex-wrap items-center gap-2">
        <Badge className="rounded-full bg-emerald-500/12 px-3 py-1 text-emerald-700 hover:bg-emerald-500/12">
          Review Queue
        </Badge>
        <Badge variant="outline" className="rounded-full px-3 py-1">
          {currentProject?.name ?? '프로젝트'}
        </Badge>
        <Badge variant="outline" className="rounded-full px-3 py-1">
          latest rounds
        </Badge>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <MiniMetric
          label="Pending Review"
          value={`${waitingQueue.length}건`}
          hint="승인 또는 반려 대기"
          icon={<SendHorizontal size={16} />}
        />
        <MiniMetric
          label="Approved Rounds"
          value={`${approved.length}건`}
          hint="최근 승인된 라운드"
          icon={<FileSearch size={16} />}
        />
        <MiniMetric
          label="No Review Yet"
          value={`${empty.length}건`}
          hint="아직 검토 미생성"
          icon={<MessageSquareWarning size={16} />}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <Card
          title="Review Inbox"
          description="프로젝트 단위 검토 큐와 최근 라운드를 한 곳에서 추적합니다."
          action={<Badge variant="outline" className="rounded-full px-3 py-1">{inboxRows.length} queue rows</Badge>}
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
                    className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr] gap-4 rounded-[22px] px-3 py-4 text-sm transition hover:bg-muted/35"
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

        <div className="space-y-6">
          <Card title="처리 패턴" description="이 화면이 실제로 담당하는 역할">
            <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
              <li>업무 탭에서는 row나 상세 패널을 통해 검토 흐름으로 진입합니다.</li>
              <li>검토 탭은 inbox 스타일로 현재 처리할 라운드를 모아보는 목적에 집중합니다.</li>
              <li>상세, 수정, 상신 화면은 기존 review 라우트를 그대로 사용합니다.</li>
            </ul>
          </Card>

          <Card title="정책 미확정" description="실제 연동 전 합의가 필요한 항목">
            <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
              <li>프로젝트 종료/재개/삭제 전이 규칙은 아직 확정되지 않았습니다.</li>
              <li>역할 해제 이벤트와 보고 승인 권한 모델은 추후 정책 합의가 필요합니다.</li>
              <li>알림/실시간 정책은 review 도메인 이벤트 확정 이후 단계로 남겨둡니다.</li>
            </ul>
          </Card>
        </div>
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
    <section className="flex items-center justify-between rounded-[22px] border border-border/70 bg-card/95 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
        <div className="mt-1.5 text-[28px] font-semibold tracking-tight text-foreground">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{hint}</div>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-muted/35 text-foreground/75">
        {icon}
      </div>
    </section>
  );
}
