import { useMemo, type ReactNode } from 'react';
import { useQueries } from '@tanstack/react-query';
import { CalendarClock, ChartColumn, ChevronRight, KanbanSquare, ListTodo, SendHorizontal } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { fetchTaskReviews } from '../features/review/api';
import { reviewKeys } from '../features/review/hooks';
import { useProjectTasks } from '../features/tasks/hooks';
import type { TaskSummary, TaskStatus } from '../features/tasks/types';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';
import StatusPill from '../shared/ui/StatusPill';

const VIEW_VALUES = ['table', 'kanban', 'calendar', 'chart', 'gantt'] as const;
type TaskView = (typeof VIEW_VALUES)[number];
type LatestReview = {
  reviewId: number;
  roundNo: number;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  submittedAt: string | null;
  decidedAt: string | null;
} | null;

export default function TaskListPage() {
  const { currentProject } = useWorkspace();
  const projectId = Number(currentProject?.id ?? 0);
  const { data: taskPage, isLoading, error } = useProjectTasks(projectId);
  const [searchParams] = useSearchParams();
  const currentView = getCurrentView(searchParams.get('view'));
  const tasks = useMemo(() => taskPage?.items ?? [], [taskPage?.items]);

  const reviewQueries = useQueries({
    queries: tasks.map((task) => ({
      queryKey: reviewKeys.taskReviews(task.id),
      queryFn: () => fetchTaskReviews(task.id),
      enabled: task.status === 'IN_REVIEW' || task.status === 'COMPLETED',
    })),
  });

  const rows = useMemo(
    () =>
      tasks.map((task, index) => {
        const latestReview = reviewQueries[index]?.data?.items?.[0] ?? null;
        return { task, latestReview };
      }),
    [reviewQueries, tasks],
  );

  const counts = useMemo(
    () => ({
      total: rows.length,
      pending: rows.filter((row) => row.task.status === 'PENDING').length,
      active: rows.filter((row) => row.task.status === 'IN_PROGRESS').length,
      inReview: rows.filter((row) => row.task.status === 'IN_REVIEW').length,
      completed: rows.filter((row) => row.task.status === 'COMPLETED').length,
    }),
    [rows],
  );

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-5 pt-3">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:gap-x-10">
          <InlineStat label="전체 업무" value={`${counts.total}건`} icon={<ListTodo size={15} />} />
          <InlineStat label="진행중" value={`${counts.active}건`} icon={<KanbanSquare size={15} />} />
          <InlineStat label="검토중" value={`${counts.inReview}건`} icon={<SendHorizontal size={15} />} />
          <InlineStat label="완료" value={`${counts.completed}건`} icon={<ChartColumn size={15} />} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-md">{currentProject?.code ?? `PRJ-${projectId}`}</Badge>
          <Badge variant="outline" className="rounded-md">{getViewLabel(currentView)}</Badge>
          <span>백엔드 `/api/projects/{projectId}/tasks` 기준</span>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">
          {(error as Error).message}
        </div>
      ) : isLoading ? (
        <div className="rounded-3xl border border-border/70 bg-background px-6 py-12 text-sm text-muted-foreground">
          프로젝트 업무를 불러오는 중입니다.
        </div>
      ) : currentView === 'kanban' ? (
        <TaskKanban rows={rows} projectId={projectId} />
      ) : currentView === 'table' ? (
        <TaskTable rows={rows} projectId={projectId} />
      ) : (
        <TaskUnsupportedView currentView={currentView} />
      )}
    </div>
  );
}

function TaskTable({
  rows,
  projectId,
}: {
  rows: Array<{ task: TaskSummary; latestReview: LatestReview }>;
  projectId: number;
}) {
  return (
    <section className="bg-background pt-4">
      <div className="hidden grid-cols-[minmax(0,2fr)_120px_120px_140px_140px_140px_120px] gap-4 border-b border-border/70 px-2 pb-3 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground lg:grid">
        <div>업무</div>
        <div>상태</div>
        <div>우선순위</div>
        <div>시작일</div>
        <div>마감일</div>
        <div>최신 검토</div>
        <div className="text-right">진입</div>
      </div>

      <div className="hidden divide-y divide-border/70 lg:block">
        {rows.map(({ task, latestReview }) => (
          <div key={task.id} className="grid grid-cols-[minmax(0,2fr)_120px_120px_140px_140px_140px_120px] gap-4 px-2 py-4">
            <div className="min-w-0">
              <div className="truncate font-semibold text-foreground">{task.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                작성자 #{task.authorId} · 생성 {formatDate(task.createdAt)}
              </div>
            </div>
            <div className="pt-1">
              <StatusPill tone={getTaskTone(task.status)}>{getTaskLabel(task.status)}</StatusPill>
            </div>
            <div className="pt-1">
              <StatusPill tone={getPriorityTone(task.priority)}>{getPriorityLabel(task.priority)}</StatusPill>
            </div>
            <div className="pt-1 text-sm text-muted-foreground">{formatCompactDate(task.startDate)}</div>
            <div className="pt-1 text-sm text-muted-foreground">{formatCompactDate(task.dueDate)}</div>
            <div className="pt-1">
              {latestReview ? (
                <StatusPill tone={getReviewTone(latestReview.status)}>
                  {latestReview.roundNo}차 · {getReviewLabel(latestReview.status)}
                </StatusPill>
              ) : (
                <StatusPill tone="slate">검토 없음</StatusPill>
              )}
            </div>
            <div className="flex items-start justify-end gap-2 pt-1">
              <Button asChild variant="outline" className="h-8 rounded-lg px-3 text-xs">
                <Link to={`/projects/${projectId}/tasks/${task.id}/reviews`}>
                  검토
                  <ChevronRight size={13} />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 lg:hidden">
        {rows.map(({ task, latestReview }) => (
          <div key={task.id} className="border-b border-border/70 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-foreground">{task.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">작성자 #{task.authorId}</div>
              </div>
              <StatusPill tone={getTaskTone(task.status)}>{getTaskLabel(task.status)}</StatusPill>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <RowMeta label="우선순위" value={getPriorityLabel(task.priority)} />
              <RowMeta label="시작일" value={formatCompactDate(task.startDate)} />
              <RowMeta label="마감일" value={formatCompactDate(task.dueDate)} />
              <RowMeta
                label="최신 검토"
                value={latestReview ? `${latestReview.roundNo}차 ${getReviewLabel(latestReview.status)}` : '검토 없음'}
              />
            </div>
            <div className="mt-3 flex justify-end">
              <Button asChild variant="outline" className="h-8 rounded-lg px-3 text-xs">
                <Link to={`/projects/${projectId}/tasks/${task.id}/reviews`}>
                  검토 보기
                  <ChevronRight size={13} />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TaskKanban({
  rows,
  projectId,
}: {
  rows: Array<{ task: TaskSummary; latestReview: LatestReview }>;
  projectId: number;
}) {
  const columns: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'];

  return (
    <section className="grid gap-4 xl:grid-cols-4">
      {columns.map((status) => {
        const items = rows.filter((row) => row.task.status === status);

        return (
          <div key={status} className="rounded-3xl border border-border/70 bg-background px-4 py-4">
            <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
              <div className="font-semibold text-foreground">{getTaskLabel(status)}</div>
              <StatusPill tone={getTaskTone(status)}>{items.length}건</StatusPill>
            </div>
            <div className="mt-4 space-y-3">
              {items.map(({ task, latestReview }) => (
                <div key={task.id} className="rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                  <div className="font-semibold text-foreground">{task.title}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusPill tone={getPriorityTone(task.priority)}>{getPriorityLabel(task.priority)}</StatusPill>
                    {latestReview ? (
                      <StatusPill tone={getReviewTone(latestReview.status)}>
                        {latestReview.roundNo}차 {getReviewLabel(latestReview.status)}
                      </StatusPill>
                    ) : null}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    시작 {formatCompactDate(task.startDate)} · 마감 {formatCompactDate(task.dueDate)}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button asChild variant="outline" className="h-8 rounded-lg px-3 text-xs">
                      <Link to={`/projects/${projectId}/tasks/${task.id}/reviews`}>
                        검토
                        <ChevronRight size={13} />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                  해당 상태의 업무가 없습니다.
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function TaskUnsupportedView({ currentView }: { currentView: TaskView }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <CalendarClock size={20} />
      </div>
      <div className="mt-4 text-lg font-semibold text-foreground">{getViewLabel(currentView)} 뷰 준비 중</div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        현재 백엔드에는 마일스톤/간트/차트용 보조 API가 없어, 우선 테이블과 칸반 뷰만 실제 계약 기준으로 연결했습니다.
      </p>
    </section>
  );
}

function InlineStat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-background text-primary">
        {icon}
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

function RowMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function getCurrentView(value: string | null): TaskView {
  return VIEW_VALUES.includes(value as TaskView) ? (value as TaskView) : 'table';
}

function getViewLabel(view: TaskView) {
  switch (view) {
    case 'kanban':
      return '칸반';
    case 'calendar':
      return '캘린더';
    case 'chart':
      return '차트';
    case 'gantt':
      return '간트';
    default:
      return '테이블';
  }
}

function getTaskLabel(status: TaskStatus) {
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

function getTaskTone(status: TaskStatus) {
  switch (status) {
    case 'PENDING':
      return 'slate' as const;
    case 'IN_PROGRESS':
      return 'blue' as const;
    case 'IN_REVIEW':
      return 'amber' as const;
    default:
      return 'green' as const;
  }
}

function getPriorityLabel(priority: TaskSummary['priority']) {
  switch (priority) {
    case 'HIGHEST':
      return '매우 높음';
    case 'HIGH':
      return '높음';
    case 'MEDIUM':
      return '보통';
    case 'LOW':
      return '낮음';
    default:
      return '매우 낮음';
  }
}

function getPriorityTone(priority: TaskSummary['priority']) {
  switch (priority) {
    case 'HIGHEST':
      return 'rose' as const;
    case 'HIGH':
      return 'amber' as const;
    case 'MEDIUM':
      return 'blue' as const;
    case 'LOW':
      return 'teal' as const;
    default:
      return 'slate' as const;
  }
}

function getReviewLabel(status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED') {
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
      return 'green' as const;
    case 'REJECTED':
      return 'rose' as const;
    case 'CANCELLED':
      return 'slate' as const;
    default:
      return 'amber' as const;
  }
}

function formatCompactDate(value: string | null) {
  return value ? formatDate(value) : '-';
}
