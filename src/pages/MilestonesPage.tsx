import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Flag, ListTodo, TimerReset } from 'lucide-react';
import { useTasks } from '../features/review/hooks';
import { useProjectMilestones, useProjectTaskMeta } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';
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
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);

  const totalTasks = taskMeta.length;
  const completedTasks = tasks.filter((task) =>
    taskMeta.some((meta) => meta.taskId === task.id) && task.latestReviewStatus === 'COMPLETED',
  ).length;

  const selectedMilestone = useMemo(
    () => milestones.find((item) => item.id === selectedMilestoneId) ?? milestones[0] ?? null,
    [milestones, selectedMilestoneId],
  );

  const linkedTasks = useMemo(() => {
    if (!selectedMilestone) {
      return [];
    }
    return taskMeta
      .filter((task) => task.milestoneId === selectedMilestone.id)
      .map((meta) => ({
        meta,
        task: tasks.find((item) => item.id === meta.taskId),
      }))
      .filter((item) => item.task);
  }, [selectedMilestone, taskMeta, tasks]);

  const total = linkedTasks.length || 1;
  const done = linkedTasks.filter((item) => item.task?.latestReviewStatus === 'COMPLETED').length;
  const review = linkedTasks.filter((item) => item.task?.latestReviewStatus === 'IN_REVIEW').length;
  const progress = Math.round((done / total) * 100);
  const activeDomains = [...new Set(linkedTasks.map(({ meta }) => meta.domain))];
  const nextDueTask = [...linkedTasks].sort((a, b) => new Date(a.meta.dueDate).getTime() - new Date(b.meta.dueDate).getTime())[0];
  const lastUpdatedAt = linkedTasks
    .map(({ meta }) => new Date(meta.dueDate).getTime())
    .sort((a, b) => b - a)[0];

  const riskText =
    selectedMilestone?.health === 'AT_RISK'
      ? '마감 전 검토 대기 업무가 남아 있어 조정이 필요합니다.'
      : selectedMilestone?.health === 'COMPLETE'
        ? '연결 업무 기준으로 완료 상태입니다.'
        : '현재 리듬은 안정적이며 연결 업무가 계획대로 진행 중입니다.';

  const milestoneStage =
    selectedMilestone?.health === 'COMPLETE'
      ? '마감 완료'
      : progress >= 70
        ? '마감 직전'
        : progress >= 35
          ? '진행 중'
          : '착수 단계';

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-6 pt-4">
        <div className="flex flex-wrap items-center gap-6">
          <InlineStat label="마일스톤" value={`${milestones.length}개`} icon={<Flag size={15} />} />
          <InlineStat label="연결 업무" value={`${totalTasks}개`} icon={<ListTodo size={15} />} />
          <InlineStat label="완료 업무" value={`${completedTasks}개`} icon={<TimerReset size={15} />} />
        </div>
        <div className="text-xs text-muted-foreground">현재 마일스톤 1개를 집중해서 보고 다음 체크포인트를 정리합니다.</div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-t border-border/70 pt-7">
          <div className="mb-4">
            <h2 className="text-base font-semibold tracking-tight text-foreground">마일스톤 목록</h2>
            <p className="mt-1 text-sm text-muted-foreground">현재 진행 상황을 확인할 마일스톤을 선택합니다.</p>
          </div>
          <div className="space-y-2">
            {milestones.map((milestone) => {
              const linkedCount = taskMeta.filter((task) => task.milestoneId === milestone.id).length;
              const active = selectedMilestone?.id === milestone.id;
              return (
                <button
                  key={milestone.id}
                  type="button"
                  onClick={() => setSelectedMilestoneId(milestone.id)}
                  className={[
                    'w-full border-b border-border/60 px-0 py-4 text-left transition',
                    active ? 'bg-primary/5' : 'hover:bg-muted/10',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground">{milestone.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{milestone.summary}</div>
                    </div>
                    <StatusPill tone={healthToneMap[milestone.health]}>{healthLabelMap[milestone.health]}</StatusPill>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{linkedCount}건</span>
                    <span>·</span>
                    <span>마감 {formatDate(milestone.dueDate)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {selectedMilestone ? (
          <div className="space-y-7 border-t border-border/70 pt-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">{selectedMilestone.name}</h2>
                  <StatusPill tone="slate">{progress}%</StatusPill>
                  <StatusPill tone={healthToneMap[selectedMilestone.health]}>{healthLabelMap[selectedMilestone.health]}</StatusPill>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{selectedMilestone.summary}</p>
              </div>
              <div className="flex items-center gap-2 self-start">
                <StatusPill tone="slate">마감 {formatDate(selectedMilestone.dueDate)}</StatusPill>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-4">
              <Panel title="현재 단계" value={milestoneStage} description={`${review}개 검토 대기 업무`} />
              <Panel
                title="다음 체크포인트"
                value={nextDueTask ? nextDueTask.task?.title ?? '연결 업무 없음' : '연결 업무 없음'}
                description={nextDueTask ? `마감 ${formatDate(nextDueTask.meta.dueDate)}` : '후속 업무를 연결하면 여기서 확인할 수 있습니다.'}
              />
              <Panel
                title="최근 변경"
                value={lastUpdatedAt ? formatDate(new Date(lastUpdatedAt).toISOString()) : '변경 없음'}
                description="마감 기준 최신 일정"
              />
              <Panel title="위험 메모" value={riskText} description="연결 업무와 검토 상태를 기준으로 산출한 요약" />
            </div>

            <div className="border-y border-border/60 py-5">
              <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                <span>연결 업무 진행률</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusPill tone="green">{done}개 완료</StatusPill>
                <StatusPill tone="amber">{review}개 검토중</StatusPill>
                <StatusPill tone="slate">{linkedTasks.length - done - review}개 진행중</StatusPill>
                {activeDomains.map((domain) => (
                  <StatusPill key={domain} tone="teal">{domain}</StatusPill>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-2">
              <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
                <h3 className="text-base font-semibold text-foreground">연결 업무</h3>
                <span className="text-sm text-muted-foreground">{linkedTasks.length}건</span>
              </div>
              <div className="divide-y divide-border/60">
                {linkedTasks.map(({ meta, task }) => (
                  <div key={meta.taskId} className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground">{task?.title}</div>
                      <div className="mt-2 text-sm leading-6 text-muted-foreground">{task?.summary}</div>
                    </div>
                    <div className="flex flex-wrap items-start justify-end gap-2">
                      <StatusPill tone="teal">{meta.domain}</StatusPill>
                      <StatusPill tone="purple">{meta.assigneeName}</StatusPill>
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
                      <StatusPill tone="slate">마감 {formatDate(meta.dueDate)}</StatusPill>
                    </div>
                  </div>
                ))}
              </div>
              </div>
              <div className="space-y-4 border-t border-border/60 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">진행 단계</div>
                  <div className="mt-3 space-y-2">
                    {['착수', '진행', '검토', '완료'].map((step, index) => {
                      const activeIndex =
                        milestoneStage === '마감 완료' ? 3 : milestoneStage === '마감 직전' ? 2 : milestoneStage === '진행 중' ? 1 : 0;
                      const active = index <= activeIndex;
                      return (
                        <div key={step} className="flex items-center justify-between gap-3 border-b border-border/50 pb-2 text-sm">
                          <span className={active ? 'font-medium text-foreground' : 'text-muted-foreground'}>{step}</span>
                          <StatusPill tone={active ? 'blue' : 'slate'}>{active ? '진행 반영' : '대기'}</StatusPill>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">연결 검토</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill tone="amber">{review}건 검토중</StatusPill>
                    <StatusPill tone="green">{done}건 완료</StatusPill>
                    <StatusPill tone="slate">{linkedTasks.length - done - review}건 진행중</StatusPill>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Panel({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="border-t border-border/60 pt-3">
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{title}</div>
      <div className="mt-3 text-base font-semibold leading-7 text-foreground">{value}</div>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{description}</div>
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
