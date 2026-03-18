import { useMemo, useState } from 'react';
import { Plus, ArrowRight, AlertTriangle, Layers3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { appConfig } from '../shared/config/app-config';
import { formatDate } from '../shared/lib/format';
import { useProjectMilestones, useProjectTaskMeta } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import type { MilestoneHealth } from '../features/workspace/types';
import { getMockTasks } from '../features/review/mock';
import AppModal from '../shared/ui/AppModal';
import StatusPill from '../shared/ui/StatusPill';

type MilestoneDraft = {
  name: string;
  summary: string;
  dueDate: string;
};

export default function MilestonesPage() {
  const { currentProject } = useWorkspace();
  const projectId = currentProject?.id ?? null;
  const { data: milestones = [] } = useProjectMilestones(projectId);
  const { data: taskMeta = [] } = useProjectTaskMeta(projectId);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<MilestoneDraft>({
    name: '',
    summary: '',
    dueDate: '',
  });

  const taskCatalogById = useMemo(() => {
    const entries = appConfig.useMock ? getMockTasks() : [];
    return new Map(entries.map((task) => [task.id, task]));
  }, []);

  const selectedMilestone =
    milestones.find((milestone) => milestone.id === selectedMilestoneId) ?? milestones[0] ?? null;

  const cards = milestones.map((milestone) => {
    const relatedTasks = taskMeta.filter((task) => task.milestoneId === milestone.id);
    const completedCount = relatedTasks.filter((task) => {
      const summary = taskCatalogById.get(task.taskId);
      return summary?.latestReviewStatus === 'COMPLETED';
    }).length;
    const reviewCount = relatedTasks.filter((task) => {
      const summary = taskCatalogById.get(task.taskId);
      return summary?.latestReviewStatus === 'IN_REVIEW';
    }).length;
    const progress = relatedTasks.length > 0 ? Math.round((completedCount / relatedTasks.length) * 100) : 0;

    return {
      milestone,
      taskCount: relatedTasks.length,
      reviewCount,
      progress,
      riskMemo: buildRiskMemo(milestone.health, reviewCount),
      nextAction: relatedTasks[0]
        ? `${relatedTasks[0].domain} 정리`
        : '연결 업무를 추가해 첫 마일스톤 흐름을 시작하세요.',
    };
  });

  const connectedTasks = useMemo(() => {
    if (!selectedMilestone) return [];
    return taskMeta
      .filter((task) => task.milestoneId === selectedMilestone.id)
      .map((task) => ({
        ...task,
        title: taskCatalogById.get(task.taskId)?.title ?? `업무 #${task.taskId}`,
        reviewStatus: taskCatalogById.get(task.taskId)?.latestReviewStatus ?? 'IN_PROGRESS',
      }));
  }, [selectedMilestone, taskCatalogById, taskMeta]);

  const milestoneSummary = useMemo(() => {
    const atRisk = cards.filter((item) => item.milestone.health === 'AT_RISK').length;
    const onTrack = cards.filter((item) => item.milestone.health === 'ON_TRACK').length;
    const totalTasks = cards.reduce((sum, item) => sum + item.taskCount, 0);
    return { atRisk, onTrack, totalTasks };
  }, [cards]);

  return (
    <div className="space-y-7">
      <section className="pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">마일스톤</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              메인 화면에서는 마일스톤 이름, 연결 위험, 진행률만 빠르게 보고 상세는 모달에서 확인합니다.
            </p>
          </div>
          <Button type="button" className="rounded-xl px-4" onClick={() => setCreateOpen(true)}>
            <Plus size={15} />
            새 마일스톤 추가
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-6 text-sm">
          <InlineKpi label="마일스톤" value={`${milestones.length}개`} icon={<Layers3 size={15} />} />
          <InlineKpi label="위험" value={`${milestoneSummary.atRisk}개`} icon={<AlertTriangle size={15} />} />
          <InlineKpi label="정상" value={`${milestoneSummary.onTrack}개`} icon={<ArrowRight size={15} />} />
          <InlineKpi label="연결 업무" value={`${milestoneSummary.totalTasks}건`} icon={<Layers3 size={15} />} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {cards.map(({ milestone, taskCount, reviewCount, progress, riskMemo, nextAction }) => (
          <button
            key={milestone.id}
            type="button"
            onClick={() => setSelectedMilestoneId(milestone.id)}
            className="rounded-2xl border border-border/70 bg-background px-5 py-5 text-left shadow-sm transition hover:border-primary/30 hover:bg-muted/20"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{milestone.name}</h3>
                  <StatusPill tone={getHealthTone(milestone.health)}>{getHealthLabel(milestone.health)}</StatusPill>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{milestone.summary}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="h-8 rounded-lg px-3 text-sm font-medium text-primary"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedMilestoneId(milestone.id);
                }}
              >
                상세 보기
              </Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MetricTile label="연결 업무" value={`${taskCount}건`} />
              <MetricTile label="검토 대기" value={`${reviewCount}건`} />
              <MetricTile label="진행률" value={`${progress}%`} />
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/70">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>{riskMemo}</span>
              <span>마감 {formatDate(milestone.dueDate)}</span>
            </div>

            <div className="mt-3 text-sm font-medium text-foreground">{nextAction}</div>
          </button>
        ))}
      </section>

      <AppModal
        open={Boolean(selectedMilestone)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMilestoneId(null);
          }
        }}
        title={selectedMilestone?.name ?? ''}
        description={selectedMilestone?.summary}
        badges={
          selectedMilestone ? (
            <>
              <StatusPill tone={getHealthTone(selectedMilestone.health)}>{getHealthLabel(selectedMilestone.health)}</StatusPill>
              <StatusPill tone="slate">{connectedTasks.length}개 연결 업무</StatusPill>
            </>
          ) : null
        }
        size="lg"
        className="sm:max-w-[960px]"
        footer={
          <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setSelectedMilestoneId(null)}>
            닫기
          </Button>
        }
      >
        {selectedMilestone ? (
          <div className="space-y-7">
            <section className="grid gap-4 md:grid-cols-3">
              <FocusBlock label="집중 요약" value={connectedTasks[0]?.title ?? '연결 업무를 추가하세요'} />
              <FocusBlock label="다음 액션" value={connectedTasks[1]?.title ?? '우선순위가 높은 업무부터 검토 흐름에 연결합니다.'} />
              <FocusBlock label="위험 메모" value={buildRiskMemo(selectedMilestone.health, connectedTasks.length)} />
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <MetaPanel label="현재 단계" value={connectedTasks.length > 0 ? '실행 중' : '준비 중'} />
              <MetaPanel label="마감" value={formatDate(selectedMilestone.dueDate)} />
              <MetaPanel label="최근 변경" value={connectedTasks[0] ? formatDate(connectedTasks[0].dueDate) : '-'} />
            </section>

            <section className="border-t border-border/70 pt-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">연결 업무</h3>
                <StatusPill tone="slate">{connectedTasks.length}건</StatusPill>
              </div>
              <div className="space-y-3">
                {connectedTasks.length > 0 ? (
                  connectedTasks.map((task) => (
                    <div key={task.taskId} className="rounded-2xl border border-border/70 px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-foreground">{task.title}</div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {task.domain} · {task.assigneeName}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusPill tone={getTaskTone(task.reviewStatus)}>{getTaskStatusLabel(task.reviewStatus)}</StatusPill>
                          <span className="text-sm text-muted-foreground">{formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                    아직 연결된 업무가 없습니다. 새 마일스톤을 만든 뒤 업무를 연결하면 이곳에서 진행을 추적합니다.
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </AppModal>

      <AppModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="새 마일스톤 추가"
        description="마일스톤 이름과 목적, 첫 마감일을 먼저 등록하고 연결 업무는 이후에 붙입니다."
        badges={
          <>
            <StatusPill tone="purple">마일스톤 생성</StatusPill>
            <StatusPill tone="slate">연결 업무 0건</StatusPill>
          </>
        }
        size="sm"
        className="sm:max-w-[620px]"
        footer={
          <div className="flex w-full items-center justify-end gap-3">
            <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setCreateOpen(false)}>
              취소
            </Button>
            <Button type="button" className="rounded-xl px-4" onClick={() => setCreateOpen(false)}>
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
              placeholder="예: 검토 승인 리듬 안정화"
            />
          </FormRow>
          <FormRow label="목적 요약">
            <Input
              value={draft.summary}
              onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
              placeholder="이 마일스톤이 해결할 운영 문제를 한 줄로 적습니다."
            />
          </FormRow>
          <FormRow label="첫 마감일">
            <Input
              type="date"
              value={draft.dueDate}
              onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
            />
          </FormRow>
        </div>
      </AppModal>
    </div>
  );
}

function InlineKpi({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="text-foreground/70">{icon}</span>
      <span>{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 px-3 py-3">
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}

function FocusBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 px-4 py-4">
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-3 text-lg font-semibold leading-8 text-foreground">{value}</div>
    </div>
  );
}

function MetaPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border/60 pb-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-base font-medium text-foreground">{value}</div>
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function buildRiskMemo(health: MilestoneHealth, reviewCount: number) {
  if (health === 'COMPLETE') {
    return '핵심 흐름이 정리되어 마무리 단계에 있습니다.';
  }
  if (health === 'AT_RISK') {
    return reviewCount > 0 ? '검토 대기 업무가 남아 있어 이번 주 확인이 필요합니다.' : '일정상 선행 확인이 부족해 위험도가 높습니다.';
  }
  return '현재 흐름은 안정적이지만 다음 마감 전 점검이 필요합니다.';
}

function getHealthLabel(health: MilestoneHealth) {
  switch (health) {
    case 'ON_TRACK':
      return '정상';
    case 'AT_RISK':
      return '주의';
    case 'COMPLETE':
      return '완료';
    default:
      return health;
  }
}

function getHealthTone(health: MilestoneHealth) {
  switch (health) {
    case 'ON_TRACK':
      return 'green';
    case 'AT_RISK':
      return 'amber';
    case 'COMPLETE':
      return 'blue';
    default:
      return 'slate';
  }
}

function getTaskStatusLabel(status: string) {
  switch (status) {
    case 'COMPLETED':
      return '완료';
    case 'IN_REVIEW':
      return '검토중';
    case 'IN_PROGRESS':
      return '진행중';
    case 'PENDING':
      return '대기';
    default:
      return status;
  }
}

function getTaskTone(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'green';
    case 'IN_REVIEW':
      return 'amber';
    case 'IN_PROGRESS':
      return 'blue';
    default:
      return 'slate';
  }
}
