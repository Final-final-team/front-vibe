import { useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { WorkspaceContext } from './context';
import { useProjectBootstrap, useProjectDetail, useProjects } from './hooks';
import { useProjectTasks } from '../tasks/hooks';
import { appConfig } from '../../shared/config/app-config';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data: projects = [] } = useProjects();
  const { data: bootstrap } = useProjectBootstrap();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    String(appConfig.defaultProjectId),
  );
  const routeProjectId = useMemo(() => {
    const match = location.pathname.match(/^\/projects\/([^/]+)/);
    return match?.[1] ?? null;
  }, [location.pathname]);
  const currentProjectId =
    routeProjectId
    ?? selectedProjectId
    ?? bootstrap?.defaultProjectId
    ?? projects[0]?.id
    ?? String(appConfig.defaultProjectId);
  const projectDetailQuery = useProjectDetail(currentProjectId);
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
  const currentProjectDetail = projectDetailQuery.data ?? null;
  const currentUserId = currentProjectDetail?.myUserId ?? null;

  return (
    <WorkspaceContext.Provider
      value={{
        projects,
        selectedProjectId: currentProject?.id ?? null,
        setSelectedProjectId,
        currentProject,
        currentProjectDetail,
        currentUserId,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
