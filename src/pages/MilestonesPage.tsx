import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, Flag, ListTodo, TimerReset } from 'lucide-react';
import { useTasks } from '../features/review/hooks';
import {
  buildTaskViewItems,
  getPriorityLabel,
  getPriorityTone,
  getStatusLabel,
  getStatusTone,
  type TaskViewItem,
} from '../features/tasks/view-model';
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

  const taskItems = useMemo(
    () =>
      buildTaskViewItems({
        tasks,
        taskMeta,
        milestones,
      }),
    [milestones, taskMeta, tasks],
  );

  const selectedMilestone = useMemo(
    () => milestones.find((item) => item.id === selectedMilestoneId) ?? milestones[0] ?? null,
    [milestones, selectedMilestoneId],
  );

  const linkedTasks = useMemo(() => {
    if (!selectedMilestone) {
      return [];
    }

    return taskItems
      .filter((task) => task.milestoneId === selectedMilestone.id)
      .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime());
  }, [selectedMilestone, taskItems]);

  const totalTasks = taskItems.length;
  const completedTasks = taskItems.filter((task) => task.status === 'COMPLETED').length;
  const atRiskTasks = taskItems.filter((task) => isAtRisk(task)).length;
  const progress = getProgress(linkedTasks);
  const doneCount = linkedTasks.filter((task) => task.status === 'COMPLETED').length;
  const reviewCount = linkedTasks.filter((task) => task.status === 'IN_REVIEW').length;
  const riskCount = linkedTasks.filter((task) => isAtRisk(task)).length;
  const activeDomains = [...new Set(linkedTasks.map((task) => task.domain))];
  const nextDueTask = linkedTasks.find((task) => task.status !== 'COMPLETED') ?? linkedTasks[0] ?? null;
  const lastUpdatedTask = [...linkedTasks].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  )[0] ?? null;

  const milestoneStage =
    selectedMilestone?.health === 'COMPLETE'
      ? '마감 완료'
      : progress >= 70
        ? '마감 직전'
        : progress >= 35
          ? '진행 중'
          : '착수 단계';

  const riskText =
    selectedMilestone?.health === 'AT_RISK'
      ? `${riskCount || reviewCount}건의 선행 확인이 남아 있어 이번 주 조정이 필요합니다.`
      : selectedMilestone?.health === 'COMPLETE'
        ? '연결 업무 기준으로 마일스톤이 닫힌 상태입니다.'
        : '현재는 일정과 검토 흐름이 안정적으로 유지되고 있습니다.';

  const stageDescription =
    selectedMilestone?.health === 'COMPLETE'
      ? '연결된 업무와 검토 흐름이 모두 정리된 상태입니다.'
      : reviewCount > 0
        ? `${reviewCount}건의 검토 업무가 현재 흐름을 좌우합니다.`
        : `${Math.max(linkedTasks.length - doneCount, 0)}건의 후속 업무가 남아 있습니다.`;

  return (
    <div className="space-y-7">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-7 pt-4">
        <div className="flex flex-wrap items-center gap-6">
          <InlineStat label="마일스톤" value={`${milestones.length}개`} icon={<Flag size={15} />} />
          <InlineStat label="연결 업무" value={`${totalTasks}개`} icon={<ListTodo size={15} />} />
          <InlineStat label="완료 업무" value={`${completedTasks}개`} icon={<TimerReset size={15} />} />
          <InlineStat label="위험 업무" value={`${atRiskTasks}개`} icon={<AlertTriangle size={15} />} />
        </div>
        <div className="max-w-xl text-right text-xs leading-5 text-muted-foreground">
          마일스톤은 제목보다 <span className="font-semibold text-foreground">현재 단계 · 위험 · 다음 액션</span> 이 먼저 읽히도록 정리합니다.
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="border-t border-border/70 pt-7">
          <div className="mb-4">
            <h2 className="text-base font-semibold tracking-tight text-foreground">마일스톤 목록</h2>
            <p className="mt-1 text-sm text-muted-foreground">현재 프로젝트에서 우선 볼 마일스톤을 선택합니다.</p>
          </div>
          <div className="space-y-3">
            {milestones.map((milestone) => {
              const milestoneTasks = taskItems.filter((task) => task.milestoneId === milestone.id);
              const active = selectedMilestone?.id === milestone.id;
              const milestoneProgress = getProgress(milestoneTasks);
              const milestoneRiskCount = milestoneTasks.filter((task) => isAtRisk(task)).length;

              return (
                <button
                  key={milestone.id}
                  type="button"
                  onClick={() => setSelectedMilestoneId(milestone.id)}
                  className={[
                    'w-full rounded-3xl border px-5 py-5 text-left transition',
                    active
                      ? 'border-primary/20 bg-primary/[0.07] shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]'
                      : 'border-border/70 bg-background hover:border-primary/20 hover:bg-muted/[0.22]',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">마일스톤</div>
                      <div className="mt-2 font-semibold text-foreground">{milestone.name}</div>
                      <div className="mt-2 text-sm leading-6 text-muted-foreground">{milestone.summary}</div>
                    </div>
                    <StatusPill tone={healthToneMap[milestone.health]}>{healthLabelMap[milestone.health]}</StatusPill>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusPill tone="slate">{milestoneTasks.length}건 연결</StatusPill>
                    <StatusPill tone="slate">{milestoneProgress}% 진행</StatusPill>
                    <StatusPill tone={milestoneRiskCount > 0 ? 'amber' : 'green'}>위험 {milestoneRiskCount}건</StatusPill>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-muted-foreground">
                      <span>마감 {formatDate(milestone.dueDate)}</span>
                      <span>{milestoneProgress}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/80">
                      <div className="h-full rounded-full bg-primary/80" style={{ width: `${milestoneProgress}%` }} />
                    </div>
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
                  <StatusPill tone="purple">{linkedTasks.length}개 업무</StatusPill>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{selectedMilestone.summary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start">
                <StatusPill tone="slate">마감 {formatDate(selectedMilestone.dueDate)}</StatusPill>
                {lastUpdatedTask ? <StatusPill tone="teal">최근 갱신 {formatDate(lastUpdatedTask.updatedAt)}</StatusPill> : null}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
              <div className="space-y-5">
                <div className="rounded-[28px] border border-border/70 bg-muted/[0.14] p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">집중 요약</div>
                      <div className="mt-1 text-sm text-muted-foreground">지금 이 마일스톤에서 먼저 봐야 할 흐름만 앞에 둡니다.</div>
                    </div>
                    <StatusPill tone="slate">{linkedTasks.length}개 연결 업무</StatusPill>
                  </div>
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)]">
                    <FocusCard
                      title="현재 단계"
                      value={milestoneStage}
                      description={stageDescription}
                    />
                    <FocusCard
                      title="위험 메모"
                      value={riskText}
                      description={riskCount > 0 ? `마감 초과 ${riskCount}건` : '즉시 에스컬레이션할 위험 업무는 없습니다.'}
                    />
                    <FocusCard
                      title="다음 액션"
                      value={nextDueTask?.title ?? '연결 업무 없음'}
                      description={
                        nextDueTask
                          ? `${getPriorityLabel(nextDueTask.priority)} · 마감 ${formatDate(nextDueTask.dueDate)}`
                          : '후속 업무를 연결하면 다음 행동을 여기서 확인할 수 있습니다.'
                      }
                    />
                  </div>
                </div>

                <div className="rounded-[28px] border border-border/70 bg-background p-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <HighlightMetric
                      label="진행률"
                      value={`${progress}%`}
                      description={progress >= 70 ? '마감 직전 구간입니다.' : '연결 업무 완료 비율 기준'}
                    />
                    <HighlightMetric
                      label="검토 대기"
                      value={`${reviewCount}건`}
                      description={reviewCount > 0 ? '승인 큐 응답을 먼저 확인하세요.' : '대기 중인 검토는 없습니다.'}
                    />
                    <HighlightMetric
                      label="활성 영역"
                      value={activeDomains.length > 0 ? `${activeDomains.length}개` : '없음'}
                      description={activeDomains.length > 0 ? activeDomains.join(' · ') : '연결된 업무 영역이 없습니다.'}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-border/70 bg-background p-5">
                  <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">진행 개요</div>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                      <span>연결 업무 진행률</span>
                      <span className="font-medium text-foreground">{progress}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <SummaryPill tone="green" label="완료" value={`${doneCount}건`} />
                      <SummaryPill tone="amber" label="검토중" value={`${reviewCount}건`} />
                      <SummaryPill tone="rose" label="위험" value={`${riskCount}건`} />
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-border/70 bg-muted/[0.12] p-5">
                  <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">운영 메모</div>
                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <InfoRow label="최근 변경" value={lastUpdatedTask ? formatDate(lastUpdatedTask.updatedAt) : '변경 없음'} />
                    <InfoRow label="다음 마감" value={nextDueTask ? formatDate(nextDueTask.dueDate) : '없음'} />
                    <InfoRow label="프로젝트 코드" value={currentProject?.code ?? '-'} />
                  </div>
                  <div className="mt-4 border-t border-border/60 pt-4">
                    <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">범위 요약</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeDomains.length > 0 ? (
                        activeDomains.map((domain) => (
                          <StatusPill key={domain} tone="teal">
                            {domain}
                          </StatusPill>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">아직 연결된 업무 영역이 없습니다.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
                <h3 className="text-base font-semibold text-foreground">연결 업무</h3>
                <span className="text-sm text-muted-foreground">{linkedTasks.length}건</span>
              </div>

              {linkedTasks.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {linkedTasks.map((task) => (
                    <MilestoneTaskRow key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="border-b border-border/60 py-8 text-sm text-muted-foreground">
                  아직 연결된 업무가 없습니다. task 도메인 연동이 들어오면 이 영역에 우선순위와 일정이 함께 보이게 됩니다.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function MilestoneTaskRow({ task }: { task: TaskViewItem }) {
  return (
    <div className="grid gap-5 rounded-[26px] border border-border/70 bg-background px-5 py-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-semibold text-foreground">{task.title}</div>
          <StatusPill tone={getStatusTone(task.status)}>{getStatusLabel(task.status)}</StatusPill>
          <StatusPill tone={getPriorityTone(task.priority)}>{getPriorityLabel(task.priority)}</StatusPill>
        </div>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">{task.summary}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill tone="teal">{task.domain}</StatusPill>
          <StatusPill tone="purple">{task.assigneeName}</StatusPill>
        </div>
      </div>

      <div className="grid gap-2 rounded-2xl bg-muted/[0.16] p-4 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-1">
        <InfoRow label="시작" value={formatDate(task.startDate)} />
        <InfoRow label="마감" value={formatDate(task.dueDate)} />
        <InfoRow label="최근 갱신" value={formatDate(task.updatedAt)} />
        <InfoRow label="진행률" value={`${task.progress}%`} />
      </div>
    </div>
  );
}

function FocusCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-border/70 bg-background px-4 py-4">
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{title}</div>
      <div className="mt-3 text-lg font-semibold leading-8 text-foreground">{value}</div>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{description}</div>
    </div>
  );
}

function HighlightMetric({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-border/70 bg-muted/[0.14] px-4 py-4">
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
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

function SummaryPill({
  tone,
  label,
  value,
}: {
  tone: 'green' | 'amber' | 'rose';
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background px-3 py-3">
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <StatusPill tone={tone}>{value}</StatusPill>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function getProgress(items: TaskViewItem[]) {
  if (items.length === 0) {
    return 0;
  }

  const doneCount = items.filter((task) => task.status === 'COMPLETED').length;
  return Math.round((doneCount / items.length) * 100);
}

function isAtRisk(task: TaskViewItem) {
  return task.status !== 'COMPLETED' && new Date(task.dueDate).getTime() < Date.now();
}
