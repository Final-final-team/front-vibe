import type { ReviewTask, TaskStatus } from '../review/types';
import type { PriorityLevel, ProjectMilestone, ProjectTaskMeta } from '../workspace/types';

export type TaskViewItem = {
  id: number;
  title: string;
  summary: string;
  status: TaskStatus;
  assigneeId: number;
  assigneeName: string;
  priority: PriorityLevel;
  dueDate: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  domain: string;
  milestoneId: string;
  milestoneName: string;
  milestoneHealth: ProjectMilestone['health'];
  progress: number;
};

export function buildTaskViewItems({
  tasks,
  taskMeta,
  milestones,
}: {
  tasks: ReviewTask[];
  taskMeta: ProjectTaskMeta[];
  milestones: ProjectMilestone[];
}): TaskViewItem[] {
  return taskMeta
    .map((meta) => {
      const task = tasks.find((item) => item.id === meta.taskId);
      const milestone = milestones.find((item) => item.id === meta.milestoneId);

      if (!task || !milestone) {
        return null;
      }

      return {
        id: meta.taskId,
        title: task.title,
        summary: task.summary,
        status: task.latestReviewStatus,
        assigneeId: meta.assigneeId,
        assigneeName: meta.assigneeName,
        priority: task.priority ?? meta.priority,
        dueDate: task.dueDate || meta.dueDate,
        startDate: task.startDate || deriveStartDate(task.dueDate || meta.dueDate, task.priority ?? meta.priority),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        domain: meta.domain,
        milestoneId: meta.milestoneId,
        milestoneName: milestone.name,
        milestoneHealth: milestone.health,
        progress: getStatusProgress(task.latestReviewStatus),
      } satisfies TaskViewItem;
    })
    .filter((item): item is TaskViewItem => item !== null)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export function groupTasksByStatus(items: TaskViewItem[]) {
  return {
    IN_PROGRESS: items.filter((item) => item.status === 'IN_PROGRESS'),
    IN_REVIEW: items.filter((item) => item.status === 'IN_REVIEW'),
    COMPLETED: items.filter((item) => item.status === 'COMPLETED'),
  } as const;
}

export function getStatusLabel(status: TaskStatus) {
  switch (status) {
    case 'COMPLETED':
      return '완료';
    case 'IN_REVIEW':
      return '검토중';
    default:
      return '진행중';
  }
}

export function getStatusTone(status: TaskStatus) {
  switch (status) {
    case 'COMPLETED':
      return 'green' as const;
    case 'IN_REVIEW':
      return 'amber' as const;
    default:
      return 'slate' as const;
  }
}

export function getPriorityLabel(priority: PriorityLevel) {
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

export function getPriorityTone(priority: PriorityLevel) {
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

function deriveStartDate(dueDate: string, priority: PriorityLevel) {
  const date = new Date(dueDate);
  const offsetDays =
    priority === 'HIGHEST'
      ? 7
      : priority === 'HIGH'
        ? 5
        : priority === 'MEDIUM'
          ? 3
          : priority === 'LOW'
            ? 2
            : 1;
  date.setDate(date.getDate() - offsetDays);
  return date.toISOString();
}

function getStatusProgress(status: TaskStatus) {
  switch (status) {
    case 'COMPLETED':
      return 100;
    case 'IN_REVIEW':
      return 72;
    default:
      return 36;
  }
}
