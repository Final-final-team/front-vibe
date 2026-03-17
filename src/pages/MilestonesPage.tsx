import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '../components/ui/input';
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
import type { ProjectMilestone } from '../features/workspace/types';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';
import AppModal from '../shared/ui/AppModal';
import StatusPill from '../shared/ui/StatusPill';
import { Button } from '../components/ui/button';

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

type MilestoneDraft = {
  name: string;
  summary: string;
  dueDate: string;
  health: ProjectMilestone['health'];
};

type MilestoneViewFilter = 'ALL' | 'AT_RISK' | 'IN_REVIEW' | 'COMPLETE';

export default function MilestonesPage() {
  const { currentProject } = useWorkspace();
  const { data: remoteMilestones = [] } = useProjectMilestones(currentProject?.id ?? null);
  const { data: taskMeta = [] } = useProjectTaskMeta(currentProject?.id ?? null);
  const { data: tasks = [] } = useTasks();
  const [createdMilestones, setCreatedMilestones] = useState<ProjectMilestone[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailMilestoneId, setDetailMilestoneId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [viewFilter, setViewFilter] = useState<MilestoneViewFilter>('ALL');
  const [draft, setDraft] = useState<MilestoneDraft>({
    name: '',
    summary: '',
    dueDate: '2026-03-31T18:00:00Z',
    health: 'ON_TRACK',
  });

  const milestones = useMemo(() => [...createdMilestones, ...remoteMilestones], [createdMilestones, remoteMilestones]);
  const taskItems = useMemo(
    () =>
      buildTaskViewItems({
        tasks,
        taskMeta,
        milestones,
      }),
    [milestones, taskMeta, tasks],
  );

  const milestoneCards = useMemo(
    () =>
      milestones.map((milestone) => {
        const linkedTasks = taskItems.filter((task) => task.milestoneId === milestone.id);
        const progress = getProgress(linkedTasks);
        const reviewCount = linkedTasks.filter((task) => task.status === 'IN_REVIEW').length;
        const riskCount = linkedTasks.filter((task) => isAtRisk(task)).length;
        const nextDueTask = linkedTasks.find((task) => task.status !== 'COMPLETED') ?? linkedTasks[0] ?? null;
        const lastUpdatedTask =
          [...linkedTasks].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())[0] ?? null;

        return {
          milestone,
          linkedTasks,
          progress,
          reviewCount,
          riskCount,
          nextDueTask,
          lastUpdatedTask,
        };
      }),
    [milestones, taskItems],
  );

  const filteredMilestoneCards = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return milestoneCards.filter(({ milestone, reviewCount, riskCount }) => {
      const matchesKeyword =
        keyword.length === 0 ||
        milestone.name.toLowerCase().includes(keyword) ||
        milestone.summary.toLowerCase().includes(keyword);

      if (!matchesKeyword) return false;

      if (viewFilter === 'AT_RISK') return milestone.health === 'AT_RISK' || riskCount > 0;
      if (viewFilter === 'IN_REVIEW') return reviewCount > 0;
      if (viewFilter === 'COMPLETE') return milestone.health === 'COMPLETE';

      return true;
    });
  }, [milestoneCards, searchKeyword, viewFilter]);

  const detailMilestone = useMemo(
    () => milestones.find((item) => item.id === detailMilestoneId) ?? null,
    [milestones, detailMilestoneId],
  );
  const detailBundle = milestoneCards.find((item) => item.milestone.id === detailMilestone?.id) ?? null;
  function createMilestone() {
    const trimmedName = draft.name.trim();
    const trimmedSummary = draft.summary.trim();
    if (!trimmedName || !trimmedSummary) return;

    const nextMilestone: ProjectMilestone = {
      id: `custom-milestone-${Date.now()}`,
      name: trimmedName,
      summary: trimmedSummary,
      dueDate: draft.dueDate,
      health: draft.health,
      taskIds: [],
    };

    setCreatedMilestones((current) => [nextMilestone, ...current]);
    setCreateOpen(false);
    setDraft({
      name: '',
      summary: '',
      dueDate: '2026-03-31T18:00:00Z',
      health: 'ON_TRACK',
    });
  }

  return (
    <div className="space-y-7">
      <section className="pt-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">마일스톤 목록</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">검색/필터로 현재 대응이 필요한 마일스톤만 빠르게 추려 확인할 수 있습니다.</p>
          </div>
          <Button type="button" className="rounded-xl px-4" onClick={() => setCreateOpen(true)}>
            <Plus size={15} />
            새 마일스톤 추가
          </Button>
        </div>

        <div className="mb-4 grid gap-3 border-b border-border/70 pb-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <Input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="마일스톤명/요약으로 검색"
            className="h-10 rounded-xl"
          />
          <div className="flex flex-wrap gap-2">
            {([
              { value: 'ALL', label: '전체' },
              { value: 'AT_RISK', label: '위험' },
              { value: 'IN_REVIEW', label: '검토 대기' },
              { value: 'COMPLETE', label: '완료' },
            ] as const).map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setViewFilter(filter.value)}
                className={[
                  'rounded-xl border px-3 py-2 text-sm font-medium transition',
                  viewFilter === filter.value
                    ? 'border-primary/30 bg-primary/5 text-primary'
                    : 'border-border/70 text-muted-foreground hover:border-border',
                ].join(' ')}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredMilestoneCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
            검색/필터 조건에 맞는 마일스톤이 없습니다.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredMilestoneCards.map(({ milestone, linkedTasks, progress, reviewCount, riskCount, nextDueTask }) => (
              <button
                key={milestone.id}
                type="button"
                onClick={() => setDetailMilestoneId(milestone.id)}
                className="border-b border-border/70 px-1 py-5 text-left transition hover:bg-muted/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{milestone.name}</h3>
                      <StatusPill tone={healthToneMap[milestone.health]}>{healthLabelMap[milestone.health]}</StatusPill>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl px-4"
                    onClick={(event) => {
                      event.stopPropagation();
                      setDetailMilestoneId(milestone.id);
                    }}
                  >
                    상세 보기
                  </Button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <InlineInfo label="진행률" value={`${progress}%`} />
                  <InlineInfo label="연결 위험" value={`${riskCount}건`} />
                  <InlineInfo label="연결 업무" value={`${linkedTasks.length}건`} />
                </div>

                {nextDueTask && (
                  <div className="mt-4 rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                    다음 액션: <span className="font-medium text-foreground">{nextDueTask.title}</span>
                  </div>
                )}

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>연결 업무 진행률</span>
                    <span>{reviewCount}건 검토 대기</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/60">
                    <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <AppModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="새 마일스톤 추가"
        description="마일스톤 이름, 요약, 목표 마감일을 먼저 만들고 연결 업무는 이후 상세에서 채웁니다."
        badges={
          <>
            <StatusPill tone="blue">마일스톤 생성</StatusPill>
            <StatusPill tone="slate">연결 업무 0개</StatusPill>
          </>
        }
        size="sm"
        className="sm:max-w-[640px]"
        footer={
          <div className="flex w-full items-center justify-end gap-3">
            <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setCreateOpen(false)}>
              취소
            </Button>
            <Button type="button" className="rounded-xl px-4" onClick={createMilestone}>
              마일스톤 생성
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <FormRow label="마일스톤 이름">
            <Input
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="예: 역할 정책 정비 1차"
            />
          </FormRow>
          <FormRow label="집중 요약">
            <Input
              value={draft.summary}
              onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
              placeholder="이 마일스톤에서 가장 먼저 봐야 할 흐름을 적습니다."
            />
          </FormRow>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormRow label="목표 마감일">
              <Input
                type="date"
                value={draft.dueDate.slice(0, 10)}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    dueDate: `${event.target.value}T18:00:00Z`,
                  }))
                }
              />
            </FormRow>
            <FormRow label="상태">
              <div className="flex flex-wrap gap-2">
                {(['ON_TRACK', 'AT_RISK', 'COMPLETE'] as const).map((health) => (
                  <button
                    key={health}
                    type="button"
                    onClick={() => setDraft((current) => ({ ...current, health }))}
                    className={[
                      'rounded-xl border px-3 py-2 text-sm font-medium transition',
                      draft.health === health
                        ? 'border-primary/30 bg-primary/5 text-primary'
                        : 'border-border/70 text-muted-foreground hover:border-border',
                    ].join(' ')}
                  >
                    {healthLabelMap[health]}
                  </button>
                ))}
              </div>
            </FormRow>
          </div>
        </div>
      </AppModal>

      <AppModal
        open={Boolean(detailMilestone)}
        onOpenChange={(open) => {
          if (!open) setDetailMilestoneId(null);
        }}
        title={detailMilestone?.name ?? ''}
        description={detailMilestone?.summary}
        badges={
          detailMilestone ? (
            <>
              <StatusPill tone={healthToneMap[detailMilestone.health]}>{healthLabelMap[detailMilestone.health]}</StatusPill>
              <StatusPill tone="slate">{detailBundle?.linkedTasks.length ?? 0}개 연결 업무</StatusPill>
            </>
          ) : null
        }
        size="xl"
        className="sm:max-w-[1080px]"
        footer={
          <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setDetailMilestoneId(null)}>
            닫기
          </Button>
        }
      >
        {detailMilestone && detailBundle ? (
          <div className="space-y-6">
            <section className="grid gap-4 border-b border-border/70 pb-5 md:grid-cols-4">
              <SummaryTile label="현재 단계" value={getMilestoneStage(detailBundle.progress, detailMilestone.health)} />
              <SummaryTile label="진행률" value={`${detailBundle.progress}%`} />
              <SummaryTile label="검토 대기" value={`${detailBundle.reviewCount}건`} />
              <SummaryTile label="위험 업무" value={`${detailBundle.riskCount}건`} />
            </section>

            <section className="grid gap-4 border-b border-border/70 pb-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <MetaBlock label="집중 요약" value={buildMilestoneFocusSummary(detailMilestone, detailBundle.linkedTasks, detailBundle.reviewCount)} multiline />
                <div className="space-y-4">
                <MetaBlock
                  label="다음 액션"
                  value={
                    detailBundle.nextDueTask
                      ? `${detailBundle.nextDueTask.title}\n${getPriorityLabel(detailBundle.nextDueTask.priority)} · 마감 ${formatDate(detailBundle.nextDueTask.dueDate)}`
                      : '후속 액션이 없습니다.'
                  }
                  multiline
                />
                <MetaBlock
                  label="위험 메모"
                  value={
                    detailMilestone.health === 'AT_RISK'
                      ? `${detailBundle.riskCount || detailBundle.reviewCount}건의 선행 확인이 남아 있어 이번 주 조정이 필요합니다.`
                      : '즉시 에스컬레이션할 위험 메모는 없습니다.'
                  }
                  multiline
                />
              </div>
            </section>

            <section className="grid gap-4 border-b border-border/70 pb-5 md:grid-cols-3">
              <MetaCompact label="최근 변경" value={detailBundle.lastUpdatedTask ? formatDate(detailBundle.lastUpdatedTask.updatedAt) : '변경 없음'} />
              <MetaCompact label="다음 마감" value={detailBundle.nextDueTask ? formatDate(detailBundle.nextDueTask.dueDate) : '없음'} />
              <MetaCompact
                label="업무 영역"
                value={[...new Set(detailBundle.linkedTasks.map((task) => task.domain))].join(' · ') || '없음'}
              />
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">연결 업무</div>
                <StatusPill tone="slate">{detailBundle.linkedTasks.length}건</StatusPill>
              </div>
              {detailBundle.linkedTasks.length > 0 ? (
                <div className="space-y-3">
                  {detailBundle.linkedTasks.map((task) => (
                    <MilestoneTaskRow key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-sm text-muted-foreground">
                  아직 연결된 업무가 없습니다.
                </div>
              )}
            </section>
          </div>
        ) : null}
      </AppModal>
    </div>
  );
}

function getMilestoneStage(progress: number, health: ProjectMilestone['health']) {
  if (health === 'COMPLETE') return '마감 완료';
  if (progress >= 70) return '마감 직전';
  if (progress >= 35) return '진행 중';
  return '착수 단계';
}

function buildMilestoneFocusSummary(milestone: ProjectMilestone, linkedTasks: TaskViewItem[], reviewCount: number) {
  if (milestone.health === 'COMPLETE') {
    return '연결된 업무와 검토 흐름이 모두 정리된 상태입니다.';
  }
  if (reviewCount > 0) {
    return `${reviewCount}건의 검토 업무가 현재 흐름을 좌우합니다. 승인 큐 응답과 후속 확인을 먼저 정리해야 합니다.`;
  }
  return `${Math.max(linkedTasks.length, 0)}건의 연결 업무 기준으로 일정과 진행 상태를 함께 확인합니다.`;
}

function MilestoneTaskRow({ task }: { task: TaskViewItem }) {
  return (
    <div className="grid gap-4 rounded-[22px] border border-border/70 bg-background px-4 py-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-medium text-foreground">{task.title}</div>
          <StatusPill tone={getStatusTone(task.status)}>{getStatusLabel(task.status)}</StatusPill>
          <StatusPill tone={getPriorityTone(task.priority)}>{getPriorityLabel(task.priority)}</StatusPill>
        </div>
      </div>
      <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <InfoLine label="담당자" value={task.assigneeName} />
        <InfoLine label="업무 영역" value={task.domain} />
        <InfoLine label="기한" value={formatShortDate(task.dueDate)} />
        <InfoLine label="최근 갱신" value={formatShortDate(task.updatedAt)} />
      </div>
    </div>
  );
}

function InlineInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-border/60 pt-3">
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/70 bg-muted/10 px-4 py-4">
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-semibold leading-6 text-foreground">{value}</div>
    </div>
  );
}

function MetaBlock({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      <div
        className={[
          'mt-3 rounded-2xl border border-border/70 bg-muted/10 px-4 py-4 text-sm leading-6 text-foreground',
          multiline ? 'whitespace-pre-wrap break-keep' : '',
        ].join(' ')}
      >
        {value}
      </div>
    </div>
  );
}

function MetaCompact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border/70 bg-muted/10 px-4 py-4">
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-medium leading-6 text-foreground">{value}</div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function getProgress(tasks: TaskViewItem[]) {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((task) => task.status === 'COMPLETED').length;
  return Math.round((completed / tasks.length) * 100);
}

function isAtRisk(task: TaskViewItem) {
  if (task.status === 'COMPLETED') return false;
  const dueTime = new Date(task.dueDate).getTime();
  if (Number.isNaN(dueTime)) return false;

  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  return dueTime < Date.now() + threeDaysInMs;
}
