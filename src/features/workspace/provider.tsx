import { useState, type ReactNode } from 'react';
import { WorkspaceContext } from './context';
import { useProjects } from './hooks';
import { useProjectTasks } from '../tasks/hooks';
import { appConfig } from '../../shared/config/app-config';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: projects = [] } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    String(appConfig.defaultProjectId),
  );
  const currentProjectId = selectedProjectId ?? String(appConfig.defaultProjectId);
  const tasksQuery = useProjectTasks(Number(currentProjectId));

  const baseProject =
    projects.find((project) => project.id === currentProjectId) ?? projects[0] ?? null;
  const tasks = tasksQuery.data?.items ?? [];
  const openTaskCount = tasks.filter((task) => task.status !== 'COMPLETED').length;
  const reviewQueueCount = tasks.filter((task) => task.status === 'IN_REVIEW').length;
  const progress = tasks.length > 0
    ? Math.round((tasks.filter((task) => task.status === 'COMPLETED').length / tasks.length) * 100)
    : 0;

  const currentProject = baseProject
    ? {
        ...baseProject,
        openTaskCount,
        reviewQueueCount,
        progress,
        updatedAt: tasks[0]?.updatedAt ?? baseProject.updatedAt,
      }
    : null;

  return (
    <WorkspaceContext.Provider
      value={{
        projects,
        selectedProjectId: currentProject?.id ?? null,
        setSelectedProjectId,
        currentProject,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
