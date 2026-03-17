import { appConfig } from '../../shared/config/app-config';
import { backendRequest, toBackendApiError } from '../../shared/lib/http';
import { getCurrentActor } from '../../shared/lib/session';
import { assignMockTask, createMockTask, getMockTasks } from '../review/mock';
import { getMockProjectIdForTask } from './mock-project';
import type { TaskAssignInput, TaskCreateInput, TaskDetail, TaskPageResult, TaskStatus, TaskSummary } from './types';

type BackendTaskSummary = {
  taskId: number;
  projectId: number;
  title: string;
  status: TaskStatus;
  priority: TaskSummary['priority'];
  startDate: string | null;
  dueDate: string | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
};

type BackendTaskDetail = BackendTaskSummary & {
  description: string;
};

function mapTaskSummary(task: BackendTaskSummary): TaskSummary {
  return {
    id: task.taskId,
    projectId: task.projectId,
    title: task.title,
    status: task.status,
    priority: task.priority,
    startDate: task.startDate,
    dueDate: task.dueDate,
    authorId: task.authorId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function mapTaskDetail(task: BackendTaskDetail): TaskDetail {
  return {
    ...mapTaskSummary(task),
    description: task.description,
  };
}

export async function fetchProjectTasks(
  projectId = appConfig.defaultProjectId,
  statuses?: TaskStatus[],
) {
  try {
    if (appConfig.useMock) {
      const items = getMockTasks()
        .filter((task) => getMockProjectIdForTask(task.id) === projectId)
        .map<TaskSummary>((task) => ({
          id: task.id,
          projectId,
          title: task.title,
          status: task.latestReviewStatus === 'IN_PROGRESS' ? 'IN_PROGRESS' : task.latestReviewStatus,
          priority: task.priority,
          startDate: task.startDate,
          dueDate: task.dueDate,
          authorId: task.authorId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        }))
        .filter((task) => !statuses?.length || statuses.includes(task.status));

      return {
        items,
        page: 0,
        size: items.length,
        totalElements: items.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      } satisfies TaskPageResult<TaskSummary>;
    }

    const searchParams = new URLSearchParams();

    statuses?.forEach((status) => searchParams.append('statuses', status));
    const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : '';
    const page = await backendRequest<TaskPageResult<BackendTaskSummary>>(
      `/api/projects/${projectId}/tasks${suffix}`,
    );

    return {
      ...page,
      items: page.items.map(mapTaskSummary),
    };
  } catch (error) {
    throw toBackendApiError(error);
  }
}

export async function fetchTaskDetail(projectId: number, taskId: number) {
  try {
    if (appConfig.useMock) {
      const task = getMockTasks().find(
        (item) => item.id === taskId && getMockProjectIdForTask(item.id) === projectId,
      );

      if (!task) {
        throw new Error('Task was not found.');
      }

      return {
        id: task.id,
        projectId,
        title: task.title,
        status: task.latestReviewStatus === 'IN_PROGRESS' ? 'IN_PROGRESS' : task.latestReviewStatus,
        priority: task.priority,
        startDate: task.startDate,
        dueDate: task.dueDate,
        authorId: task.authorId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        description: task.summary,
      } satisfies TaskDetail;
    }

    const task = await backendRequest<BackendTaskDetail>(
      `/api/projects/${projectId}/tasks/${taskId}`,
    );
    return mapTaskDetail(task);
  } catch (error) {
    throw toBackendApiError(error);
  }
}

export async function createTask(projectId: number, input: TaskCreateInput) {
  try {
    if (appConfig.useMock) {
      const actor = getCurrentActor();
      const task = await createMockTask({ projectId, authorId: actor.actorId, ...input });
      return {
        id: task.id,
        projectId,
        title: task.title,
        status: 'IN_PROGRESS' as const,
        priority: task.priority,
        startDate: task.startDate,
        dueDate: task.dueDate,
        authorId: task.authorId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        description: task.summary,
      } satisfies TaskDetail;
    }

    const created = await backendRequest<BackendTaskDetail>(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        startDate: input.startDate ? input.startDate.slice(0, 10) : null,
        dueDate: input.dueDate ? input.dueDate.slice(0, 10) : null,
        priority: input.priority,
      }),
    });

    return mapTaskDetail(created);
  } catch (error) {
    throw toBackendApiError(error);
  }
}

export async function assignTask(projectId: number, taskId: number, input: TaskAssignInput) {
  try {
    if (appConfig.useMock) {
      const task = await assignMockTask(taskId, input.userId);
      return {
        id: task.id,
        projectId,
        title: task.title,
        status: task.latestReviewStatus === 'IN_PROGRESS' ? 'IN_PROGRESS' : task.latestReviewStatus,
        priority: task.priority,
        startDate: task.startDate,
        dueDate: task.dueDate,
        authorId: task.authorId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        description: task.summary,
      } satisfies TaskDetail;
    }

    const updated = await backendRequest<BackendTaskDetail>(`/api/projects/${projectId}/tasks/${taskId}/assign`, {
      method: 'POST',
      body: JSON.stringify(input),
    });

    return mapTaskDetail(updated);
  } catch (error) {
    throw toBackendApiError(error);
  }
}

export async function assignTaskToMe(projectId: number, taskId: number) {
  try {
    if (appConfig.useMock) {
      const actor = getCurrentActor();
      const task = await assignMockTask(taskId, actor.actorId);
      return {
        id: task.id,
        projectId,
        title: task.title,
        status: task.latestReviewStatus === 'IN_PROGRESS' ? 'IN_PROGRESS' : task.latestReviewStatus,
        priority: task.priority,
        startDate: task.startDate,
        dueDate: task.dueDate,
        authorId: task.authorId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        description: task.summary,
      } satisfies TaskDetail;
    }

    const updated = await backendRequest<BackendTaskDetail>(`/api/projects/${projectId}/tasks/${taskId}/assign/me`, {
      method: 'POST',
    });

    return mapTaskDetail(updated);
  } catch (error) {
    throw toBackendApiError(error);
  }
}
