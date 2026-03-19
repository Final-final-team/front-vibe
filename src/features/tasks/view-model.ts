import type { ReviewTask, TaskStatus } from '../review/types';
import type { PriorityLevel, ProjectMember, ProjectMilestone, ProjectTaskMeta } from '../workspace/types';

export type TaskViewItem = {
  id: number;
  title: string;
  summary: string;
  status: TaskStatus;
  creatorId: number;
  creatorName: string;
  assignees: Array<{ userId: number; name: string }>;
  assigneeId: number;
  assigneeName: string;
  priority: PriorityLevel;
  dueDate: string | null;
  startDate: string | null;
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
  members = [],
}: {
  tasks: ReviewTask[];
  taskMeta: ProjectTaskMeta[];
  milestones: ProjectMilestone[];
  members?: ProjectMember[];
}): TaskViewItem[] {
  const items: TaskViewItem[] = [];

  taskMeta.forEach((meta) => {
      const task = tasks.find((item) => item.id === meta.taskId);
      const milestone = milestones.find((item) => item.id === meta.milestoneId);

      if (!task || !milestone) {
        return;
      }

      const resolvedAssignees =
        task.assignees.length > 0
          ? task.assignees
          : meta.assigneeId > 0
            ? [{ userId: meta.assigneeId, name: meta.assigneeName }]
            : [];
      const primaryAssignee = resolvedAssignees[0] ?? null;

      items.push({
        id: meta.taskId,
        title: task.title,
        summary: task.summary,
        status: task.latestReviewStatus,
        creatorId: task.authorId,
        creatorName:
          members.find((member) => member.userId === task.authorId)?.name ??
          (task.authorId === 0 ? '작성자 정보 없음' : `작성자 #${task.authorId}`),
        assignees: resolvedAssignees,
        assigneeId: primaryAssignee?.userId ?? 0,
        assigneeName: resolvedAssignees.length > 0 ? resolvedAssignees.map((assignee) => assignee.name).join(', ') : '담당 없음',
        priority: task.priority ?? meta.priority,
        dueDate: task.dueDate || meta.dueDate,
        startDate: task.startDate || null,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        domain: meta.domain,
        milestoneId: meta.milestoneId,
        milestoneName: milestone.name,
        milestoneHealth: milestone.health,
        progress: getStatusProgress(task.latestReviewStatus),
      });
    });

  return items.sort((a, b) => getSortableTime(a.dueDate) - getSortableTime(b.dueDate));
}

export function groupTasksByStatus(items: TaskViewItem[]) {
  return {
    PENDING: items.filter((item) => item.status === 'PENDING'),
    IN_PROGRESS: items.filter((item) => item.status === 'IN_PROGRESS'),
    IN_REVIEW: items.filter((item) => item.status === 'IN_REVIEW'),
    COMPLETED: items.filter((item) => item.status === 'COMPLETED'),
  } as const;
}

export function getStatusLabel(status: TaskStatus) {
  switch (status) {
    case 'PENDING':
      return '대기';
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
    case 'PENDING':
      return 'blue' as const;
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

function getStatusProgress(status: TaskStatus) {
  switch (status) {
    case 'PENDING':
      return 12;
    case 'COMPLETED':
      return 100;
    case 'IN_REVIEW':
      return 72;
    default:
      return 36;
  }
}

function getSortableTime(value: string | null) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}
