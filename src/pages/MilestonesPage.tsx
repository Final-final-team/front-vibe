import { Flag, ListTodo, TimerReset } from 'lucide-react';
import { useTasks } from '../features/review/hooks';
import { useProjectMilestones, useProjectTaskMeta } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';
import MetricCard from '../shared/ui/MetricCard';
import StatusPill from '../shared/ui/StatusPill';

const healthToneMap = {
  ON_TRACK: 'green',
  AT_RISK: 'amber',
  COMPLETE: 'blue',
} as const;

const healthLabelMap = {
  ON_TRACK: '정상',
  AT_RISK: '주의',
  COMPLETE: '완료',
} as const;

export default function MilestonesPage() {
  const { currentProject } = useWorkspace();
  const { data: milestones = [] } = useProjectMilestones(currentProject?.id ?? null);
  const { data: taskMeta = [] } = useProjectTaskMeta(currentProject?.id ?? null);
  const { data: tasks = [] } = useTasks();

  const totalTasks = taskMeta.length;
  const completedTasks = tasks.filter((task) =>
    taskMeta.some((meta) => meta.taskId === task.id) && task.latestReviewStatus === 'COMPLETED',
  ).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-3">
        <MetricCard
          label="마일스톤"
          value={`${milestones.length}개`}
          hint="독립 워크플로우가 아닌 큰 목표 묶음"
          icon={<Flag size={18} />}
        />
        <MetricCard
          label="연결 업무"
          value={`${totalTasks}개`}
          hint="마일스톤에 연결된 전체 업무"
          icon={<ListTodo size={18} />}
        />
        <MetricCard
          label="완료 업무"
          value={`${completedTasks}개`}
          hint="연결 업무 완료 기준으로 집계"
          icon={<TimerReset size={18} />}
        />
      </section>

      <div className="space-y-8">
        {milestones.map((milestone) => {
          const linkedTasks = taskMeta
            .filter((task) => task.milestoneId === milestone.id)
            .map((meta) => ({
              meta,
              task: tasks.find((item) => item.id === meta.taskId),
            }))
            .filter((item) => item.task);

          const total = linkedTasks.length || 1;
          const done = linkedTasks.filter((item) => item.task?.latestReviewStatus === 'COMPLETED').length;
          const review = linkedTasks.filter((item) => item.task?.latestReviewStatus === 'IN_REVIEW').length;
          const progress = Math.round((done / total) * 100);
          const activeDomains = [...new Set(linkedTasks.map(({ meta }) => meta.domain))];
          const nextDueTask = [...linkedTasks].sort((a, b) => new Date(a.meta.dueDate).getTime() - new Date(b.meta.dueDate).getTime())[0];
          const riskText =
            milestone.health === 'AT_RISK'
              ? '마감 전 검토 대기 업무가 남아 있어 조정이 필요합니다.'
              : milestone.health === 'COMPLETE'
                ? '연결 업무 기준으로 완료 상태입니다.'
                : '현재 리듬은 안정적이며 연결 업무가 계획대로 진행 중입니다.';

          return (
            <section key={milestone.id} className="border-t border-border/70 pt-4">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold tracking-tight text-foreground">{milestone.name}</h2>
                    <StatusPill tone="slate" className="h-8 px-3">{progress}%</StatusPill>
                    <StatusPill tone={healthToneMap[milestone.health]} className="h-8 px-3">
                      {healthLabelMap[milestone.health]}
                    </StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{milestone.summary}</p>
                </div>
                <div className="flex items-center gap-2 self-start">
                  <StatusPill tone="slate" className="h-8 px-3">마감 {formatDate(milestone.dueDate)}</StatusPill>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
                    <span>연결 업무 진행률</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                    <StatusPill tone="green">{done}개 완료</StatusPill>
                    <StatusPill tone="amber">{review}개 검토중</StatusPill>
                    <StatusPill tone="slate">{linkedTasks.length - done - review}개 진행중</StatusPill>
                  </div>
                </div>

                <div className="grid gap-4 border-y border-border/60 py-4 lg:grid-cols-3">
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">다음 체크포인트</div>
                    <div className="mt-2 text-sm font-medium text-foreground">
                      {nextDueTask ? nextDueTask.task?.title : '연결 업무 없음'}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {nextDueTask ? `마감 ${formatDate(nextDueTask.meta.dueDate)}` : '후속 업무를 연결하면 여기서 확인할 수 있습니다.'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">연결 도메인</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeDomains.map((domain) => (
                        <StatusPill key={domain} tone="teal">{domain}</StatusPill>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">위험 메모</div>
                    <div className="mt-2 text-sm leading-6 text-muted-foreground">{riskText}</div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  {linkedTasks.map(({ meta, task }) => (
                    <div
                      key={meta.taskId}
                      className="border-b border-border/60 px-0 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-gray-900">{task?.title}</div>
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
                      <div className="mt-2 text-sm leading-6 text-gray-600">{task?.summary}</div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                        <StatusPill tone="teal">{meta.domain}</StatusPill>
                        <StatusPill tone="purple">{meta.assigneeName}</StatusPill>
                        <StatusPill tone="slate">마감 {formatDate(meta.dueDate)}</StatusPill>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
