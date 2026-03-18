import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowRight,
  AlertTriangle,
  ChartColumn,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CirclePlay,
  Pencil,
  GripVertical,
  Rows3,
  SendHorizontal,
  SquareDashedMousePointer,
  Users2,
} from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { appConfig } from '../shared/config/app-config';
import { formatDate } from '../shared/lib/format';
import { BackendApiError, toBackendApiError } from '../shared/lib/http';
import { fetchTaskReviews } from '../features/review/api';
import ReviewDetailModal from '../features/review/components/ReviewDetailModal';
import ReviewComposerModal from '../features/review/components/ReviewComposerModal';
import { reviewKeys, useTaskReviews, useTasks } from '../features/review/hooks';
import {
  useAssignTask,
  useAssignTaskToMe,
  useCancelTaskStart,
  useCreateTask,
  useForceCompleteTask,
  useStartTask,
  useTaskDetail,
  useUnassignTask,
  useUnassignTaskFromMe,
  useUpdateTaskDescription,
  useUpdateTaskDueDate,
  useUpdateTaskPriority,
  useUpdateTaskStartDate,
  useUpdateTaskTitle,
} from '../features/tasks/hooks';
import {
  buildTaskViewItems,
  getPriorityLabel,
  getPriorityTone,
  getStatusLabel,
  getStatusTone,
  groupTasksByStatus,
  type TaskViewItem,
} from '../features/tasks/view-model';
import { useProjectMembers, useProjectMilestones, useProjectRoles, useProjectTaskMeta } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import type { PriorityLevel, ProjectMilestone } from '../features/workspace/types';
import AppModal from '../shared/ui/AppModal';
import StatusPill from '../shared/ui/StatusPill';

const VIEW_VALUES = ['table', 'kanban', 'calendar', 'chart', 'gantt'] as const;
type TaskView = (typeof VIEW_VALUES)[number];
type TaskAssignmentMode = 'unassigned' | 'me' | 'member';
type EditableTaskField = 'title' | 'description' | 'startDate' | 'dueDate' | 'priority' | null;

export default function TaskListPage() {
  const { projectId: projectIdParam } = useParams();
  const projectId = Number(projectIdParam);
  const { currentProject, currentUserId } = useWorkspace();
  const { data: taskMeta = [] } = useProjectTaskMeta(projectIdParam ?? currentProject?.id ?? null);
  const { data: milestones = [] } = useProjectMilestones(projectIdParam ?? currentProject?.id ?? null);
  const { data: projectMembers = [] } = useProjectMembers(projectIdParam ?? currentProject?.id ?? null);
  const { data: projectRoles = [] } = useProjectRoles(projectIdParam ?? currentProject?.id ?? null);
  const { data: tasks = [] } = useTasks(projectId);
  const [searchParams] = useSearchParams();
  const currentView = getCurrentView(searchParams.get('view'));
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [reviewComposerOpen, setReviewComposerOpen] = useState(false);
  const [reviewComposerTask, setReviewComposerTask] = useState<{ id: number; title: string } | null>(null);
  const [forceCompleteConfirmOpen, setForceCompleteConfirmOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskOrderByMilestone, setTaskOrderByMilestone] = useState<Record<string, number[]>>({});
  const [taskScope, setTaskScope] = useState<'milestone' | 'timeline' | 'mine'>('milestone');
  const [editingField, setEditingField] = useState<EditableTaskField>(null);
  const [detailErrorMessage, setDetailErrorMessage] = useState<string | null>(null);
  const [taskDraft, setTaskDraft] = useState({
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    priority: 'MEDIUM' as PriorityLevel,
    assigneeUserId: null as number | null,
  });
  const [createTaskForm, setCreateTaskForm] = useState({
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    priority: 'HIGH' as const,
    assignmentMode: 'me' as TaskAssignmentMode,
    assigneeUserId: null as number | null,
  });
  const [createTaskErrorMessage, setCreateTaskErrorMessage] = useState<string | null>(null);
  const [calendarCursor, setCalendarCursor] = useState(() => {
    const baseDate = taskMeta[0]?.dueDate ?? new Date().toISOString();
    const base = new Date(baseDate);
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const suppressClickUntilRef = useRef(0);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  );

  const createTaskMutation = useCreateTask(projectId);
  const assignTaskMutation = useAssignTask(projectId);
  const assignTaskToMeMutation = useAssignTaskToMe(projectId);
  const unassignTaskMutation = useUnassignTask(projectId);
  const unassignTaskFromMeMutation = useUnassignTaskFromMe(projectId);
  const startTaskMutation = useStartTask(projectId);
  const cancelTaskStartMutation = useCancelTaskStart(projectId);
  const forceCompleteTaskMutation = useForceCompleteTask(projectId);
  const updateTaskTitleMutation = useUpdateTaskTitle(projectId);
  const updateTaskDescriptionMutation = useUpdateTaskDescription(projectId);
  const updateTaskStartDateMutation = useUpdateTaskStartDate(projectId);
  const updateTaskDueDateMutation = useUpdateTaskDueDate(projectId);
  const updateTaskPriorityMutation = useUpdateTaskPriority(projectId);
  const activeMembers = useMemo(
    () => projectMembers.filter((member) => member.inviteStatus === 'ACTIVE'),
    [projectMembers],
  );
  const actorMember = useMemo(
    () => (currentUserId != null ? activeMembers.find((member) => member.userId === currentUserId) ?? null : null),
    [activeMembers, currentUserId],
  );
  const canAssignOthers = useMemo(() => {
    if (!appConfig.useMock) {
      return true;
    }

    if (!actorMember) {
      return false;
    }

    return actorMember.roleIds.some((roleId) => {
      const role = projectRoles.find((item) => item.id === roleId);
      return role?.permissionKeys.includes('TASK_ASSIGN') ?? false;
    });
  }, [actorMember, projectRoles]);
  const memberAssignableOptions = useMemo(() => {
    if (!canAssignOthers) {
      return [];
    }

    return activeMembers.filter((member) => member.userId !== actorMember?.userId);
  }, [activeMembers, actorMember?.userId, canAssignOthers]);

  const fallbackTaskMeta = useMemo(() => {
    const existingTaskIds = new Set(taskMeta.map((meta) => meta.taskId));
    return tasks
      .filter((task) => !existingTaskIds.has(task.id))
      .map((task) => ({
        taskId: task.id,
        projectId: String(projectId),
        milestoneId: 'milestone-unplanned',
        assigneeId: task.authorId,
        assigneeName:
          activeMembers.find((member) => member.userId === task.authorId)?.name ?? `작성자 #${task.authorId}`,
        domain: '일반 업무',
        priority: task.priority,
        dueDate: task.dueDate,
      }));
  }, [activeMembers, projectId, taskMeta, tasks]);

  const displayTaskMeta = useMemo(() => [...taskMeta, ...fallbackTaskMeta], [fallbackTaskMeta, taskMeta]);

  const displayMilestones = useMemo(() => {
    if (fallbackTaskMeta.length === 0) {
      return milestones;
    }

    return [
      ...milestones,
      {
        id: 'milestone-unplanned',
        name: '새로 추가된 업무',
        summary: '마일스톤 배정 전이거나 메타데이터가 아직 없는 업무입니다.',
        dueDate: fallbackTaskMeta[0]?.dueDate ?? new Date().toISOString(),
        health: 'ON_TRACK' as const,
        taskIds: fallbackTaskMeta.map((meta) => meta.taskId),
      },
    ];
  }, [fallbackTaskMeta, milestones]);

  const taskItems = useMemo(
    () => buildTaskViewItems({ tasks, taskMeta: displayTaskMeta, milestones: displayMilestones, members: activeMembers }),
    [activeMembers, displayMilestones, displayTaskMeta, tasks],
  );

  const scopedTaskItems = useMemo(() => {
    if (taskScope === 'mine') {
      return taskItems
        .filter((task) => currentUserId != null && task.assigneeId === currentUserId)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }

    return [...taskItems].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [currentUserId, taskItems, taskScope]);

  const sourceOrderByMilestone = useMemo(
    () =>
      displayMilestones.reduce<Record<string, number[]>>((acc: Record<string, number[]>, milestone: ProjectMilestone) => {
        acc[milestone.id] = scopedTaskItems.filter((task) => task.milestoneId === milestone.id).map((task) => task.id);
        return acc;
      }, {}),
    [displayMilestones, scopedTaskItems],
  );

  const reviewQueries = useQueries({
    queries: taskItems.map((task) => ({
      queryKey: reviewKeys.taskReviews(task.id),
      queryFn: () => fetchTaskReviews(task.id),
    })),
  });

  const latestReviewByTaskId = useMemo(
    () =>
      taskItems.reduce<Record<number, number | null>>((acc, task, index) => {
        acc[task.id] = reviewQueries[index]?.data?.items?.[0]?.reviewId ?? null;
        return acc;
      }, {}),
    [reviewQueries, taskItems],
  );

  const selectedTask = taskItems.find((task) => task.id === selectedTaskId) ?? null;
  const selectedTaskDetailQuery = useTaskDetail(projectId, selectedTaskId ?? 0, Boolean(selectedTaskId));
  const selectedTaskDetail = selectedTaskDetailQuery.data ?? null;
  const selectedTaskReviewsQuery = useTaskReviews(selectedTaskId ?? 0, Boolean(selectedTaskId));
  const selectedTaskReviews = selectedTaskReviewsQuery.data?.items ?? [];
  const latestSelectedReview = selectedTaskReviews[0] ?? null;
  const groupedByStatus = groupTasksByStatus(scopedTaskItems);
  const pendingCount = groupedByStatus.PENDING.length;
  const reviewCount = groupedByStatus.IN_REVIEW.length;
  const completedCount = groupedByStatus.COMPLETED.length;
  const activeAssignees = new Set(scopedTaskItems.map((task) => task.assigneeName)).size;
  const currentAssignee = useMemo(() => {
    if (!selectedTaskDetail) return selectedTask ? activeMembers.find((member) => member.userId === selectedTask.assigneeId) ?? null : null;
    return activeMembers.find((member) => member.userId === selectedTaskDetail.authorId) ?? null;
  }, [activeMembers, selectedTask, selectedTaskDetail]);
  const detailBusy =
    updateTaskTitleMutation.isPending ||
    updateTaskDescriptionMutation.isPending ||
    updateTaskStartDateMutation.isPending ||
    updateTaskDueDateMutation.isPending ||
    updateTaskPriorityMutation.isPending ||
    assignTaskMutation.isPending ||
    assignTaskToMeMutation.isPending ||
    unassignTaskMutation.isPending ||
    unassignTaskFromMeMutation.isPending ||
    startTaskMutation.isPending ||
    cancelTaskStartMutation.isPending ||
    forceCompleteTaskMutation.isPending;

  function openReviewComposer(task: { id: number; title: string }) {
    setReviewComposerTask(task);
    setReviewComposerOpen(true);
  }

  useEffect(() => {
    if (!selectedTask) {
      setEditingField(null);
      setDetailErrorMessage(null);
      return;
    }

    const source = selectedTaskDetail ?? {
      title: selectedTask.title,
      description: selectedTask.summary,
      startDate: selectedTask.startDate,
      dueDate: selectedTask.dueDate,
      priority: selectedTask.priority,
      authorId: selectedTask.assigneeId,
    };

    const nextDraft = {
      title: source.title ?? '',
      description: source.description ?? '',
      startDate: source.startDate ? toDateInputValue(source.startDate) : '',
      dueDate: source.dueDate ? toDateInputValue(source.dueDate) : '',
      priority: source.priority,
      assigneeUserId: source.authorId || null,
    };

    setTaskDraft((current) => {
      if (
        current.title === nextDraft.title &&
        current.description === nextDraft.description &&
        current.startDate === nextDraft.startDate &&
        current.dueDate === nextDraft.dueDate &&
        current.priority === nextDraft.priority &&
        current.assigneeUserId === nextDraft.assigneeUserId
      ) {
        return current;
      }

      return nextDraft;
    });
    setDetailErrorMessage(null);
  }, [selectedTask, selectedTaskDetail]);

  function resetCreateTaskForm() {
    setCreateTaskForm({
      title: '',
      description: '',
      startDate: '',
      dueDate: '',
      priority: 'HIGH',
      assignmentMode: 'me',
      assigneeUserId: memberAssignableOptions[0]?.userId ?? null,
    });
    setCreateTaskErrorMessage(null);
  }

  async function handleCreateTask() {
    setCreateTaskErrorMessage(null);

    try {
      const createdTask = await createTaskMutation.mutateAsync({
        title: createTaskForm.title,
        description: createTaskForm.description,
        startDate: createTaskForm.startDate ? new Date(createTaskForm.startDate).toISOString() : null,
        dueDate: createTaskForm.dueDate ? new Date(createTaskForm.dueDate).toISOString() : null,
        priority: createTaskForm.priority,
      });

      if (createTaskForm.assignmentMode === 'me') {
        await assignTaskToMeMutation.mutateAsync({ taskId: createdTask.id });
      }

      if (createTaskForm.assignmentMode === 'member' && createTaskForm.assigneeUserId != null) {
        await assignTaskMutation.mutateAsync({
          taskId: createdTask.id,
          input: { userId: createTaskForm.assigneeUserId },
        });
      }

      resetCreateTaskForm();
      setCreateTaskOpen(false);
    } catch (error) {
      const apiError = error instanceof BackendApiError ? error : toBackendApiError(error);
      setCreateTaskErrorMessage(
        apiError.code === 'TASK_ASSIGN_FORBIDDEN'
          ? '다른 멤버를 담당자로 지정할 권한이 없습니다. 본인 할당 또는 담당 없음으로 생성해 주세요.'
          : apiError.code === 'TASK_ASSIGNMENT_NOT_ALLOWED'
            ? '현재 상태에서는 담당자 지정이 허용되지 않습니다.'
            : apiError.message,
      );
    }
  }

  async function runTaskMutation(action: () => Promise<unknown>) {
    setDetailErrorMessage(null);

    try {
      await action();
      setEditingField(null);
    } catch (error) {
      const apiError = error instanceof BackendApiError ? error : toBackendApiError(error);
      setDetailErrorMessage(apiError.message);
    }
  }

  async function handleSaveField(field: EditableTaskField) {
    if (!selectedTaskId) return;

    if (field === 'title') {
      await runTaskMutation(() =>
        updateTaskTitleMutation.mutateAsync({ taskId: selectedTaskId, input: { value: taskDraft.title.trim() } }),
      );
      return;
    }

    if (field === 'description') {
      await runTaskMutation(() =>
        updateTaskDescriptionMutation.mutateAsync({
          taskId: selectedTaskId,
          input: { value: taskDraft.description.trim() },
        }),
      );
      return;
    }

    if (field === 'startDate') {
      await runTaskMutation(() =>
        updateTaskStartDateMutation.mutateAsync({
          taskId: selectedTaskId,
          input: { date: taskDraft.startDate ? new Date(taskDraft.startDate).toISOString() : null },
        }),
      );
      return;
    }

    if (field === 'dueDate') {
      await runTaskMutation(() =>
        updateTaskDueDateMutation.mutateAsync({
          taskId: selectedTaskId,
          input: { date: taskDraft.dueDate ? new Date(taskDraft.dueDate).toISOString() : null },
        }),
      );
      return;
    }

    if (field === 'priority') {
      await runTaskMutation(() =>
        updateTaskPriorityMutation.mutateAsync({
          taskId: selectedTaskId,
          input: { priority: taskDraft.priority },
        }),
      );
    }
  }

  async function handleAssignToMe() {
    if (!selectedTaskId) return;
    await runTaskMutation(() => assignTaskToMeMutation.mutateAsync({ taskId: selectedTaskId }));
  }

  async function handleAssignSelectedMember() {
    if (!selectedTaskId || taskDraft.assigneeUserId == null) return;
    const userId = taskDraft.assigneeUserId;
    await runTaskMutation(() =>
      assignTaskMutation.mutateAsync({ taskId: selectedTaskId, input: { userId } }),
    );
  }

  async function handleUnassign() {
    if (!selectedTaskId) return;
    const targetAction =
      currentUserId != null && selectedTaskDetail?.authorId === currentUserId
        ? () => unassignTaskFromMeMutation.mutateAsync({ taskId: selectedTaskId })
        : () => unassignTaskMutation.mutateAsync({ taskId: selectedTaskId });
    await runTaskMutation(targetAction);
  }

  async function handleStateAction(action: 'start' | 'cancel-start' | 'force-complete') {
    if (!selectedTaskId) return;

    if (action === 'start') {
      await runTaskMutation(() => startTaskMutation.mutateAsync({ taskId: selectedTaskId }));
      return;
    }

    if (action === 'cancel-start') {
      await runTaskMutation(() => cancelTaskStartMutation.mutateAsync({ taskId: selectedTaskId }));
      return;
    }

    await runTaskMutation(() => forceCompleteTaskMutation.mutateAsync({ taskId: selectedTaskId }));
    setForceCompleteConfirmOpen(false);
  }

  function getMilestoneTasks(milestoneId: string) {
    const fallbackOrder = sourceOrderByMilestone[milestoneId] ?? [];
    const taskMap = new Map(
      scopedTaskItems.filter((task) => task.milestoneId === milestoneId).map((task) => [task.id, task] as const),
    );
    const currentOrder = taskOrderByMilestone[milestoneId] ?? fallbackOrder;

    return currentOrder.map((taskId) => taskMap.get(taskId)).filter((task): task is TaskViewItem => Boolean(task));
  }

  function handleDragStart() {
    suppressClickUntilRef.current = Date.now() + 400;
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

    suppressClickUntilRef.current = Date.now() + 400;
    setTaskOrderByMilestone((prev) => ({
      ...prev,
      [milestoneId]: arrayMove(currentOrder, oldIndex, newIndex),
    }));
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-end justify-between gap-5 border-b border-border/70 pb-6 pt-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:gap-x-10">
          <InlineStat label="마일스톤" value={`${displayMilestones.length}개`} icon={<Rows3 size={15} />} />
          <InlineStat label="대기" value={`${pendingCount}건`} icon={<ChevronRight size={15} />} />
          <InlineStat label="검토중" value={`${reviewCount}건`} icon={<SendHorizontal size={15} />} />
          <InlineStat label="완료" value={`${completedCount}건`} icon={<ChartColumn size={15} />} />
          <InlineStat label="담당자" value={`${activeAssignees}명`} icon={<Users2 size={15} />} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-md">{currentProject?.code ?? '업무'}</Badge>
          <Badge variant="outline" className="rounded-md">{getViewLabel(currentView)}</Badge>
          <span>드래그로 순서를 바꾸고 상세 모달로 바로 진입합니다.</span>
        </div>
      </section>

      <section className="min-w-0 bg-background pt-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="inline-flex flex-wrap items-center gap-2 rounded-[22px] border border-border/70 bg-muted/20 p-2">
            <ScopeButton active={taskScope === 'milestone'} onClick={() => setTaskScope('milestone')}>
              마일스톤별 보기
            </ScopeButton>
            <ScopeButton active={taskScope === 'timeline'} onClick={() => setTaskScope('timeline')}>
              시간순 보기
            </ScopeButton>
            <ScopeButton active={taskScope === 'mine'} onClick={() => setTaskScope('mine')}>
              내 업무만
            </ScopeButton>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">{scopedTaskItems.length}건 표시</div>
            <Button
              className="rounded-2xl"
              onClick={() => {
                resetCreateTaskForm();
                setCreateTaskOpen(true);
              }}
            >
              새 업무 추가
            </Button>
          </div>
        </div>

        {currentView === 'table' ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="divide-y divide-border/70">
              {taskScope === 'milestone' ? (
                <>
                  <div className="space-y-6 lg:hidden">
                    {displayMilestones.map((milestone: ProjectMilestone) => {
                      const milestoneTasks = getMilestoneTasks(milestone.id);
                      const total = milestoneTasks.length || 1;
                      const done = milestoneTasks.filter((task) => task.status === 'COMPLETED').length;
                      const progress = Math.round((done / total) * 100);

                      return (
                        <section key={milestone.id} className="border-b border-border/70 pb-5">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <div className="font-semibold text-foreground">{milestone.name}</div>
                              <div className="mt-1 text-xs text-muted-foreground">{milestone.summary}</div>
                            </div>
                            <StatusPill tone="slate">{progress}%</StatusPill>
                          </div>
                          <div className="space-y-3">
                            {milestoneTasks.map((task) => (
                              <TaskMobileCard
                                key={task.id}
                                task={task}
                                onSelect={() => setSelectedTaskId(task.id)}
                                onOpenReview={() => {
                                  const reviewId = latestReviewByTaskId[task.id];
                                  if (reviewId) {
                                    setSelectedReviewId(reviewId);
                                    return;
                                  }
                                  setSelectedTaskId(task.id);
                                }}
                                onSubmitReview={() => {
                                  openReviewComposer({ id: task.id, title: task.title });
                                }}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>

                  <div className="hidden lg:block">
                    {displayMilestones.map((milestone: ProjectMilestone) => {
                      const milestoneTasks = getMilestoneTasks(milestone.id);
                      const total = milestoneTasks.length || 1;
                      const done = milestoneTasks.filter((task) => task.status === 'COMPLETED').length;
                      const progress = Math.round((done / total) * 100);

                      return (
                        <section key={milestone.id} className="py-4 first:pt-0">
                          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold tracking-tight text-foreground">{milestone.name}</h2>
                                <StatusPill tone="slate">{progress}%</StatusPill>
                                <StatusPill tone={milestone.health === 'COMPLETE' ? 'green' : milestone.health === 'AT_RISK' ? 'amber' : 'teal'}>
                                  {getMilestoneHealthLabel(milestone.health)}
                                </StatusPill>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{milestone.summary}</p>
                            </div>
                            <div className="min-w-[190px]">
                              <div className="h-1.5 overflow-hidden bg-muted">
                                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                              </div>
                              <div className="mt-2 text-right text-xs text-muted-foreground">
                                {milestoneTasks.length}건 · 마감 {formatListDueDate(milestone.dueDate)}
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
                                <TableHead>액션</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <SortableContext items={milestoneTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                                {milestoneTasks.map((task) => (
                                  <SortableTaskRow
                                    key={task.id}
                                    task={task}
                                    selected={selectedTask?.id === task.id}
                                    onSelect={() => {
                                      if (Date.now() < suppressClickUntilRef.current) return;
                                      setSelectedTaskId(task.id);
                                    }}
                                    onOpenReview={() => {
                                      const reviewId = latestReviewByTaskId[task.id];
                                      if (reviewId) {
                                        setSelectedReviewId(reviewId);
                                        return;
                                      }
                                      setSelectedTaskId(task.id);
                                    }}
                                    onSubmitReview={() => {
                                      openReviewComposer({ id: task.id, title: task.title });
                                    }}
                                  />
                                ))}
                              </SortableContext>
                            </TableBody>
                          </Table>
                        </section>
                      );
                    })}
                  </div>
                </>
              ) : (
                <section className="py-2">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold tracking-tight text-foreground">{taskScope === 'mine' ? '내 업무' : '시간순 업무'}</h2>
                    </div>
                    <StatusPill tone="slate">{scopedTaskItems.length}건</StatusPill>
                  </div>
                  <div className="space-y-3 lg:hidden">
                    {scopedTaskItems.map((task) => (
                      <TaskMobileCard
                        key={task.id}
                        task={task}
                        onSelect={() => setSelectedTaskId(task.id)}
                        onOpenReview={() => {
                          const reviewId = latestReviewByTaskId[task.id];
                          if (reviewId) {
                            setSelectedReviewId(reviewId);
                            return;
                          }
                          setSelectedTaskId(task.id);
                        }}
                        onSubmitReview={() => {
                          openReviewComposer({ id: task.id, title: task.title });
                        }}
                        showMilestone
                      />
                    ))}
                  </div>
                  <Table className="hidden border-t border-border/70 lg:table">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>업무</TableHead>
                        <TableHead>마일스톤</TableHead>
                        <TableHead>담당자</TableHead>
                        <TableHead>우선순위</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>기한</TableHead>
                        <TableHead>액션</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <SortableContext items={scopedTaskItems.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                        {scopedTaskItems.map((task) => (
                          <SortableTaskRow
                            key={task.id}
                            task={task}
                            selected={selectedTask?.id === task.id}
                            onSelect={() => {
                              if (Date.now() < suppressClickUntilRef.current) return;
                              setSelectedTaskId(task.id);
                            }}
                            onOpenReview={() => {
                              const reviewId = latestReviewByTaskId[task.id];
                              if (reviewId) {
                                setSelectedReviewId(reviewId);
                                return;
                              }
                              setSelectedTaskId(task.id);
                            }}
                            onSubmitReview={() => {
                              openReviewComposer({ id: task.id, title: task.title });
                            }}
                            showMilestone
                          />
                        ))}
                      </SortableContext>
                    </TableBody>
                  </Table>
                </section>
              )}
            </div>
          </DndContext>
        ) : currentView === 'kanban' ? (
          <KanbanView items={scopedTaskItems} selectedTaskId={selectedTask?.id ?? null} onSelect={setSelectedTaskId} />
        ) : currentView === 'calendar' ? (
          <CalendarView
            items={scopedTaskItems}
            cursor={calendarCursor}
            onMoveMonth={(offset) => {
              setCalendarCursor((current) => {
                const next = new Date(current);
                next.setMonth(current.getMonth() + offset, 1);
                return next;
              });
            }}
            onMoveYear={(offset) => {
              setCalendarCursor((current) => {
                const next = new Date(current);
                next.setFullYear(current.getFullYear() + offset, current.getMonth(), 1);
                return next;
              });
            }}
            onSelect={setSelectedTaskId}
          />
        ) : currentView === 'chart' ? (
          <ChartView items={scopedTaskItems} milestones={displayMilestones} />
        ) : (
          <GanttView
            items={scopedTaskItems}
            cursor={calendarCursor}
            onMoveMonth={(offset) => {
              setCalendarCursor((current) => {
                const next = new Date(current);
                next.setMonth(current.getMonth() + offset, 1);
                return next;
              });
            }}
            onMoveYear={(offset) => {
              setCalendarCursor((current) => {
                const next = new Date(current);
                next.setFullYear(current.getFullYear() + offset, current.getMonth(), 1);
                return next;
              });
            }}
            selectedTaskId={selectedTask?.id ?? null}
            onSelect={setSelectedTaskId}
          />
        )}
      </section>

      <AppModal
        open={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTaskId(null);
            setForceCompleteConfirmOpen(false);
            setReviewComposerOpen(false);
          }
        }}
        title={taskDraft.title || selectedTask?.title || ''}
        description={
          selectedTask
            ? `${selectedTask.milestoneName} · ${currentAssignee?.name ?? (selectedTaskDetail?.authorId === 0 ? '담당 없음' : selectedTask.assigneeName)}`
            : undefined
        }
        badges={
          selectedTask ? (
            <>
              <StatusPill tone="teal">{selectedTask.domain}</StatusPill>
              <StatusPill tone="purple">
                {currentAssignee?.name ?? (selectedTaskDetail?.authorId === 0 ? '담당 없음' : selectedTask.assigneeName)}
              </StatusPill>
              <StatusPill tone="slate">{selectedTask.milestoneName}</StatusPill>
            </>
          ) : null
        }
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {detailBusy ? '변경 내용을 저장하는 중입니다.' : '필드별로 바로 저장되고 목록과 상세가 함께 갱신됩니다.'}
            </div>
            <Button type="button" variant="outline" size="lg" className="min-w-24 rounded-xl px-4" onClick={() => setSelectedTaskId(null)}>
              닫기
            </Button>
          </div>
        }
        size="xl"
      >
        {selectedTask ? (
          <div className="space-y-6">
            <section className="grid gap-3 border-b border-border/70 pb-5 md:grid-cols-4">
              <SummaryBlock label="현재 상태" value={getStatusLabel(selectedTaskDetail?.status ?? selectedTask.status)} tone={getStatusTone(selectedTaskDetail?.status ?? selectedTask.status)} />
              <SummaryBlock label="담당자" value={currentAssignee?.name ?? (selectedTaskDetail?.authorId === 0 ? '담당 없음' : selectedTask.assigneeName)} />
              <SummaryBlock label="마일스톤" value={selectedTask.milestoneName} />
              <SummaryBlock
                label="다음 행동"
                value={getNextActionLabel(selectedTaskDetail?.status ?? selectedTask.status, Boolean(latestSelectedReview))}
                icon={<SquareDashedMousePointer size={14} />}
              />
            </section>

            {detailErrorMessage ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {detailErrorMessage}
              </div>
            ) : null}

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="space-y-6">
                <TaskEditableField
                  label="업무 제목"
                  editing={editingField === 'title'}
                  onEdit={() => setEditingField('title')}
                  onCancel={() => setEditingField(null)}
                  onSave={() => void handleSaveField('title')}
                  disabled={detailBusy}
                  view={<span className="text-base font-semibold text-foreground">{taskDraft.title || selectedTask.title}</span>}
                >
                  <Input
                    value={taskDraft.title}
                    onChange={(event) => setTaskDraft((current) => ({ ...current, title: event.target.value }))}
                    placeholder="업무 제목을 입력하세요"
                  />
                </TaskEditableField>

                <TaskEditableField
                  label="업무 설명"
                  editing={editingField === 'description'}
                  onEdit={() => setEditingField('description')}
                  onCancel={() => setEditingField(null)}
                  onSave={() => void handleSaveField('description')}
                  disabled={detailBusy}
                  view={<p className="break-keep text-sm leading-6 text-muted-foreground">{taskDraft.description || '설명이 아직 없습니다.'}</p>}
                >
                  <textarea
                    value={taskDraft.description}
                    onChange={(event) => setTaskDraft((current) => ({ ...current, description: event.target.value }))}
                    placeholder="업무 목적과 기대 결과를 적어주세요."
                    className="min-h-32 w-full rounded-xl border border-border/70 bg-background px-3 py-3 text-sm leading-6 outline-none transition focus:border-primary/30"
                  />
                </TaskEditableField>

                <div className="grid gap-4 md:grid-cols-2">
                  <TaskEditableField
                    label="시작일"
                    editing={editingField === 'startDate'}
                    onEdit={() => setEditingField('startDate')}
                    onCancel={() => setEditingField(null)}
                    onSave={() => void handleSaveField('startDate')}
                    disabled={detailBusy}
                    view={<span className="text-sm font-medium text-foreground">{formatDueDateShort(selectedTaskDetail?.startDate ?? selectedTask.startDate)}</span>}
                  >
                    <Input
                      type="date"
                      value={taskDraft.startDate}
                      onChange={(event) => setTaskDraft((current) => ({ ...current, startDate: event.target.value }))}
                    />
                  </TaskEditableField>

                  <TaskEditableField
                    label="마감일"
                    editing={editingField === 'dueDate'}
                    onEdit={() => setEditingField('dueDate')}
                    onCancel={() => setEditingField(null)}
                    onSave={() => void handleSaveField('dueDate')}
                    disabled={detailBusy}
                    view={<span className="text-sm font-medium text-foreground">{formatDueDateShort(selectedTaskDetail?.dueDate ?? selectedTask.dueDate)}</span>}
                  >
                    <Input
                      type="date"
                      value={taskDraft.dueDate}
                      onChange={(event) => setTaskDraft((current) => ({ ...current, dueDate: event.target.value }))}
                    />
                  </TaskEditableField>
                </div>

                <TaskEditableField
                  label="우선순위"
                  editing={editingField === 'priority'}
                  onEdit={() => setEditingField('priority')}
                  onCancel={() => setEditingField(null)}
                  onSave={() => void handleSaveField('priority')}
                  disabled={detailBusy}
                  view={<StatusPill tone={getPriorityTone(taskDraft.priority)}>{getPriorityLabel(taskDraft.priority)}</StatusPill>}
                >
                  <select
                    value={taskDraft.priority}
                    onChange={(event) =>
                      setTaskDraft((current) => ({ ...current, priority: event.target.value as PriorityLevel }))
                    }
                    className="h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none transition focus:border-primary/30"
                  >
                    <option value="HIGHEST">매우 높음</option>
                    <option value="HIGH">높음</option>
                    <option value="MEDIUM">보통</option>
                    <option value="LOW">낮음</option>
                    <option value="LOWEST">매우 낮음</option>
                  </select>
                </TaskEditableField>
              </div>

              <div className="space-y-6">
                <section className="rounded-2xl border border-border/70 bg-muted/[0.04] px-4 py-4">
                  <div className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground">담당자 제어</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusPill tone="purple">
                      {currentAssignee?.name ?? (selectedTaskDetail?.authorId === 0 ? '담당 없음' : selectedTask.assigneeName)}
                    </StatusPill>
                    <StatusPill tone="slate">{selectedTask.domain}</StatusPill>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" className="rounded-md" onClick={() => void handleAssignToMe()} disabled={detailBusy}>
                        나에게 할당
                      </Button>
                      <Button type="button" variant="outline" className="rounded-md" onClick={() => void handleUnassign()} disabled={detailBusy || selectedTaskDetail?.authorId === 0}>
                        담당 해제
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select
                        value={taskDraft.assigneeUserId ?? ''}
                        onChange={(event) =>
                          setTaskDraft((current) => ({
                            ...current,
                            assigneeUserId: event.target.value ? Number(event.target.value) : null,
                          }))
                        }
                        className="h-10 min-w-0 flex-1 rounded-md border border-border/70 bg-background px-3 text-sm outline-none transition focus:border-primary/30"
                        disabled={!canAssignOthers}
                      >
                        <option value="">다른 멤버 선택</option>
                        {memberAssignableOptions.map((member) => (
                          <option key={member.id} value={member.userId}>
                            {member.name} · {member.team}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        className="rounded-md"
                        onClick={() => void handleAssignSelectedMember()}
                        disabled={detailBusy || !canAssignOthers || taskDraft.assigneeUserId == null}
                      >
                        멤버 지정
                      </Button>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">
                      담당자 변경은 상세 모달에서 바로 반영되고, 목록과 상세가 함께 다시 불러와집니다.
                    </p>
                  </div>
                </section>

                <section className="rounded-2xl border border-border/70 bg-muted/[0.04] px-4 py-4">
                  <div className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground">작업 액션</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(selectedTaskDetail?.status ?? selectedTask.status) === 'PENDING' ? (
                      <Button type="button" className="rounded-md" onClick={() => void handleStateAction('start')} disabled={detailBusy}>
                        <CirclePlay size={15} />
                        업무 시작
                      </Button>
                    ) : null}
                    {(selectedTaskDetail?.status ?? selectedTask.status) === 'IN_PROGRESS' ? (
                      <Button type="button" variant="outline" className="rounded-md" onClick={() => void handleStateAction('cancel-start')} disabled={detailBusy}>
                        시작 취소
                      </Button>
                    ) : null}
                    {(selectedTaskDetail?.status ?? selectedTask.status) === 'IN_REVIEW' ? (
                      <Button type="button" variant="outline" className="rounded-md border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => setForceCompleteConfirmOpen(true)} disabled={detailBusy}>
                        <AlertTriangle size={15} />
                        강제 완료
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      className="rounded-md"
                      onClick={() => openReviewComposer({ id: selectedTask.id, title: selectedTask.title })}
                    >
                      <SendHorizontal size={15} />
                      검토 상신하기
                    </Button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MetaRow label="현재 상태" value={getStatusLabel(selectedTaskDetail?.status ?? selectedTask.status)} />
                    <MetaRow label="최근 갱신" value={formatDate(selectedTaskDetail?.updatedAt ?? selectedTask.updatedAt)} />
                    <MetaRow label="업무 영역" value={selectedTask.domain} />
                    <MetaRow label="연결 검토" value={`${selectedTaskReviews.length}건`} />
                  </div>
                </section>

                <section className="rounded-2xl border border-border/70 bg-muted/[0.04] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground">검토 연결</div>
                    {latestSelectedReview ? (
                      <Button type="button" variant="outline" className="rounded-md" onClick={() => setSelectedReviewId(latestSelectedReview.reviewId)}>
                        최신 검토 상세
                        <ArrowRight size={15} />
                      </Button>
                    ) : null}
                  </div>
                  <div className="mt-3 space-y-2">
                    {selectedTaskReviews.length > 0 ? (
                      selectedTaskReviews.slice(0, 3).map((review) => (
                        <button
                          key={review.reviewId}
                          type="button"
                          onClick={() => setSelectedReviewId(review.reviewId)}
                          className="flex w-full items-center justify-between rounded-md border border-border/70 px-3 py-3 text-left text-sm transition hover:border-primary/30"
                        >
                          <div>
                            <div className="font-medium text-foreground">{review.roundNo}차 검토</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              상신 {formatDueDateShort(review.submittedAt)} · 처리 {formatDueDateShort(review.decidedAt)}
                            </div>
                          </div>
                          <StatusPill tone={getReviewTone(review.status)}>{getReviewStatusLabel(review.status)}</StatusPill>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-md border border-dashed border-border/70 px-3 py-4 text-sm leading-6 text-muted-foreground">
                        아직 검토가 생성되지 않았습니다. 먼저 업무 내용을 정리한 뒤 새 검토 상신으로 첫 라운드를 시작하세요.
                        <div className="mt-3">
                          <Button
                            type="button"
                            className="rounded-md"
                            onClick={() => openReviewComposer({ id: selectedTask.id, title: selectedTask.title })}
                          >
                            <SendHorizontal size={15} />
                            첫 검토 상신하기
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </section>
          </div>
        ) : null}
      </AppModal>

      <AppModal
        open={forceCompleteConfirmOpen}
        onOpenChange={setForceCompleteConfirmOpen}
        title="강제 완료 확인"
        description="검토중 업무를 강제로 완료 처리하면 이후 목록과 검토 흐름에 즉시 반영됩니다."
        size="sm"
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setForceCompleteConfirmOpen(false)}>
              취소
            </Button>
            <Button
              type="button"
              className="rounded-md bg-amber-600 text-white hover:bg-amber-700"
              onClick={() => void handleStateAction('force-complete')}
              disabled={detailBusy}
            >
              강제 완료 실행
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            현재 업무를 완료로 전환하면 목록 상태와 진행률이 즉시 갱신됩니다. 검토가 아직 진행 중이라면 운영상 예외 처리로 기록됩니다.
          </p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            파괴적 액션이므로, 실제 운영에서는 승인 이력과 함께 기록된다는 전제로 사용해야 합니다.
          </div>
        </div>
      </AppModal>

      <ReviewDetailModal
        reviewId={selectedReviewId}
        open={Boolean(selectedReviewId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReviewId(null);
          }
        }}
      />

      <ReviewComposerModal
        open={reviewComposerOpen}
        onOpenChange={(open) => {
          setReviewComposerOpen(open);
          if (!open) {
            setReviewComposerTask(null);
          }
        }}
        taskId={reviewComposerTask?.id ?? null}
        taskTitle={reviewComposerTask?.title ?? null}
        onSubmitted={(reviewId) => {
          setReviewComposerTask(null);
          setSelectedReviewId(reviewId);
        }}
      />

      <AppModal
        open={createTaskOpen}
        onOpenChange={(open) => {
          setCreateTaskOpen(open);
          if (open) {
            resetCreateTaskForm();
          } else {
            setCreateTaskErrorMessage(null);
          }
        }}
        title="새 업무 추가"
        description="업무를 등록한 뒤 바로 담당자를 비우거나, 나에게 할당하거나, 권한이 있으면 다른 멤버에게 지정할 수 있습니다."
        size="md"
        footer={
          <div className="flex w-full items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setCreateTaskOpen(false)}>닫기</Button>
            <Button
              onClick={() => {
                void handleCreateTask();
              }}
              disabled={
                !createTaskForm.title.trim() ||
                createTaskMutation.isPending ||
                assignTaskMutation.isPending ||
                assignTaskToMeMutation.isPending ||
                (createTaskForm.assignmentMode === 'member' && createTaskForm.assigneeUserId == null)
              }
            >
              {createTaskMutation.isPending || assignTaskMutation.isPending || assignTaskToMeMutation.isPending
                ? '저장 중'
                : '업무 생성'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="업무 제목">
            <Input
              value={createTaskForm.title}
              onChange={(event) => setCreateTaskForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="예: 검토 승인 큐 재정렬"
            />
          </Field>
          <Field label="설명">
            <textarea
              value={createTaskForm.description}
              onChange={(event) => setCreateTaskForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="업무 목적과 산출물을 간단히 적습니다."
              className="min-h-28 w-full rounded-2xl border border-border/70 bg-background px-3 py-3 text-sm outline-none transition focus:border-primary/30"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="시작일">
              <Input
                type="date"
                value={createTaskForm.startDate}
                onChange={(event) => setCreateTaskForm((current) => ({ ...current, startDate: event.target.value }))}
              />
            </Field>
            <Field label="마감일">
              <Input
                type="date"
                value={createTaskForm.dueDate}
                onChange={(event) => setCreateTaskForm((current) => ({ ...current, dueDate: event.target.value }))}
              />
            </Field>
          </div>
          <Field label="우선순위">
            <select
              value={createTaskForm.priority}
              onChange={(event) =>
                setCreateTaskForm((current) => ({ ...current, priority: event.target.value as typeof current.priority }))
              }
              className="h-11 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm outline-none transition focus:border-primary/30"
            >
              <option value="HIGHEST">매우 높음</option>
              <option value="HIGH">높음</option>
              <option value="MEDIUM">보통</option>
              <option value="LOW">낮음</option>
              <option value="LOWEST">매우 낮음</option>
            </select>
          </Field>
          <Field label="담당자 지정">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <AssignmentModeCard
                  active={createTaskForm.assignmentMode === 'unassigned'}
                  title="담당 없음"
                  description="업무만 먼저 만들고 나중에 담당자를 붙입니다."
                  onClick={() =>
                    setCreateTaskForm((current) => ({ ...current, assignmentMode: 'unassigned' }))
                  }
                />
                <AssignmentModeCard
                  active={createTaskForm.assignmentMode === 'me'}
                  title={actorMember ? `${actorMember.name}에게 할당` : '나에게 할당'}
                  description="할당 권한이 없어도 본인 담당으로는 바로 생성할 수 있습니다."
                  onClick={() =>
                    setCreateTaskForm((current) => ({ ...current, assignmentMode: 'me' }))
                  }
                />
                <AssignmentModeCard
                  active={createTaskForm.assignmentMode === 'member'}
                  title="다른 멤버 지정"
                  description="관리자나 업무 할당 권한이 있으면 바로 다른 멤버를 선택합니다."
                  disabled={!canAssignOthers}
                  onClick={() =>
                    setCreateTaskForm((current) => ({
                      ...current,
                      assignmentMode: 'member',
                      assigneeUserId:
                        current.assigneeUserId ?? memberAssignableOptions[0]?.userId ?? null,
                    }))
                  }
                />
              </div>
              {createTaskForm.assignmentMode === 'member' ? (
                <select
                  value={createTaskForm.assigneeUserId ?? ''}
                  onChange={(event) =>
                    setCreateTaskForm((current) => ({
                      ...current,
                      assigneeUserId: event.target.value ? Number(event.target.value) : null,
                    }))
                  }
                  className="h-11 w-full rounded-2xl border border-border/70 bg-background px-3 text-sm outline-none transition focus:border-primary/30 disabled:cursor-not-allowed disabled:bg-muted/30"
                  disabled={!canAssignOthers || memberAssignableOptions.length === 0}
                >
                  <option value="">담당할 멤버를 선택하세요</option>
                  {memberAssignableOptions.map((member) => (
                    <option key={member.id} value={member.userId}>
                      {member.name} · {member.team}
                    </option>
                  ))}
                </select>
              ) : null}
              <div className="rounded-[18px] border border-border/70 bg-muted/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
                {canAssignOthers
                  ? '생성 후 바로 담당자 지정까지 이어집니다. 다른 멤버 지정은 backend assign API를 추가로 호출합니다.'
                  : '현재 권한 기준으로는 본인에게만 바로 할당할 수 있습니다. 다른 멤버 지정 시 backend가 최종적으로 다시 권한을 확인합니다.'}
              </div>
            </div>
          </Field>
          {createTaskErrorMessage ? (
            <div className="rounded-[18px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
              {createTaskErrorMessage}
            </div>
          ) : null}
        </div>
      </AppModal>
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
    { key: 'PENDING', title: '대기', tone: 'blue' as const, items: groups.PENDING },
    { key: 'IN_PROGRESS', title: '진행중', tone: 'slate' as const, items: groups.IN_PROGRESS },
    { key: 'IN_REVIEW', title: '검토중', tone: 'amber' as const, items: groups.IN_REVIEW },
    { key: 'COMPLETED', title: '완료', tone: 'green' as const, items: groups.COMPLETED },
  ];

  return (
    <div className="grid gap-8 xl:grid-cols-4">
      {columns.map((column) => (
        <section key={column.key} className="min-w-0">
          <div className="flex min-h-14 items-center justify-between border-b border-border/70 pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold leading-none text-foreground">{column.title}</h2>
              <span
                className={[
                  'inline-flex h-8 min-w-10 items-center justify-center rounded-md border px-2.5 text-sm font-semibold leading-none',
                  column.tone === 'green'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : column.tone === 'blue'
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : column.tone === 'amber'
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : 'border-slate-300 bg-slate-50 text-slate-700',
                ].join(' ')}
              >
                {column.items.length}
              </span>
            </div>
          </div>
          <div className="space-y-5 pt-5">
            {column.items.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onSelect(task.id)}
                className={[
                  'w-full border-b border-border/70 px-0 pb-3 text-left transition last:border-b-0 hover:border-primary/30',
                  selectedTaskId === task.id ? 'border-primary/30' : '',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-foreground">{task.title}</div>
                  </div>
                  <StatusPill tone={column.tone}>{getStatusLabel(task.status)}</StatusPill>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill tone="purple">{task.assigneeName}</StatusPill>
                  <StatusPill tone="teal">{task.domain}</StatusPill>
                  <span className="text-xs text-muted-foreground">{formatDueDateShort(task.dueDate)}</span>
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
  cursor,
  onMoveMonth,
  onMoveYear,
  onSelect,
}: {
  items: TaskViewItem[];
  cursor: Date;
  onMoveMonth: (offset: number) => void;
  onMoveYear: (offset: number) => void;
  onSelect: (taskId: number) => void;
}) {
  const targetMonth = new Date(cursor);
  targetMonth.setDate(1);
  const today = new Date();
  const startDay = targetMonth.getDay();
  const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => index - startDay + 1);

  const tasksByDay = items.reduce<Record<number, TaskViewItem[]>>((acc, item) => {
    const date = new Date(item.dueDate).getDate();
    acc[date] = [...(acc[date] ?? []), item];
    return acc;
  }, {});

  return (
    <div className="border-t border-border/70 pt-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {targetMonth.getFullYear()}년 {targetMonth.getMonth() + 1}월
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">월 이동과 연도 이동으로 일정 범위를 탐색할 수 있습니다.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            className="rounded-md px-3 text-xs"
            onClick={() => {
              onMoveYear(today.getFullYear() - targetMonth.getFullYear());
              onMoveMonth(today.getMonth() - targetMonth.getMonth());
            }}
          >
            오늘
          </Button>
          <Button type="button" variant="outline" size="icon-sm" className="rounded-md" onClick={() => onMoveYear(-1)}>
            <ChevronsLeft size={14} />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" className="rounded-md" onClick={() => onMoveMonth(-1)}>
            <ChevronLeft size={14} />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" className="rounded-md" onClick={() => onMoveMonth(1)}>
            <ChevronRight size={14} />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" className="rounded-md" onClick={() => onMoveYear(1)}>
            <ChevronsRight size={14} />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="px-1.5 pb-1.5 text-[11px] font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
        {cells.map((day, index) => {
          const dayTasks = day > 0 && day <= daysInMonth ? tasksByDay[day] ?? [] : [];
          return (
            <div
              key={`${day}-${index}`}
              className={['min-h-[96px] border-t border-border/70 bg-background p-1.5', day <= 0 || day > daysInMonth ? 'bg-muted/25' : ''].join(' ')}
            >
              {day > 0 && day <= daysInMonth ? (
                <>
                  <div className="text-xs font-semibold text-foreground">{day}</div>
                  <div className="mt-1 space-y-1">
                    {dayTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onSelect(task.id)}
                        className="block w-full border-l-2 border-primary px-1.5 py-1 text-left text-[11px] transition hover:bg-muted/30"
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
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="border-t border-border/70 pt-3">
        <div className="pb-3">
          <h2 className="text-base font-semibold text-foreground">상태 분포</h2>
          <p className="mt-1 text-xs text-muted-foreground">현재 업무 분포를 상태별로 확인합니다.</p>
        </div>
        <div className="space-y-4">
          {[
            { label: '대기', value: groups.PENDING.length, tone: 'blue' as const },
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
                    row.tone === 'green'
                      ? 'bg-emerald-500'
                      : row.tone === 'amber'
                        ? 'bg-amber-500'
                        : row.tone === 'blue'
                          ? 'bg-blue-500'
                          : 'bg-slate-500',
                  ].join(' ')}
                  style={{ width: `${(row.value / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/70 pt-3">
        <div className="pb-3">
          <h2 className="text-base font-semibold text-foreground">마일스톤 부담</h2>
          <p className="mt-1 text-xs text-muted-foreground">마일스톤별 연결 업무와 완료 비율</p>
        </div>
        <div className="space-y-4">
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
                <div className="mt-2 text-xs text-muted-foreground">{milestoneTasks.length}건</div>
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
  cursor,
  onMoveMonth,
  onMoveYear,
  selectedTaskId,
  onSelect,
}: {
  items: TaskViewItem[];
  cursor: Date;
  onMoveMonth: (offset: number) => void;
  onMoveYear: (offset: number) => void;
  selectedTaskId: number | null;
  onSelect: (taskId: number) => void;
}) {
  const today = new Date();
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const totalDays = end.getDate();
  const days = Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(start);
    date.setDate(index + 1);
    return date;
  });
  const visibleItems = items.filter((item) => new Date(item.dueDate) >= start && new Date(item.startDate) <= end);

  return (
    <div className="border-t border-border/70 pt-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {cursor.getFullYear()}년 {cursor.getMonth() + 1}월 타임라인
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">월과 연도를 이동하며 간트 범위를 탐색할 수 있습니다.</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            className="rounded-md px-3 text-xs"
            onClick={() => {
              onMoveYear(today.getFullYear() - cursor.getFullYear());
              onMoveMonth(today.getMonth() - cursor.getMonth());
            }}
          >
            오늘
          </Button>
          <Button type="button" variant="outline" size="icon-sm" className="rounded-md" onClick={() => onMoveYear(-1)}>
            <ChevronsLeft size={14} />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" className="rounded-md" onClick={() => onMoveMonth(-1)}>
            <ChevronLeft size={14} />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" className="rounded-md" onClick={() => onMoveMonth(1)}>
            <ChevronRight size={14} />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" className="rounded-md" onClick={() => onMoveYear(1)}>
            <ChevronsRight size={14} />
          </Button>
        </div>
      </div>
      <div className="grid gap-x-1 border-b border-border/70 pb-3" style={{ gridTemplateColumns: `minmax(136px,2fr) repeat(${days.length}, minmax(0,1fr))` }}>
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">업무</div>
        {days.map((day) => (
          <div key={day.toISOString()} className="text-center text-[10px] font-semibold text-muted-foreground">
            {day.getDate()}
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-4">
        {visibleItems.map((task) => {
          const clippedStart = new Date(Math.max(new Date(task.startDate).getTime(), start.getTime()));
          const clippedEnd = new Date(Math.min(new Date(task.dueDate).getTime(), end.getTime()));
          const offset = Math.max(0, Math.round((clippedStart.getTime() - start.getTime()) / 86_400_000));
          const span = Math.max(1, Math.round((clippedEnd.getTime() - clippedStart.getTime()) / 86_400_000) + 1);

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelect(task.id)}
              className={[
                'grid w-full items-center gap-x-1 px-2 py-2.5 text-left transition hover:bg-muted/35',
                selectedTaskId === task.id ? 'bg-primary/5' : '',
              ].join(' ')}
              style={{ gridTemplateColumns: `minmax(136px,2fr) repeat(${days.length}, minmax(0,1fr))` }}
            >
              <div className="min-w-0 pr-2">
                <div className="truncate font-semibold text-foreground">{task.title}</div>
                <div className="mt-1 truncate text-[11px] text-muted-foreground">{task.assigneeName}</div>
              </div>
              {days.map((_, index) => {
                const active = index >= offset && index < offset + span;
                return (
                  <div key={`${task.id}-${index}`} className="h-5 rounded-sm bg-muted/35">
                    {active ? <div className="h-full rounded-sm bg-primary/85" /> : null}
                  </div>
                );
              })}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SortableTaskRow({
  task,
  selected,
  onSelect,
  onOpenReview,
  onSubmitReview,
  showMilestone = false,
}: {
  task: TaskViewItem;
  selected: boolean;
  onSelect: () => void;
  onOpenReview: () => void;
  onSubmitReview: () => void;
  showMilestone?: boolean;
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
      {...attributes}
      {...listeners}
      onClick={onSelect}
      style={{ transform: CSS.Transform.toString(transform), transition, touchAction: 'none' }}
      className={[
        'cursor-pointer select-none border-b transition-colors hover:bg-muted/30',
        selected ? 'bg-primary/7' : '',
        isDragging ? 'border-primary/20 bg-background shadow-[0_12px_28px_rgba(15,23,42,0.08)]' : '',
      ].join(' ')}
    >
      <TableCell className="py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-muted-foreground/60">
            <GripVertical size={16} />
          </span>
          <div className="min-w-0">
            <div className="font-semibold text-foreground">{task.title}</div>
          </div>
        </div>
      </TableCell>
      {showMilestone ? <TableCell>{task.milestoneName}</TableCell> : null}
      <TableCell>{task.assigneeName}</TableCell>
      <TableCell>
        <StatusPill tone={getPriorityTone(task.priority)}>{getPriorityLabel(task.priority)}</StatusPill>
      </TableCell>
      <TableCell>
        <StatusPill tone={getStatusTone(task.status)}>{getStatusLabel(task.status)}</StatusPill>
      </TableCell>
      <TableCell>{formatListDueDate(task.dueDate)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Link
            to="#"
            className="text-sm font-semibold text-primary hover:text-primary/80"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onOpenReview();
            }}
          >
            검토 보기
          </Link>
          <button
            type="button"
            className="text-sm font-semibold text-foreground/70 hover:text-foreground"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSubmitReview();
            }}
          >
            상신
          </button>
        </div>
      </TableCell>
    </tr>
  );
}

function TaskMobileCard({
  task,
  onSelect,
  onOpenReview,
  onSubmitReview,
  showMilestone = false,
}: {
  task: TaskViewItem;
  onSelect: () => void;
  onOpenReview: () => void;
  onSubmitReview: () => void;
  showMilestone?: boolean;
}) {
  return (
    <button type="button" onClick={onSelect} className="block w-full border-b border-border/70 pb-4 text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{task.title}</div>
        </div>
        <StatusPill tone={getStatusTone(task.status)}>{getStatusLabel(task.status)}</StatusPill>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
        {showMilestone ? (
          <div className="flex items-center justify-between gap-3">
            <span>마일스톤</span>
            <span className="font-medium text-foreground">{task.milestoneName}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <span>담당자</span>
          <span className="font-medium text-foreground">{task.assigneeName}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>우선순위</span>
          <span className="font-medium text-foreground">{getPriorityLabel(task.priority)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>기한</span>
          <span className="font-medium text-foreground">{formatListDueDate(task.dueDate)}</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-8 rounded-lg px-3 text-xs"
          onClick={(event) => {
            event.stopPropagation();
            onOpenReview();
          }}
        >
          검토 보기
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 rounded-lg px-3 text-xs"
          onClick={(event) => {
            event.stopPropagation();
            onSubmitReview();
          }}
        >
          상신
        </Button>
      </div>
    </button>
  );
}

function InlineStat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex min-w-[106px] items-center gap-3.5 pr-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/35 text-muted-foreground">{icon}</div>
      <div>
        <div className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">{label}</div>
        <div className="mt-1 text-xl font-semibold leading-none tracking-tight text-foreground">{value}</div>
      </div>
    </div>
  );
}

function SummaryBlock({
  label,
  value,
  tone = 'slate',
  icon,
}: {
  label: string;
  value: string;
  tone?: 'slate' | 'blue' | 'amber' | 'green';
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/[0.04] px-4 py-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-3">
        <StatusPill tone={tone}>{value}</StatusPill>
      </div>
    </div>
  );
}

function TaskEditableField({
  label,
  editing,
  onEdit,
  onCancel,
  onSave,
  view,
  children,
  disabled,
}: {
  label: string;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  view: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-border/70 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold tracking-[0.1em] text-muted-foreground">{label}</div>
        {editing ? (
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" className="h-8 rounded-md px-2 text-xs" onClick={onCancel} disabled={disabled}>
              취소
            </Button>
            <Button type="button" className="h-8 rounded-md px-3 text-xs" onClick={onSave} disabled={disabled}>
              저장
            </Button>
          </div>
        ) : (
          <Button type="button" variant="ghost" className="h-8 rounded-md px-2 text-xs" onClick={onEdit} disabled={disabled}>
            <Pencil size={14} />
            수정
          </Button>
        )}
      </div>
      <div className="mt-3">{editing ? children : view}</div>
    </section>
  );
}

function ScopeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-4 py-2 text-sm font-medium transition-all',
        active
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-[0_10px_24px_rgba(16,185,129,0.12)]'
          : 'border-transparent bg-background text-muted-foreground hover:border-border/70 hover:text-foreground',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function AssignmentModeCard({
  active,
  title,
  description,
  disabled,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'rounded-[22px] border px-4 py-4 text-left transition',
        active
          ? 'border-primary/35 bg-primary/[0.07] shadow-[0_14px_32px_rgba(37,99,235,0.08)]'
          : 'border-border/70 bg-background hover:border-primary/20 hover:bg-muted/10',
        disabled ? 'cursor-not-allowed opacity-45' : '',
      ].join(' ')}
    >
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="mt-2 text-xs leading-5 text-muted-foreground">{description}</div>
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
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

function toDateInputValue(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function formatDueDateShort(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.getMonth() + 1}/${date.getDate()} ${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`;
}

function getNextActionLabel(status: string, hasReview: boolean) {
  if (status === 'PENDING') return '업무 시작';
  if (status === 'IN_PROGRESS') return hasReview ? '검토 상신 준비' : '업무 설명 정리';
  if (status === 'IN_REVIEW') return '검토 결과 확인';
  return '후속 업무 검토';
}

function formatListDueDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.getMonth() + 1}/${date.getDate()}`;
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

function getMilestoneHealthLabel(health: 'AT_RISK' | 'ON_TRACK' | 'COMPLETE') {
  switch (health) {
    case 'AT_RISK':
      return '주의';
    case 'COMPLETE':
      return '완료';
    default:
      return '정상';
  }
}

function getReviewStatusLabel(status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED') {
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
      return 'green';
    case 'REJECTED':
      return 'rose';
    case 'CANCELLED':
      return 'slate';
    default:
      return 'amber';
  }
}
