import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appConfig } from '../../shared/config/app-config';
import {
  assignTask,
  assignTaskToMe,
  cancelTaskStart,
  createTask,
  fetchProjectTasks,
  fetchTaskDetail,
  forceCompleteTask,
  startTask,
  unassignTask,
  unassignTaskFromMe,
  updateTaskDescription,
  updateTaskDueDate,
  updateTaskPriority,
  updateTaskStartDate,
  updateTaskTitle,
} from './api';
import type {
  TaskAssignInput,
  TaskCreateInput,
  TaskStatus,
  TaskUpdateDateInput,
  TaskUpdatePriorityInput,
  TaskUpdateTextInput,
} from './types';

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

export function useCreateTask(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TaskCreateInput) => createTask(projectId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
    },
  });
}

export function useAssignTask(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: number; input: TaskAssignInput }) =>
      assignTask(projectId, taskId, input),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(projectId, variables.taskId) });
    },
  });
}

export function useAssignTaskToMe(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId }: { taskId: number }) => assignTaskToMe(projectId, taskId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(projectId, variables.taskId) });
    },
  });
}

function invalidateTask(queryClient: ReturnType<typeof useQueryClient>, projectId: number, taskId: number) {
  void queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
  void queryClient.invalidateQueries({ queryKey: taskKeys.detail(projectId, taskId) });
}

export function useUpdateTaskTitle(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: number; input: TaskUpdateTextInput }) =>
      updateTaskTitle(projectId, taskId, input),
    onSuccess: (_, variables) => invalidateTask(queryClient, projectId, variables.taskId),
  });
}

export function useUpdateTaskDescription(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: number; input: TaskUpdateTextInput }) =>
      updateTaskDescription(projectId, taskId, input),
    onSuccess: (_, variables) => invalidateTask(queryClient, projectId, variables.taskId),
  });
}

export function useUpdateTaskStartDate(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: number; input: TaskUpdateDateInput }) =>
      updateTaskStartDate(projectId, taskId, input),
    onSuccess: (_, variables) => invalidateTask(queryClient, projectId, variables.taskId),
  });
}

export function useUpdateTaskDueDate(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: number; input: TaskUpdateDateInput }) =>
      updateTaskDueDate(projectId, taskId, input),
    onSuccess: (_, variables) => invalidateTask(queryClient, projectId, variables.taskId),
  });
}

export function useUpdateTaskPriority(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: number; input: TaskUpdatePriorityInput }) =>
      updateTaskPriority(projectId, taskId, input),
    onSuccess: (_, variables) => invalidateTask(queryClient, projectId, variables.taskId),
  });
}

export function useUnassignTask(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId }: { taskId: number }) => unassignTask(projectId, taskId),
    onSuccess: (_, variables) => invalidateTask(queryClient, projectId, variables.taskId),
  });
}

export function useUnassignTaskFromMe(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId }: { taskId: number }) => unassignTaskFromMe(projectId, taskId),
    onSuccess: (_, variables) => invalidateTask(queryClient, projectId, variables.taskId),
  });
}

export function useStartTask(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId }: { taskId: number }) => startTask(projectId, taskId),
    onSuccess: (_, variables) => invalidateTask(queryClient, projectId, variables.taskId),
  });
}

export function useCancelTaskStart(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId }: { taskId: number }) => cancelTaskStart(projectId, taskId),
    onSuccess: (_, variables) => invalidateTask(queryClient, projectId, variables.taskId),
  });
}

export function useForceCompleteTask(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId }: { taskId: number }) => forceCompleteTask(projectId, taskId),
    onSuccess: (_, variables) => invalidateTask(queryClient, projectId, variables.taskId),
  });
}
