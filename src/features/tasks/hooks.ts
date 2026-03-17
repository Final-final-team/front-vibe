import { useQuery } from '@tanstack/react-query';
import { appConfig } from '../../shared/config/app-config';
import { fetchProjectTasks, fetchTaskDetail } from './api';
import type { TaskStatus } from './types';

export const taskKeys = {
  lists: (projectId: number, statuses?: TaskStatus[]) =>
    ['projects', projectId, 'tasks', ...(statuses ?? [])] as const,
  detail: (projectId: number, taskId: number) => ['projects', projectId, 'tasks', taskId] as const,
};

export function useProjectTasks(projectId = appConfig.defaultProjectId, statuses?: TaskStatus[]) {
  return useQuery({
    queryKey: taskKeys.lists(projectId, statuses),
    queryFn: () => fetchProjectTasks(projectId, statuses),
  });
}

export function useTaskDetail(projectId: number, taskId: number, enabled = true) {
  return useQuery({
    queryKey: taskKeys.detail(projectId, taskId),
    queryFn: () => fetchTaskDetail(projectId, taskId),
    enabled,
  });
}
