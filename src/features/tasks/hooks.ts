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
  TaskDetail,
  TaskPageResult,
  TaskStatus,
  TaskSummary,
  TaskUpdateDateInput,
  TaskUpdatePriorityInput,
  TaskUpdateTextInput,
} from './types';
import type { ProjectMember, ProjectTaskMeta } from '../workspace/types';

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

function syncTaskCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: number,
  task: TaskDetail,
) {
  queryClient.setQueryData<TaskDetail>(taskKeys.detail(projectId, task.id), task);

  const targetPrefix = ['projects', projectId, 'tasks'] as const;
  const matchingQueries = queryClient.getQueriesData<TaskPageResult<TaskSummary>>({ queryKey: targetPrefix });

  matchingQueries.forEach(([queryKey, page]) => {
    if (!page) {
      return;
    }

    queryClient.setQueryData<TaskPageResult<TaskSummary>>(queryKey, {
      ...page,
      items: page.items.map((item) =>
        item.id === task.id
          ? {
              ...item,
              title: task.title,
              status: task.status,
              priority: task.priority,
              startDate: task.startDate,
              dueDate: task.dueDate,
              authorId: task.authorId,
              assignees: task.assignees,
              updatedAt: task.updatedAt,
            }
          : item,
      ),
    });
  });

  const projectIdKey = String(projectId);
  const memberOptions = queryClient.getQueryData<ProjectMember[]>(['workspace', projectIdKey, 'members']) ?? [];

  queryClient.setQueryData<ProjectTaskMeta[] | undefined>(['workspace', projectIdKey, 'taskMeta'], (current) =>
    current?.map((meta) =>
      meta.taskId === task.id
        ? {
            ...meta,
            assigneeId: task.assignees[0]?.userId ?? 0,
            assigneeName:
              task.assignees.length === 0
                ? '담당 없음'
                : task.assignees
                    .map((assignee) =>
                      memberOptions.find((member) => member.userId === assignee.userId)?.name ?? assignee.name,
                    )
                    .join(', '),
            priority: task.priority ?? meta.priority,
            dueDate: task.dueDate ?? meta.dueDate,
          }
        : meta,
    ),
  );
}

export function useAssignTask(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: number; input: TaskAssignInput }) =>
      assignTask(projectId, taskId, input),
    onSuccess: (task, variables) => {
      syncTaskCaches(queryClient, projectId, task);
      void queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] });
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(projectId, variables.taskId) });
    },
  });
}

export function useAssignTaskToMe(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId }: { taskId: number }) => assignTaskToMe(projectId, taskId),
    onSuccess: (task, variables) => {
      syncTaskCaches(queryClient, projectId, task);
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
    onSuccess: (task, variables) => {
      syncTaskCaches(queryClient, projectId, task);
      invalidateTask(queryClient, projectId, variables.taskId);
    },
  });
}

export function useUnassignTaskFromMe(projectId = appConfig.defaultProjectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId }: { taskId: number }) => unassignTaskFromMe(projectId, taskId),
    onSuccess: (task, variables) => {
      syncTaskCaches(queryClient, projectId, task);
      invalidateTask(queryClient, projectId, variables.taskId);
    },
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
