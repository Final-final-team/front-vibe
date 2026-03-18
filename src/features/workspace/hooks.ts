import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appConfig } from '../../shared/config/app-config';
import { getCurrentActor } from '../../shared/lib/session';
import {
  assignProjectMemberRole,
  createProjectRole,
  createProject,
  fetchProjectAuditLogs,
  fetchPermissionCatalog,
  fetchProjectBootstrap,
  fetchProjectDetail,
  fetchProjectMembers,
  fetchProjectRoles,
  revokeProjectMemberRole,
  updateProjectRolePermissions,
} from './api';
import type {
  AuditLogItem,
  PermissionDefinition,
  ProjectDetail,
  ProjectMember,
  ProjectMilestone,
  ProjectRole,
  ProjectTaskMeta,
  WorkspaceProject,
} from './types';

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
      userId: 101,
      name: '김하늘',
      email: 'sky.kim@frontvibe.dev',
      team: 'Frontend Platform',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-admin'],
      lastActiveAt: '2026-03-18T08:18:00Z',
    },
    {
      id: 201,
      userId: 201,
      name: '박정민',
      email: 'jm.park@frontvibe.dev',
      team: 'Product Review',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-review-lead'],
      lastActiveAt: '2026-03-18T07:32:00Z',
    },
    {
      id: 202,
      userId: 202,
      name: '이서진',
      email: 'sj.lee@frontvibe.dev',
      team: 'PMO',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-observer'],
      lastActiveAt: '2026-03-17T22:10:00Z',
    },
    {
      id: 401,
      userId: 401,
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
      userId: 501,
      name: '정서윤',
      email: 'sy.jung@frontvibe.dev',
      team: 'Operations',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-admin-lite'],
      lastActiveAt: '2026-03-17T19:10:00Z',
    },
    {
      id: 502,
      userId: 502,
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
      userId: 601,
      name: '유다은',
      email: 'de.yu@frontvibe.dev',
      team: 'Product Discovery',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-lab-admin'],
      lastActiveAt: '2026-03-16T17:00:00Z',
    },
    {
      id: 602,
      userId: 602,
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
    key: 'TASK_ASSIGN',
    name: '업무 할당',
    category: '업무 운영',
    description: '업무 생성 이후 담당자를 본인 또는 다른 멤버로 지정합니다.',
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
      system: true,
      leaderRole: true,
      memberIds: [101],
      permissionKeys: [
        'PROJECT_MEMBER_INVITE',
        'PROJECT_MEMBER_ROLE_ASSIGN',
        'ROLE_MANAGE',
        'PERMISSION_BIND',
        'TASK_EDIT',
        'TASK_ASSIGN',
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
      system: true,
      leaderRole: true,
      memberIds: [201],
      permissionKeys: ['TASK_EDIT', 'TASK_ASSIGN', 'REVIEW_APPROVE', 'REVIEW_REJECT', 'AUDIT_LOG_VIEW'],
    },
    {
      id: 'role-observer',
      name: '옵저버',
      description: '읽기 전용으로 현황과 이력을 확인합니다.',
      color: '#0f766e',
      system: true,
      leaderRole: false,
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
      system: true,
      leaderRole: true,
      memberIds: [501],
      permissionKeys: ['PROJECT_MEMBER_INVITE', 'ROLE_MANAGE', 'TASK_EDIT', 'TASK_ASSIGN', 'AUDIT_LOG_VIEW'],
    },
    {
      id: 'role-operator-lite',
      name: '운영 담당',
      description: '운영 태스크 수행과 현황 점검을 담당합니다.',
      color: '#9333ea',
      system: true,
      leaderRole: false,
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
      system: true,
      leaderRole: true,
      memberIds: [601],
      permissionKeys: ['PROJECT_MEMBER_INVITE', 'ROLE_MANAGE', 'PERMISSION_BIND', 'TASK_EDIT', 'TASK_ASSIGN'],
    },
    {
      id: 'role-lab-editor',
      name: '에디터',
      description: '실험 과제를 작성하고 수정합니다.',
      color: '#ea580c',
      system: false,
      leaderRole: false,
      memberIds: [602],
      permissionKeys: ['TASK_EDIT'],
    },
  ],
};

const mockMilestonesByProject: Record<string, ProjectMilestone[]> = {
  '10': [
    {
      id: 'milestone-review-core',
      name: '검토 워크플로우 출시',
      summary: '상신, 승인, 반려, 취소 플로우를 end-to-end로 연결합니다.',
      dueDate: '2026-03-20T09:00:00Z',
      health: 'AT_RISK',
      taskIds: [10, 11],
    },
    {
      id: 'milestone-member-rbac',
      name: '프로젝트 멤버십 / RBAC 정리',
      summary: '초대 기반 온보딩과 역할-권한 매핑을 한 셸 안에서 보여줍니다.',
      dueDate: '2026-03-24T09:00:00Z',
      health: 'ON_TRACK',
      taskIds: [13, 14],
    },
    {
      id: 'milestone-artifacts',
      name: '산출물 업로드 경험 정리',
      summary: '첨부 업로드와 히스토리 조회 UX를 안정화합니다.',
      dueDate: '2026-03-15T09:00:00Z',
      health: 'COMPLETE',
      taskIds: [12],
    },
  ],
  '20': [
    {
      id: 'milestone-ops-template',
      name: '운영 템플릿 정규화',
      summary: '운영 역할과 작업 템플릿을 표준화합니다.',
      dueDate: '2026-03-28T09:00:00Z',
      health: 'ON_TRACK',
      taskIds: [20, 21],
    },
    {
      id: 'milestone-audit',
      name: '감사 로그 뷰 정리',
      summary: '운영 로그 노출 기준과 화면 패턴을 맞춥니다.',
      dueDate: '2026-03-30T09:00:00Z',
      health: 'AT_RISK',
      taskIds: [22],
    },
  ],
  '30': [
    {
      id: 'milestone-lab-discovery',
      name: '실험 과제 탐색',
      summary: '새 개선 아이디어를 모으고 우선순위를 실험적으로 정리합니다.',
      dueDate: '2026-04-02T09:00:00Z',
      health: 'ON_TRACK',
      taskIds: [],
    },
  ],
};

const mockTaskMetaByProject: Record<string, ProjectTaskMeta[]> = {
  '10': [
    {
      taskId: 10,
      projectId: '10',
      milestoneId: 'milestone-review-core',
      assigneeId: 101,
      assigneeName: '김하늘',
      domain: '검토 운영',
      priority: 'HIGHEST',
      dueDate: '2026-03-14T09:00:00Z',
    },
    {
      taskId: 11,
      projectId: '10',
      milestoneId: 'milestone-review-core',
      assigneeId: 201,
      assigneeName: '박정민',
      domain: '정책 관리',
      priority: 'HIGH',
      dueDate: '2026-03-18T09:00:00Z',
    },
    {
      taskId: 12,
      projectId: '10',
      milestoneId: 'milestone-artifacts',
      assigneeId: 301,
      assigneeName: '최민서',
      domain: '파일 관리',
      priority: 'MEDIUM',
      dueDate: '2026-03-12T09:00:00Z',
    },
    {
      taskId: 13,
      projectId: '10',
      milestoneId: 'milestone-member-rbac',
      assigneeId: 202,
      assigneeName: '이서진',
      domain: '멤버십',
      priority: 'HIGH',
      dueDate: '2026-03-19T09:00:00Z',
    },
    {
      taskId: 14,
      projectId: '10',
      milestoneId: 'milestone-member-rbac',
      assigneeId: 101,
      assigneeName: '김하늘',
      domain: '역할 정책',
      priority: 'LOWEST',
      dueDate: '2026-03-22T09:00:00Z',
    },
  ],
  '20': [
    {
      taskId: 20,
      projectId: '20',
      milestoneId: 'milestone-ops-template',
      assigneeId: 501,
      assigneeName: '정서윤',
      domain: '운영 템플릿',
      priority: 'HIGH',
      dueDate: '2026-03-21T09:00:00Z',
    },
    {
      taskId: 21,
      projectId: '20',
      milestoneId: 'milestone-ops-template',
      assigneeId: 502,
      assigneeName: '오현우',
      domain: '운영 보드',
      priority: 'MEDIUM',
      dueDate: '2026-03-23T09:00:00Z',
    },
    {
      taskId: 22,
      projectId: '20',
      milestoneId: 'milestone-audit',
      assigneeId: 501,
      assigneeName: '정서윤',
      domain: '변경 이력',
      priority: 'HIGH',
      dueDate: '2026-03-29T09:00:00Z',
    },
  ],
  '30': [],
};

const mockAuditLogsByProject: Record<string, AuditLogItem[]> = {
  '10': [
    {
      id: 'log-101',
      projectId: '10',
      occurredAt: '2026-03-17T01:10:00Z',
      actorName: '김하늘',
      actionLabel: '역할 정책 수정',
      targetLabel: '프로젝트 관리자',
      area: '역할 정책',
      summary: '검토 승인과 반려 권한 범위를 정리하고 역할 설명을 수정했습니다.',
    },
    {
      id: 'log-102',
      projectId: '10',
      occurredAt: '2026-03-16T08:40:00Z',
      actorName: '박정민',
      actionLabel: '검토 승인',
      targetLabel: '승인 큐 응답 시간 줄이기',
      area: '검토 운영',
      summary: '2차 검토 라운드를 승인하고 첨부 확인 메모를 남겼습니다.',
    },
  ],
  '20': [
    {
      id: 'log-201',
      projectId: '20',
      occurredAt: '2026-03-16T06:15:00Z',
      actorName: '정서윤',
      actionLabel: '운영 템플릿 수정',
      targetLabel: '주간 운영 점검 템플릿 정비',
      area: '운영 템플릿',
      summary: '주간 점검 항목과 에스컬레이션 기준을 최신 운영 규칙에 맞췄습니다.',
    },
  ],
  '30': [],
};

export const workspaceKeys = {
  bootstrap: ['workspace', 'bootstrap'] as const,
  projects: ['workspace', 'projects'] as const,
  projectDetail: (projectId: string) => ['workspace', projectId, 'detail'] as const,
  members: (projectId: string) => ['workspace', projectId, 'members'] as const,
  permissions: ['workspace', 'permissions'] as const,
  auditLogs: (projectId: string) => ['workspace', projectId, 'auditLogs'] as const,
  roles: (projectId: string) => ['workspace', projectId, 'roles'] as const,
  milestones: (projectId: string) => ['workspace', projectId, 'milestones'] as const,
  taskMeta: (projectId: string) => ['workspace', projectId, 'taskMeta'] as const,
};

export function useProjectBootstrap() {
  return useQuery({
    queryKey: workspaceKeys.bootstrap,
    queryFn: async () => {
      if (appConfig.useMock) {
        return {
          hasProject: true,
          defaultProjectId: mockWorkspaceProjects[0]?.id ?? String(appConfig.defaultProjectId),
          projects: mockWorkspaceProjects,
        };
      }

      return fetchProjectBootstrap();
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: workspaceKeys.projects,
    queryFn: async () => {
      if (appConfig.useMock) {
        return mockWorkspaceProjects;
      }

      const bootstrap = await fetchProjectBootstrap();
      return bootstrap.projects;
    },
  });
}

export { createProject };

export function useProjectDetail(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.projectDetail(projectId ?? 'none'),
    queryFn: async () => {
      if (!projectId) {
        return null;
      }

      if (appConfig.useMock) {
        const project = mockWorkspaceProjects.find((item) => item.id === projectId) ?? null;

        if (!project) {
          return null;
        }

        const actor = getCurrentActor();
        const members = mockMembersByProject[projectId] ?? [];
        const actorMember =
          members.find((member) => member.userId === actor.actorId)
          ?? members.find((member) => member.inviteStatus === 'ACTIVE')
          ?? null;

        return {
          projectId,
          projectMemberId: actorMember?.id ?? 0,
          myUserId: actorMember?.userId ?? actor.actorId,
          name: project.name,
          description: project.description,
          imageUrl: null,
          status: 'ACTIVE',
          membershipStatus: actorMember?.inviteStatus ?? 'ACTIVE',
          createdAt: project.updatedAt,
          updatedAt: project.updatedAt,
        } satisfies ProjectDetail;
      }

      return fetchProjectDetail(projectId);
    },
    enabled: Boolean(projectId),
  });
}

export function useProjectMembers(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.members(projectId ?? 'none'),
    queryFn: async () => {
      if (!projectId) {
        return [];
      }
      if (appConfig.useMock) {
        return mockMembersByProject[projectId] ?? [];
      }
      return fetchProjectMembers(projectId);
    },
    enabled: Boolean(projectId),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: workspaceKeys.permissions,
    queryFn: async () => {
      if (appConfig.useMock) {
        return mockPermissions;
      }
      return fetchPermissionCatalog();
    },
  });
}

export function useProjectAuditLogs(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.auditLogs(projectId ?? 'none'),
    queryFn: async () => {
      if (!projectId) {
        return [];
      }
      if (appConfig.useMock) {
        return mockAuditLogsByProject[projectId] ?? [];
      }
      return fetchProjectAuditLogs(projectId);
    },
    enabled: Boolean(projectId),
  });
}

export function useProjectRoles(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.roles(projectId ?? 'none'),
    queryFn: async () => {
      if (!projectId) {
        return [];
      }
      if (appConfig.useMock) {
        return mockRolesByProject[projectId] ?? [];
      }
      return fetchProjectRoles(projectId);
    },
    enabled: Boolean(projectId),
  });
}

export function useApplyProjectMemberRoles(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectMemberId,
      currentRoleIds,
      nextRoleIds,
    }: {
      projectMemberId: number;
      currentRoleIds: string[];
      nextRoleIds: string[];
    }) => {
      if (!projectId) {
        return;
      }

      const current = new Set(currentRoleIds);
      const next = new Set(nextRoleIds);

      const toAssign = nextRoleIds.filter((roleId) => !current.has(roleId));
      const toRevoke = currentRoleIds.filter((roleId) => !next.has(roleId));

      for (const roleId of toAssign) {
        await assignProjectMemberRole(projectId, projectMemberId, roleId);
      }
      for (const roleId of toRevoke) {
        await revokeProjectMemberRole(projectId, projectMemberId, roleId);
      }
    },
    onSuccess: async () => {
      if (!projectId) {
        return;
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workspaceKeys.members(projectId) }),
        queryClient.invalidateQueries({ queryKey: workspaceKeys.roles(projectId) }),
      ]);
    },
  });
}

export function useCreateProjectRole(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string; description: string }) => {
      if (!projectId) {
        throw new Error('projectId is required');
      }
      return createProjectRole(projectId, input);
    },
    onSuccess: async () => {
      if (!projectId) {
        return;
      }
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.roles(projectId) });
    },
  });
}

export function useUpdateProjectRolePermissions(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionKeys,
    }: {
      roleId: string;
      permissionKeys: string[];
    }) => {
      if (!projectId) {
        throw new Error('projectId is required');
      }
      return updateProjectRolePermissions(projectId, roleId, permissionKeys);
    },
    onSuccess: async () => {
      if (!projectId) {
        return;
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workspaceKeys.roles(projectId) }),
        queryClient.invalidateQueries({ queryKey: workspaceKeys.members(projectId) }),
      ]);
    },
  });
}

export function useProjectMilestones(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.milestones(projectId ?? 'none'),
    queryFn: async () => (projectId ? mockMilestonesByProject[projectId] ?? [] : []),
    enabled: Boolean(projectId),
  });
}

export function useProjectTaskMeta(projectId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.taskMeta(projectId ?? 'none'),
    queryFn: async () => (projectId ? mockTaskMetaByProject[projectId] ?? [] : []),
    enabled: Boolean(projectId),
  });
}
