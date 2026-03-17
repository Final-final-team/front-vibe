import { useQuery } from '@tanstack/react-query';
import { appConfig } from '../../shared/config/app-config';
import { getProjectOnboardingDraft } from '../../shared/lib/project-onboarding';
import type { WorkspaceProject } from './types';

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
    queryFn: async () => {
      const onboardingDraft = getProjectOnboardingDraft();

      return [
        {
          id: String(appConfig.defaultProjectId),
          name: onboardingDraft?.projectName || `프로젝트 ${appConfig.defaultProjectId}`,
          code: `PRJ-${appConfig.defaultProjectId}`,
          description:
            onboardingDraft?.projectSummary || '백엔드 task/review API 기준으로 연결된 기본 프로젝트',
          ownerName: '백엔드 기준 연동',
          memberCount: 0,
          milestoneCount: 0,
          openTaskCount: 0,
          reviewQueueCount: 0,
          progress: 0,
          updatedAt: onboardingDraft?.completedAt ?? new Date().toISOString(),
        } satisfies WorkspaceProject,
      ];
    },
  });
}

export function useProjectMembers(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.members(projectId ?? 'none'),
    queryFn: async () => [],
    enabled: Boolean(projectId),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: workspaceKeys.permissions,
    queryFn: async () => [],
  });
}

export function useProjectAuditLogs(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.auditLogs(projectId ?? 'none'),
    queryFn: async () => [],
    enabled: Boolean(projectId),
  });
}

export function useProjectRoles(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.roles(projectId ?? 'none'),
    queryFn: async () => [],
    enabled: Boolean(projectId),
  });
}

export function useProjectMilestones(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.milestones(projectId ?? 'none'),
    queryFn: async () => [],
    enabled: Boolean(projectId),
  });
}

export function useProjectTaskMeta(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.taskMeta(projectId ?? 'none'),
    queryFn: async () => [],
    enabled: Boolean(projectId),
  });
}
