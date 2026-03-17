import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowRight,
  FolderKanban,
  GripVertical,
  Rows3,
  SendHorizontal,
  Users2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTasks } from '../features/review/hooks';
import { useProjectMilestones, useProjectTaskMeta } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import Card from '../shared/ui/Card';
import StatusPill from '../shared/ui/StatusPill';

type BoardTask = {
  taskId: number;
  title: string;
  summary: string;
  latestReviewStatus: 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
  assigneeName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;
  domain: string;
  milestoneId: string;
  milestoneName: string;
};

export default function TaskListPage() {
  const { currentProject } = useWorkspace();
  const { data: taskMeta = [] } = useProjectTaskMeta(currentProject?.id ?? null);
  const { data: milestones = [] } = useProjectMilestones(currentProject?.id ?? null);
  const { data: tasks = [] } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [taskOrderByMilestone, setTaskOrderByMilestone] = useState<Record<string, number[]>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    }),
  );

  const boardTasks: BoardTask[] = taskMeta
    .map((meta) => {
      const task = tasks.find((item) => item.id === meta.taskId);
      const milestone = milestones.find((item) => item.id === meta.milestoneId);

      if (!task || !milestone) {
        return null;
      }

      return {
        taskId: meta.taskId,
        title: task.title,
        summary: task.summary,
        latestReviewStatus: task.latestReviewStatus,
        assigneeName: meta.assigneeName,
        priority: meta.priority,
        dueDate: meta.dueDate,
        domain: meta.domain,
        milestoneId: meta.milestoneId,
        milestoneName: milestone.name,
      };
    })
    .filter((item): item is BoardTask => item !== null);

  const sourceOrderByMilestone = useMemo(() => {
    return milestones.reduce<Record<string, number[]>>((acc, milestone) => {
      acc[milestone.id] = boardTasks
        .filter((task) => task.milestoneId === milestone.id)
        .map((task) => task.taskId);
      return acc;
    }, {});
  }, [boardTasks, milestones]);

  const selectedTask = boardTasks.find((task) => task.taskId === selectedTaskId) ?? boardTasks[0];
  const inReviewCount = boardTasks.filter((task) => task.latestReviewStatus === 'IN_REVIEW').length;
  const completedCount = boardTasks.filter((task) => task.latestReviewStatus === 'COMPLETED').length;
  const activeAssignees = new Set(boardTasks.map((task) => task.assigneeName)).size;

  function getMilestoneTasks(milestoneId: string) {
    const fallbackOrder = sourceOrderByMilestone[milestoneId] ?? [];
    const taskMap = new Map(
      boardTasks
        .filter((task) => task.milestoneId === milestoneId)
        .map((task) => [task.taskId, task] as const),
    );
    const currentOrder = taskOrderByMilestone[milestoneId] ?? fallbackOrder;

    return currentOrder
      .map((taskId) => taskMap.get(taskId))
      .filter((task): task is BoardTask => Boolean(task));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeMilestoneId = active.data.current?.milestoneId;
    const overMilestoneId = over.data.current?.milestoneId;

    if (!activeMilestoneId || activeMilestoneId !== overMilestoneId) {
      return;
    }

    const milestoneId = String(activeMilestoneId);
    const currentOrder = [...(taskOrderByMilestone[milestoneId] ?? sourceOrderByMilestone[milestoneId] ?? [])];
    const oldIndex = currentOrder.indexOf(Number(active.id));
    const newIndex = currentOrder.indexOf(Number(over.id));

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    setTaskOrderByMilestone((prev) => ({
      ...prev,
      [milestoneId]: arrayMove(currentOrder, oldIndex, newIndex),
    }));
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 xl:grid-cols-4">
        <MiniMetric
          label="마일스톤"
          value={`${milestones.length}개`}
          hint="실행 그룹"
          icon={<Rows3 size={16} />}
        />
        <MiniMetric
          label="검토중"
          value={`${inReviewCount}건`}
          hint="현재 review 큐"
          icon={<SendHorizontal size={16} />}
        />
        <MiniMetric
          label="완료"
          value={`${completedCount}건`}
          hint="승인 종료"
          icon={<FolderKanban size={16} />}
        />
        <MiniMetric
          label="담당자"
          value={`${activeAssignees}명`}
          hint="활성 assignee"
          icon={<Users2 size={16} />}
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_340px]">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="space-y-4">
            {milestones.map((milestone) => {
              const milestoneTasks = getMilestoneTasks(milestone.id);
              const total = milestoneTasks.length || 1;
              const done = milestoneTasks.filter((task) => task.latestReviewStatus === 'COMPLETED').length;
              const progress = Math.round((done / total) * 100);

              return (
                <Card
                  key={milestone.id}
                  title={milestone.name}
                  description={milestone.summary}
                  action={
                    <div className="flex items-center gap-2">
                      <StatusPill tone="slate">{progress}%</StatusPill>
                      <Badge variant="outline" className="rounded-lg px-2.5 py-1">
                        {milestoneTasks.length} tasks
                      </Badge>
                    </div>
                  }
                  className="bg-card/96"
                >
                  <div className="overflow-x-auto">
                    <div className="min-w-[900px]">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="text-xs font-medium text-muted-foreground">{done}/{total}</div>
                      </div>
                      <div className="grid grid-cols-[2.2fr_1fr_0.8fr_1fr_1fr_1fr] border-b border-border/70 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        <div>업무</div>
                        <div>담당자</div>
                        <div>우선순위</div>
                        <div>상태</div>
                        <div>기한</div>
                        <div>진입</div>
                      </div>
                      <SortableContext
                        items={milestoneTasks.map((task) => task.taskId)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="divide-y divide-border/60">
                          {milestoneTasks.map((task) => (
                            <SortableTaskRow
                              key={task.taskId}
                              task={task}
                              selected={selectedTask?.taskId === task.taskId}
                              onSelect={() => setSelectedTaskId(task.taskId)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </DndContext>

        <div className="space-y-4 xl:sticky xl:top-[136px] xl:self-start">
          <Card
            title="선택된 업무"
            description="row 선택 즉시 업무 상태와 review 액션을 확인합니다."
            action={<Badge className="rounded-lg px-2.5 py-1">{selectedTask ? `taskId ${selectedTask.taskId}` : 'idle'}</Badge>}
          >
            {selectedTask ? (
              <div className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone="teal">{selectedTask.domain}</StatusPill>
                    <StatusPill tone="purple">{selectedTask.assigneeName}</StatusPill>
                    <StatusPill tone="slate">{selectedTask.milestoneName}</StatusPill>
                  </div>
                  <div className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{selectedTask.title}</div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{selectedTask.summary}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetaItem label="기한" value={formatDate(selectedTask.dueDate)} />
                  <MetaItem label="우선순위" value={selectedTask.priority} />
                  <MetaItem
                    label="현재 상태"
                    value={
                      selectedTask.latestReviewStatus === 'COMPLETED'
                        ? '완료'
                        : selectedTask.latestReviewStatus === 'IN_REVIEW'
                          ? '검토중'
                          : '진행중'
                    }
                  />
                  <MetaItem label="검토 진입" value="row / inbox / detail" />
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    다음 액션
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild className="rounded-lg">
                      <Link to={`/tasks/${selectedTask.taskId}/reviews`}>
                        review 목록
                        <ArrowRight size={16} />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-lg">
                      <Link to={`/tasks/${selectedTask.taskId}/reviews/new`}>
                        새 review
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <StatusPill tone="slate">{selectedTask.milestoneName}</StatusPill>
                  <StatusPill tone="purple">{selectedTask.assigneeName}</StatusPill>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
                업무를 선택하면 상세 패널이 열립니다.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function SortableTaskRow({
  task,
  selected,
  onSelect,
}: {
  task: BoardTask;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.taskId,
    data: {
      milestoneId: task.milestoneId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={[
        'relative grid w-full grid-cols-[2.2fr_1fr_0.8fr_1fr_1fr_1fr] gap-4 rounded-xl px-3 py-4 text-left text-sm transition',
        selected ? 'bg-primary/7 ring-1 ring-primary/15' : 'hover:bg-muted/40',
        isDragging ? 'z-10 border border-primary/20 bg-card shadow-[0_16px_36px_rgba(37,99,235,0.18)]' : '',
      ].join(' ')}
    >
      <div
        {...attributes}
        {...listeners}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
          }
        }}
        className="absolute inset-0 z-0 cursor-grab rounded-xl select-none active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />
      <div className="pointer-events-none relative z-10 flex items-start gap-3 pl-1">
        <span className="mt-0.5 text-muted-foreground/60">
          <GripVertical size={16} />
        </span>
        <div>
          <div className="font-semibold text-foreground">{task.title}</div>
          <div className="mt-1 line-clamp-2 text-muted-foreground">{task.summary}</div>
        </div>
      </div>
      <div className="pointer-events-none relative z-10 flex items-center text-foreground/80">{task.assigneeName}</div>
      <div className="pointer-events-none relative z-10 flex items-center">
        <StatusPill
          tone={
            task.priority === 'HIGH'
              ? 'rose'
              : task.priority === 'MEDIUM'
                ? 'amber'
                : 'teal'
          }
        >
          {task.priority}
        </StatusPill>
      </div>
      <div className="pointer-events-none relative z-10 flex items-center">
        <StatusPill
          tone={
            task.latestReviewStatus === 'COMPLETED'
              ? 'green'
              : task.latestReviewStatus === 'IN_REVIEW'
                ? 'amber'
                : 'slate'
          }
        >
          {task.latestReviewStatus === 'COMPLETED'
            ? '완료'
            : task.latestReviewStatus === 'IN_REVIEW'
              ? '검토중'
              : '진행중'}
        </StatusPill>
      </div>
      <div className="pointer-events-none relative z-10 flex items-center text-muted-foreground">{formatDate(task.dueDate)}</div>
      <div className="relative z-20 flex items-center gap-3">
        <Link
          to={`/tasks/${task.taskId}/reviews`}
          className="text-sm font-semibold text-primary hover:text-primary/80"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          review
        </Link>
        <Link
          to={`/tasks/${task.taskId}/reviews/new`}
          className="text-sm font-semibold text-foreground/70 hover:text-foreground"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          상신
        </Link>
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/25 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-semibold text-foreground">{value}</div>
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
