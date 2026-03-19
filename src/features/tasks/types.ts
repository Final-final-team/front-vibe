import type { PriorityLevel } from '../workspace/types';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';

export type TaskAssignee = {
  userId: number;
  name: string;
};

export type TaskSummary = {
  id: number;
  projectId: number;
  title: string;
  status: TaskStatus;
  priority: PriorityLevel;
  startDate: string | null;
  dueDate: string | null;
  authorId: number;
  assignees: TaskAssignee[];
  createdAt: string;
  updatedAt: string;
};

export type TaskDetail = TaskSummary & {
  description: string;
};

export type TaskCreateInput = {
  title: string;
  description: string;
  startDate: string | null;
  dueDate: string | null;
  priority: PriorityLevel;
};

export type TaskAssignInput = {
  userId: number;
};

export type TaskUpdateTextInput = {
  value: string;
};

export type TaskUpdateDateInput = {
  date: string | null;
};

export type TaskUpdatePriorityInput = {
  priority: PriorityLevel;
};

export type TaskPageResult<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};
