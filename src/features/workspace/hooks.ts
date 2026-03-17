import { useQuery } from '@tanstack/react-query';
import {
  getPermissions,
  getProjectAuditLogs,
  getProjectMembers,
  getProjectMilestones,
  getProjectRoles,
  getProjects,
  getProjectTaskMeta,
} from './mock';

export const workspaceKeys = {
  projects: ['workspace', 'projects'] as const,
  members: (projectId: string) => ['workspace', projectId, 'members'] as const,
  permissions: ['workspace', 'permissions'] as const,
  auditLogs: (projectId: string) => ['workspace', projectId, 'auditLogs'] as const,
  roles: (projectId: string) => ['workspace', projectId, 'roles'] as const,
  milestones: (projectId: string) => ['workspace', projectId, 'milestones'] as const,
  taskMeta: (projectId: string) => ['workspace', projectId, 'taskMeta'] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: workspaceKeys.projects,
    queryFn: getProjects,
  });
}

export function useProjectMembers(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.members(projectId ?? 'none'),
    queryFn: () => getProjectMembers(projectId ?? ''),
    enabled: Boolean(projectId),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: workspaceKeys.permissions,
    queryFn: getPermissions,
  });
}

export function useProjectAuditLogs(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.auditLogs(projectId ?? 'none'),
    queryFn: () => getProjectAuditLogs(projectId ?? ''),
    enabled: Boolean(projectId),
  });
}

export function useProjectRoles(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.roles(projectId ?? 'none'),
    queryFn: () => getProjectRoles(projectId ?? ''),
    enabled: Boolean(projectId),
  });
}

export function useProjectMilestones(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.milestones(projectId ?? 'none'),
    queryFn: () => getProjectMilestones(projectId ?? ''),
    enabled: Boolean(projectId),
  });
}

export function useProjectTaskMeta(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.taskMeta(projectId ?? 'none'),
    queryFn: () => getProjectTaskMeta(projectId ?? ''),
    enabled: Boolean(projectId),
  });
}
