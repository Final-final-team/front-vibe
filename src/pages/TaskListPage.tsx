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
import { ArrowRight, FolderKanban, GripVertical, Rows3, SendHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTasks } from '../features/review/hooks';
import { useProjectMilestones, useProjectTaskMeta } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';
import Card from '../shared/ui/Card';
import MetricCard from '../shared/ui/MetricCard';
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
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-3">
        <MetricCard
          label="Milestone Groups"
          value={`${milestones.length}개`}
          hint="마일스톤 단위로 업무를 섹션화"
          icon={<Rows3 size={18} />}
        />
        <MetricCard
          label="In Review"
          value={`${inReviewCount}건`}
          hint="현재 검토 큐에 올라간 업무"
          icon={<SendHorizontal size={18} />}
        />
        <MetricCard
          label="Completed"
          value={`${completedCount}건`}
          hint="승인까지 끝난 업무"
          icon={<FolderKanban size={18} />}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="space-y-6">
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
                action={<StatusPill tone="slate">{progress}% complete</StatusPill>}
              >
                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="grid grid-cols-[2.2fr_1fr_0.8fr_1fr_1fr_1fr] border-b border-gray-200 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
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
                      <div className="divide-y divide-gray-100">
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

        <div className="space-y-6">
          <Card title="선택된 업무" description="업무 상세와 검토 진입점을 함께 둡니다.">
            {selectedTask ? (
              <div className="space-y-5">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{selectedTask.title}</div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{selectedTask.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone="teal">{selectedTask.domain}</StatusPill>
                  <StatusPill tone="purple">{selectedTask.assigneeName}</StatusPill>
                  <StatusPill tone="slate">{selectedTask.milestoneName}</StatusPill>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
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
                  <MetaItem label="검토 진입" value="row / 전용 inbox 탭" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/tasks/${selectedTask.taskId}/reviews`}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    review 목록
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to={`/tasks/${selectedTask.taskId}/reviews/new`}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-700"
                  >
                    새 review
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500">
                업무를 선택하면 상세 패널이 열립니다.
              </div>
            )}
          </Card>

          <Card title="보드 원칙" description="이번 구현에서 고정한 업무 화면 패턴">
            <ul className="space-y-3 text-sm leading-6 text-gray-600">
              <li>마일스톤은 독립 플로우가 아니라 업무를 묶는 섹션으로만 사용합니다.</li>
              <li>업무 row는 같은 마일스톤 안에서 드래그앤드롭으로 순서를 조정할 수 있습니다.</li>
              <li>동일 데이터의 전용 검토 탭을 분리해 inbox 스타일 확인 흐름을 제공합니다.</li>
            </ul>
          </Card>

          <Card title="추후 상호작용 준비" description="아직 확정 전이지만 구조상 고려한 요소들입니다.">
            <ul className="space-y-3 text-sm leading-6 text-gray-600">
              <li>멤버 초대, 검토 처리, 업무 상신은 추후 `Dialog` 기반 팝업으로 전환 가능합니다.</li>
              <li>드래그 결과의 서버 저장 방식은 아직 미정이며, 낙관적 업데이트/충돌/롤백 정책을 별도 합의해야 합니다.</li>
              <li>칸반/캘린더/차트/간트는 비활성 뷰 탭으로 남겨 두고 후속 구현을 전제로 디자인합니다.</li>
            </ul>
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
        'relative grid w-full grid-cols-[2.2fr_1fr_0.8fr_1fr_1fr_1fr] gap-4 py-4 text-left text-sm transition',
        selected ? 'bg-blue-50/60' : 'hover:bg-gray-50',
        isDragging ? 'z-10 rounded-2xl border border-blue-200 bg-white shadow-[0_16px_36px_rgba(37,99,235,0.18)]' : '',
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
        className="absolute inset-0 z-0 cursor-grab rounded-2xl select-none active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />
      <div className="pointer-events-none relative z-10 flex items-start gap-3 pl-1">
        <span className="mt-0.5 text-gray-300">
          <GripVertical size={16} />
        </span>
        <div>
          <div className="font-semibold text-gray-900">{task.title}</div>
          <div className="mt-1 text-gray-500">{task.summary}</div>
        </div>
      </div>
      <div className="pointer-events-none relative z-10 flex items-center text-gray-600">{task.assigneeName}</div>
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
      <div className="pointer-events-none relative z-10 flex items-center text-gray-500">{formatDate(task.dueDate)}</div>
      <div className="relative z-20 flex items-center gap-3">
        <Link
          to={`/tasks/${task.taskId}/reviews`}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          review
        </Link>
        <Link
          to={`/tasks/${task.taskId}/reviews/new`}
          className="text-sm font-semibold text-gray-600 hover:text-gray-900"
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
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">{label}</div>
      <div className="mt-2 text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}
