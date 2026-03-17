import { appConfig } from '../../shared/config/app-config';
import { backendRequest, toBackendApiError } from '../../shared/lib/http';
import { getMockTasks } from '../review/mock';
import type { TaskDetail, TaskPageResult, TaskStatus, TaskSummary } from './types';

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
      const task = getMockTasks().find((item) => item.id === taskId);

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
