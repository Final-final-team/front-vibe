import { useQuery } from '@tanstack/react-query';
import { appConfig } from '../../shared/config/app-config';
import { getProjectOnboardingDraft } from '../../shared/lib/project-onboarding';
import type { WorkspaceProject } from './types';

const mockWorkspaceProjects: WorkspaceProject[] = [
  {
    id: String(appConfig.defaultProjectId),
    name: '운영 자동화 허브',
    code: `PRJ-${appConfig.defaultProjectId}`,
    description: '리뷰와 업무를 함께 관리하는 메인 프로젝트입니다.',
    ownerName: '플랫폼 운영',
    memberCount: 8,
    milestoneCount: 3,
    openTaskCount: 6,
    reviewQueueCount: 2,
    progress: 54,
    updatedAt: '2026-03-18T09:00:00Z',
  },
  {
    id: '20',
    name: '정책 정비 보드',
    code: 'PRJ-20',
    description: '권한 정책, 승인 흐름, 운영 규칙 문서를 정리하는 프로젝트입니다.',
    ownerName: '정책 관리',
    memberCount: 5,
    milestoneCount: 2,
    openTaskCount: 4,
    reviewQueueCount: 1,
    progress: 38,
    updatedAt: '2026-03-17T14:30:00Z',
  },
  {
    id: '30',
    name: '서비스 개선 랩',
    code: 'PRJ-30',
    description: '실험적인 개선안과 UX 개선 이슈를 모아 검토하는 프로젝트입니다.',
    ownerName: '제품 개선',
    memberCount: 6,
    milestoneCount: 4,
    openTaskCount: 7,
    reviewQueueCount: 3,
    progress: 72,
    updatedAt: '2026-03-16T18:20:00Z',
  },
];

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

      if (appConfig.useMock) {
        return mockWorkspaceProjects.map((project, index) =>
          index === 0 && onboardingDraft
            ? {
                ...project,
                name: onboardingDraft.projectName,
                description: onboardingDraft.projectSummary || project.description,
                updatedAt: onboardingDraft.completedAt,
              }
            : project,
        );
      }

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
