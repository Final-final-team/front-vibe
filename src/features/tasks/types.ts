import type { PriorityLevel } from '../workspace/types';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';

export type TaskSummary = {
  id: number;
  projectId: number;
  title: string;
  status: TaskStatus;
  priority: PriorityLevel;
  startDate: string | null;
  dueDate: string | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
};

export type TaskDetail = TaskSummary & {
  description: string;
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
