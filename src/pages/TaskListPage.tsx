import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
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
import { ArrowRight, ChartColumn, GripVertical, Rows3, SendHorizontal, Users2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import StatusPill from '../shared/ui/StatusPill';
import { useTasks } from '../features/review/hooks';
import { buildTaskViewItems, getStatusLabel, getStatusTone, groupTasksByStatus, type TaskViewItem } from '../features/tasks/view-model';
import { useProjectMilestones, useProjectTaskMeta } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';

const VIEW_VALUES = ['table', 'kanban', 'calendar', 'chart', 'gantt'] as const;
type TaskView = (typeof VIEW_VALUES)[number];

export default function TaskListPage() {
  const { currentProject } = useWorkspace();
  const { data: taskMeta = [] } = useProjectTaskMeta(currentProject?.id ?? null);
  const { data: milestones = [] } = useProjectMilestones(currentProject?.id ?? null);
  const { data: tasks = [] } = useTasks();
  const [searchParams] = useSearchParams();
  const currentView = getCurrentView(searchParams.get('view'));
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [taskOrderByMilestone, setTaskOrderByMilestone] = useState<Record<string, number[]>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    }),
  );

  const taskItems = useMemo(
    () =>
      buildTaskViewItems({
        tasks,
        taskMeta,
        milestones,
      }),
    [milestones, taskMeta, tasks],
  );

  const sourceOrderByMilestone = useMemo(() => {
    return milestones.reduce<Record<string, number[]>>((acc, milestone) => {
      acc[milestone.id] = taskItems.filter((task) => task.milestoneId === milestone.id).map((task) => task.id);
      return acc;
    }, {});
  }, [taskItems, milestones]);

  const selectedTask = taskItems.find((task) => task.id === selectedTaskId) ?? taskItems[0];
  const groupedByStatus = groupTasksByStatus(taskItems);
  const reviewCount = groupedByStatus.IN_REVIEW.length;
  const completedCount = groupedByStatus.COMPLETED.length;
  const activeAssignees = new Set(taskItems.map((task) => task.assigneeName)).size;

  function getMilestoneTasks(milestoneId: string) {
    const fallbackOrder = sourceOrderByMilestone[milestoneId] ?? [];
    const taskMap = new Map(
      taskItems.filter((task) => task.milestoneId === milestoneId).map((task) => [task.id, task] as const),
    );
    const currentOrder = taskOrderByMilestone[milestoneId] ?? fallbackOrder;

    return currentOrder.map((taskId) => taskMap.get(taskId)).filter((task): task is TaskViewItem => Boolean(task));
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
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-4">
        <div className="flex flex-wrap items-center gap-6">
          <InlineStat label="마일스톤" value={`${milestones.length}개`} icon={<Rows3 size={15} />} />
          <InlineStat label="검토중" value={`${reviewCount}건`} icon={<SendHorizontal size={15} />} />
          <InlineStat label="완료" value={`${completedCount}건`} icon={<ChartColumn size={15} />} />
          <InlineStat label="담당자" value={`${activeAssignees}명`} icon={<Users2 size={15} />} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-md">{currentProject?.code ?? 'TASKS'}</Badge>
          <Badge variant="outline" className="rounded-md">{getViewLabel(currentView)}</Badge>
          <span>backend mapping ready</span>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 border-t border-border/70 bg-background">
          {currentView === 'table' ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="divide-y divide-border/70">
                {milestones.map((milestone) => {
                  const milestoneTasks = getMilestoneTasks(milestone.id);
                  const total = milestoneTasks.length || 1;
                  const done = milestoneTasks.filter((task) => task.status === 'COMPLETED').length;
                  const progress = Math.round((done / total) * 100);

                  return (
                    <section key={milestone.id} className="py-5 first:pt-0">
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold tracking-tight text-foreground">{milestone.name}</h2>
                            <StatusPill tone="slate">{progress}%</StatusPill>
                            <StatusPill
                              tone={
                                milestone.health === 'COMPLETE'
                                  ? 'green'
                                  : milestone.health === 'AT_RISK'
                                    ? 'amber'
                                    : 'teal'
                              }
                            >
                              {milestone.health}
                            </StatusPill>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{milestone.summary}</p>
                        </div>
                        <div className="min-w-[220px]">
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="mt-2 text-right text-xs text-muted-foreground">
                            {milestoneTasks.length} tasks · due {formatDate(milestone.dueDate)}
                          </div>
                        </div>
                      </div>

                      <Table className="border-t border-border/70">
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>업무</TableHead>
                            <TableHead>담당자</TableHead>
                            <TableHead>우선순위</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>기한</TableHead>
                            <TableHead>진입</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <SortableContext
                            items={milestoneTasks.map((task) => task.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {milestoneTasks.map((task) => (
                              <SortableTaskRow
                                key={task.id}
                                task={task}
                                selected={selectedTask?.id === task.id}
                                onSelect={() => setSelectedTaskId(task.id)}
                              />
                            ))}
                          </SortableContext>
                        </TableBody>
                      </Table>
                    </section>
                  );
                })}
              </div>
            </DndContext>
          ) : currentView === 'kanban' ? (
            <KanbanView items={taskItems} selectedTaskId={selectedTask?.id ?? null} onSelect={setSelectedTaskId} />
          ) : currentView === 'calendar' ? (
            <CalendarView items={taskItems} onSelect={setSelectedTaskId} />
          ) : currentView === 'chart' ? (
            <ChartView items={taskItems} milestones={milestones} />
          ) : (
            <GanttView items={taskItems} selectedTaskId={selectedTask?.id ?? null} onSelect={setSelectedTaskId} />
          )}
        </section>

        <aside className="xl:sticky xl:top-[112px] xl:h-fit">
          <div className="border-l border-border/70 pl-6">
            {selectedTask ? (
              <div className="space-y-5">
                <div className="space-y-3 border-b border-border/70 pb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone="teal">{selectedTask.domain}</StatusPill>
                    <StatusPill tone="purple">{selectedTask.assigneeName}</StatusPill>
                    <StatusPill tone="slate">{selectedTask.milestoneName}</StatusPill>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      selected task
                    </div>
                    <div className="mt-2 text-[28px] font-semibold tracking-tight text-foreground">{selectedTask.title}</div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{selectedTask.summary}</p>
                  </div>
                </div>

                <div className="grid gap-4 border-b border-border/70 pb-5">
                  <MetaRow label="기한" value={formatDate(selectedTask.dueDate)} />
                  <MetaRow label="시작" value={formatDate(selectedTask.startDate)} />
                  <MetaRow label="우선순위" value={selectedTask.priority} />
                  <MetaRow label="현재 상태" value={getStatusLabel(selectedTask.status)} />
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    actions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild className="rounded-lg">
                      <Link to={`/tasks/${selectedTask.id}/reviews`}>
                        review 목록
                        <ArrowRight size={16} />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-lg">
                      <Link to={`/tasks/${selectedTask.id}/reviews/new`}>
                        새 review
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-sm text-muted-foreground">업무를 선택하면 상세가 표시됩니다.</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function KanbanView({
  items,
  selectedTaskId,
  onSelect,
}: {
  items: TaskViewItem[];
  selectedTaskId: number | null;
  onSelect: (taskId: number) => void;
}) {
  const groups = groupTasksByStatus(items);
  const columns = [
    { key: 'IN_PROGRESS', title: '진행중', tone: 'slate' as const, items: groups.IN_PROGRESS },
    { key: 'IN_REVIEW', title: '검토중', tone: 'amber' as const, items: groups.IN_REVIEW },
    { key: 'COMPLETED', title: '완료', tone: 'green' as const, items: groups.COMPLETED },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {columns.map((column) => (
        <section key={column.key} className="min-w-0">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
              <StatusPill tone={column.tone}>{column.items.length}</StatusPill>
            </div>
          </div>
          <div className="space-y-3 pt-4">
            {column.items.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onSelect(task.id)}
                className={[
                  'w-full border-b border-border/70 px-0 pb-4 text-left transition last:border-b-0 hover:border-primary/30',
                  selectedTaskId === task.id ? 'border-primary/30' : '',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-foreground">{task.title}</div>
                    <div className="mt-1 text-sm leading-6 text-muted-foreground">{task.summary}</div>
                  </div>
                  <StatusPill tone={column.tone}>{getStatusLabel(task.status)}</StatusPill>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill tone="purple">{task.assigneeName}</StatusPill>
                  <StatusPill tone="teal">{task.domain}</StatusPill>
                  <span className="text-xs text-muted-foreground">{formatDate(task.dueDate)}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function CalendarView({
  items,
  onSelect,
}: {
  items: TaskViewItem[];
  onSelect: (taskId: number) => void;
}) {
  const targetMonth = new Date(items[0]?.dueDate ?? '2026-03-01T09:00:00Z');
  targetMonth.setDate(1);
  const startDay = targetMonth.getDay();
  const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => index - startDay + 1);

  const tasksByDay = items.reduce<Record<number, TaskViewItem[]>>((acc, item) => {
    const date = new Date(item.dueDate).getDate();
    acc[date] = [...(acc[date] ?? []), item];
    return acc;
  }, {});

  return (
    <div className="border-t border-border/70 pt-4">
            <div className="grid grid-cols-7 gap-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="px-2 pb-2 text-xs font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
        {cells.map((day, index) => {
          const dayTasks = day > 0 && day <= daysInMonth ? tasksByDay[day] ?? [] : [];
          return (
            <div
              key={`${day}-${index}`}
                  className={[
                'min-h-[128px] border-t border-border/70 bg-background p-2',
                day <= 0 || day > daysInMonth ? 'bg-muted/25' : '',
              ].join(' ')}
            >
              {day > 0 && day <= daysInMonth ? (
                <>
                  <div className="text-sm font-semibold text-foreground">{day}</div>
                  <div className="mt-2 space-y-2">
                    {dayTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onSelect(task.id)}
                        className="block w-full border-l-2 border-primary px-2 py-1 text-left text-xs transition hover:bg-muted/30"
                      >
                        <div className="font-semibold text-foreground">{task.title}</div>
                        <div className="mt-1 text-muted-foreground">{task.assigneeName}</div>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartView({
  items,
  milestones,
}: {
  items: TaskViewItem[];
  milestones: Array<{ id: string; name: string }>;
}) {
  const total = items.length || 1;
  const groups = groupTasksByStatus(items);

  return (
    <div className="grid gap-8 xl:grid-cols-2">
      <section className="border-t border-border/70 pt-4">
        <div className="pb-4">
          <h2 className="text-lg font-semibold text-foreground">상태 분포</h2>
          <p className="mt-1 text-sm text-muted-foreground">현재 업무 분포를 상태별로 확인합니다.</p>
        </div>
        <div className="space-y-5">
          {[
            { label: '진행중', value: groups.IN_PROGRESS.length, tone: 'slate' as const },
            { label: '검토중', value: groups.IN_REVIEW.length, tone: 'amber' as const },
            { label: '완료', value: groups.COMPLETED.length, tone: 'green' as const },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{row.label}</span>
                <span className="text-muted-foreground">{row.value}건</span>
              </div>
              <div className="h-3 overflow-hidden bg-muted">
                <div
                  className={[
                    'h-full rounded-full',
                    row.tone === 'green' ? 'bg-emerald-500' : row.tone === 'amber' ? 'bg-amber-500' : 'bg-slate-500',
                  ].join(' ')}
                  style={{ width: `${(row.value / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/70 pt-4">
        <div className="pb-4">
          <h2 className="text-lg font-semibold text-foreground">마일스톤 부담</h2>
          <p className="mt-1 text-sm text-muted-foreground">마일스톤별 연결 업무와 완료 비율</p>
        </div>
        <div className="space-y-5">
          {milestones.map((milestone) => {
            const milestoneTasks = items.filter((item) => item.milestoneId === milestone.id);
            const done = milestoneTasks.filter((item) => item.status === 'COMPLETED').length;
            const progress = milestoneTasks.length ? Math.round((done / milestoneTasks.length) * 100) : 0;

            return (
              <div key={milestone.id}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{milestone.name}</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
              <div className="h-3 overflow-hidden bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
                <div className="mt-2 text-xs text-muted-foreground">{milestoneTasks.length} tasks</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function GanttView({
  items,
  selectedTaskId,
  onSelect,
}: {
  items: TaskViewItem[];
  selectedTaskId: number | null;
  onSelect: (taskId: number) => void;
}) {
  const start = new Date(Math.min(...items.map((item) => new Date(item.startDate).getTime())));
  const end = new Date(Math.max(...items.map((item) => new Date(item.dueDate).getTime())));
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
  const days = Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });

  return (
    <div className="border-t border-border/70 pt-4">
      <div className="overflow-x-auto">
        <div className="min-w-[960px]">
          <div
            className="grid gap-2 border-b border-border/70 pb-3"
            style={{ gridTemplateColumns: `220px repeat(${days.length}, minmax(36px, 1fr))` }}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">업무</div>
            {days.map((day) => (
              <div key={day.toISOString()} className="text-center text-[11px] font-semibold text-muted-foreground">
                {day.getDate()}
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4">
            {items.map((task) => {
              const offset = Math.round((new Date(task.startDate).getTime() - start.getTime()) / 86_400_000);
              const span = Math.max(1, Math.round((new Date(task.dueDate).getTime() - new Date(task.startDate).getTime()) / 86_400_000) + 1);

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onSelect(task.id)}
                  className={[
                    'grid w-full items-center gap-2 px-3 py-3 text-left transition hover:bg-muted/35',
                    selectedTaskId === task.id ? 'bg-primary/5' : '',
                  ].join(' ')}
                  style={{ gridTemplateColumns: `220px repeat(${days.length}, minmax(36px, 1fr))` }}
                >
                  <div>
                    <div className="font-semibold text-foreground">{task.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{task.assigneeName}</div>
                  </div>
                  {days.map((_, index) => {
                    const active = index >= offset && index < offset + span;
                    return (
                      <div key={`${task.id}-${index}`} className="h-8 bg-muted/35">
                        {active ? <div className="h-full bg-primary/85" /> : null}
                      </div>
                    );
                  })}
                </button>
              );
            })}
          </div>
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
  task: TaskViewItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      milestoneId: task.milestoneId,
    },
  });

  return (
    <tr
      ref={setNodeRef}
      data-slot="table-row"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={[
        'border-b transition-colors hover:bg-muted/30',
        selected ? 'bg-primary/7' : '',
        isDragging ? 'border-primary/20 bg-background shadow-[0_12px_28px_rgba(15,23,42,0.08)]' : '',
      ].join(' ')}
    >
      <TableCell className="relative py-4">
        <button
          {...attributes}
          {...listeners}
          onClick={onSelect}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSelect();
            }
          }}
          className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
        />
        <div className="relative z-10 flex items-start gap-3">
          <span className="mt-0.5 text-muted-foreground/60">
            <GripVertical size={16} />
          </span>
          <div className="min-w-0">
            <div className="font-semibold text-foreground">{task.title}</div>
            <div className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{task.summary}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>{task.assigneeName}</TableCell>
      <TableCell>
        <StatusPill tone={task.priority === 'HIGH' ? 'rose' : task.priority === 'MEDIUM' ? 'amber' : 'teal'}>
          {task.priority}
        </StatusPill>
      </TableCell>
      <TableCell>
        <StatusPill tone={getStatusTone(task.status)}>{getStatusLabel(task.status)}</StatusPill>
      </TableCell>
      <TableCell>{formatDate(task.dueDate)}</TableCell>
      <TableCell>
        <div className="relative z-10 flex items-center gap-3">
          <Link
            to={`/tasks/${task.id}/reviews`}
            className="text-sm font-semibold text-primary hover:text-primary/80"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            review
          </Link>
          <Link
            to={`/tasks/${task.id}/reviews/new`}
            className="text-sm font-semibold text-foreground/70 hover:text-foreground"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            상신
          </Link>
        </div>
      </TableCell>
    </tr>
  );
}

function InlineStat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
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

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3 text-sm last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function getCurrentView(value: string | null): TaskView {
  if (value && VIEW_VALUES.includes(value as TaskView)) {
    return value as TaskView;
  }
  return 'table';
}

function getViewLabel(view: TaskView) {
  switch (view) {
    case 'kanban':
      return 'kanban';
    case 'calendar':
      return 'calendar';
    case 'chart':
      return 'chart';
    case 'gantt':
      return 'gantt';
    default:
      return 'table';
  }
}
