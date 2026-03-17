import { useQuery } from '@tanstack/react-query';
import { appConfig } from '../../shared/config/app-config';
import { getProjectOnboardingDraft } from '../../shared/lib/project-onboarding';
import type { PermissionDefinition, ProjectMember, ProjectRole, WorkspaceProject } from './types';

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

const mockMembersByProject: Record<string, ProjectMember[]> = {
  '10': [
    {
      id: 101,
      name: '김하늘',
      email: 'sky.kim@frontvibe.dev',
      team: 'Frontend Platform',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-admin'],
      lastActiveAt: '2026-03-18T08:18:00Z',
    },
    {
      id: 201,
      name: '박정민',
      email: 'jm.park@frontvibe.dev',
      team: 'Product Review',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-review-lead'],
      lastActiveAt: '2026-03-18T07:32:00Z',
    },
    {
      id: 202,
      name: '이서진',
      email: 'sj.lee@frontvibe.dev',
      team: 'PMO',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-observer'],
      lastActiveAt: '2026-03-17T22:10:00Z',
    },
    {
      id: 401,
      name: '한유진',
      email: 'yj.han@frontvibe.dev',
      team: 'QA',
      inviteStatus: 'INVITED',
      roleIds: ['role-observer'],
      lastActiveAt: null,
    },
  ],
  '20': [
    {
      id: 501,
      name: '정서윤',
      email: 'sy.jung@frontvibe.dev',
      team: 'Operations',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-admin-lite'],
      lastActiveAt: '2026-03-17T19:10:00Z',
    },
    {
      id: 502,
      name: '오현우',
      email: 'hw.oh@frontvibe.dev',
      team: 'Infra',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-operator-lite'],
      lastActiveAt: '2026-03-17T13:00:00Z',
    },
  ],
  '30': [
    {
      id: 601,
      name: '유다은',
      email: 'de.yu@frontvibe.dev',
      team: 'Product Discovery',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-lab-admin'],
      lastActiveAt: '2026-03-16T17:00:00Z',
    },
    {
      id: 602,
      name: '최민서',
      email: 'ms.choi@frontvibe.dev',
      team: 'Design Ops',
      inviteStatus: 'INVITED',
      roleIds: ['role-lab-editor'],
      lastActiveAt: null,
    },
  ],
};

const mockPermissions: PermissionDefinition[] = [
  {
    key: 'PROJECT_MEMBER_INVITE',
    name: '멤버 초대',
    category: '멤버십',
    description: '프로젝트 참여 초대를 보내고 상태를 관리합니다.',
  },
  {
    key: 'PROJECT_MEMBER_ROLE_ASSIGN',
    name: '멤버 역할 할당',
    category: '멤버십',
    description: '프로젝트 멤버에게 역할을 연결합니다.',
  },
  {
    key: 'ROLE_MANAGE',
    name: '역할 정의 관리',
    category: '역할 정책',
    description: '역할 생성, 수정, 삭제를 수행합니다.',
  },
  {
    key: 'PERMISSION_BIND',
    name: '권한 바인딩',
    category: '역할 정책',
    description: '역할에 권한을 추가하거나 제거합니다.',
  },
  {
    key: 'TASK_EDIT',
    name: '업무 편집',
    category: '업무 운영',
    description: '업무 내용과 일정, 담당자를 수정합니다.',
  },
  {
    key: 'REVIEW_APPROVE',
    name: '검토 승인',
    category: '검토 운영',
    description: '상신된 검토를 승인합니다.',
  },
  {
    key: 'REVIEW_REJECT',
    name: '검토 반려',
    category: '검토 운영',
    description: '상신된 검토를 반려합니다.',
  },
  {
    key: 'AUDIT_LOG_VIEW',
    name: '감사 로그 조회',
    category: '감사 추적',
    description: '검토 이력과 변경 로그를 조회합니다.',
  },
];

const mockRolesByProject: Record<string, ProjectRole[]> = {
  '10': [
    {
      id: 'role-admin',
      name: '프로젝트 관리자',
      description: '멤버십, 역할, 검토 운영 전반을 관리합니다.',
      color: '#2563eb',
      memberIds: [101],
      permissionKeys: [
        'PROJECT_MEMBER_INVITE',
        'PROJECT_MEMBER_ROLE_ASSIGN',
        'ROLE_MANAGE',
        'PERMISSION_BIND',
        'TASK_EDIT',
        'REVIEW_APPROVE',
        'REVIEW_REJECT',
        'AUDIT_LOG_VIEW',
      ],
    },
    {
      id: 'role-review-lead',
      name: '검토 리드',
      description: '검토 승인/반려와 큐 운영을 담당합니다.',
      color: '#7c3aed',
      memberIds: [201],
      permissionKeys: ['TASK_EDIT', 'REVIEW_APPROVE', 'REVIEW_REJECT', 'AUDIT_LOG_VIEW'],
    },
    {
      id: 'role-observer',
      name: '옵저버',
      description: '읽기 전용으로 현황과 이력을 확인합니다.',
      color: '#0f766e',
      memberIds: [202, 401],
      permissionKeys: ['AUDIT_LOG_VIEW'],
    },
  ],
  '20': [
    {
      id: 'role-admin-lite',
      name: '운영 관리자',
      description: '운영 프로젝트 설정과 역할 구조를 관리합니다.',
      color: '#2563eb',
      memberIds: [501],
      permissionKeys: ['PROJECT_MEMBER_INVITE', 'ROLE_MANAGE', 'TASK_EDIT', 'AUDIT_LOG_VIEW'],
    },
    {
      id: 'role-operator-lite',
      name: '운영 담당',
      description: '운영 태스크 수행과 현황 점검을 담당합니다.',
      color: '#9333ea',
      memberIds: [502],
      permissionKeys: ['TASK_EDIT'],
    },
  ],
  '30': [
    {
      id: 'role-lab-admin',
      name: '랩 관리자',
      description: '실험 과제와 검토 흐름을 관리합니다.',
      color: '#1d4ed8',
      memberIds: [601],
      permissionKeys: ['PROJECT_MEMBER_INVITE', 'ROLE_MANAGE', 'PERMISSION_BIND', 'TASK_EDIT'],
    },
    {
      id: 'role-lab-editor',
      name: '에디터',
      description: '실험 과제를 작성하고 수정합니다.',
      color: '#ea580c',
      memberIds: [602],
      permissionKeys: ['TASK_EDIT'],
    },
  ],
};

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
    queryFn: async () => (projectId ? mockMembersByProject[projectId] ?? [] : []),
    enabled: Boolean(projectId),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: workspaceKeys.permissions,
    queryFn: async () => mockPermissions,
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
    queryFn: async () => (projectId ? mockRolesByProject[projectId] ?? [] : []),
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
