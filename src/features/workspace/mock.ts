import type {
  AuditLogItem,
  PermissionDefinition,
  ProjectMember,
  ProjectMilestone,
  ProjectRole,
  ProjectTaskMeta,
  WorkspaceProject,
} from './types';

const projects: WorkspaceProject[] = [
  {
    id: 'spark-console',
    name: 'Spark Console',
    code: 'SPRK',
    description: '검토 중심 협업 흐름과 업무 보드를 한 셸로 통합하는 내부 운영 프로젝트',
    ownerName: '김하늘',
    memberCount: 8,
    milestoneCount: 3,
    openTaskCount: 4,
    reviewQueueCount: 2,
    progress: 72,
    updatedAt: '2026-03-09T08:30:00Z',
  },
  {
    id: 'lighthouse-ops',
    name: 'Lighthouse Ops',
    code: 'LITE',
    description: '운영 팀의 권한 템플릿과 마일스톤 리듬을 표준화하는 후속 프로젝트',
    ownerName: '정서윤',
    memberCount: 5,
    milestoneCount: 2,
    openTaskCount: 3,
    reviewQueueCount: 1,
    progress: 41,
    updatedAt: '2026-03-08T04:15:00Z',
  },
];

const membersByProject: Record<string, ProjectMember[]> = {
  'spark-console': [
    {
      id: 101,
      name: '김하늘',
      email: 'sky.kim@frontvibe.dev',
      team: 'Frontend Platform',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-admin'],
      lastActiveAt: '2026-03-09T08:18:00Z',
    },
    {
      id: 201,
      name: '박정민',
      email: 'jm.park@frontvibe.dev',
      team: 'Product Review',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-review-lead'],
      lastActiveAt: '2026-03-09T07:32:00Z',
    },
    {
      id: 202,
      name: '이서진',
      email: 'sj.lee@frontvibe.dev',
      team: 'PMO',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-observer'],
      lastActiveAt: '2026-03-09T05:10:00Z',
    },
    {
      id: 301,
      name: '최민서',
      email: 'ms.choi@frontvibe.dev',
      team: 'Design Ops',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-reviewer'],
      lastActiveAt: '2026-03-08T23:45:00Z',
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
    {
      id: 402,
      name: '문태호',
      email: 'th.moon@frontvibe.dev',
      team: 'Security',
      inviteStatus: 'EXPIRED',
      roleIds: ['role-reviewer'],
      lastActiveAt: null,
    },
    {
      id: 403,
      name: '장예린',
      email: 'yr.jang@frontvibe.dev',
      team: 'Operations',
      inviteStatus: 'DECLINED',
      roleIds: ['role-observer'],
      lastActiveAt: null,
    },
  ],
  'lighthouse-ops': [
    {
      id: 501,
      name: '정서윤',
      email: 'sy.jung@frontvibe.dev',
      team: 'Operations',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-admin-lite'],
      lastActiveAt: '2026-03-08T04:10:00Z',
    },
    {
      id: 502,
      name: '오현우',
      email: 'hw.oh@frontvibe.dev',
      team: 'Infra',
      inviteStatus: 'ACTIVE',
      roleIds: ['role-operator-lite'],
      lastActiveAt: '2026-03-07T13:00:00Z',
    },
    {
      id: 503,
      name: '유다은',
      email: 'de.yu@frontvibe.dev',
      team: 'Support',
      inviteStatus: 'INVITED',
      roleIds: ['role-observer-lite'],
      lastActiveAt: null,
    },
  ],
};

const permissions: PermissionDefinition[] = [
  {
    key: 'PROJECT_MEMBER_INVITE',
    name: '멤버 초대',
    category: 'Membership',
    description: '프로젝트 참여 초대를 보내고 상태를 관리합니다.',
  },
  {
    key: 'PROJECT_MEMBER_ROLE_ASSIGN',
    name: '멤버 역할 할당',
    category: 'Membership',
    description: '프로젝트 멤버에게 역할을 연결합니다.',
  },
  {
    key: 'ROLE_MANAGE',
    name: '역할 정의 관리',
    category: 'RBAC',
    description: '역할 생성, 수정, 삭제를 수행합니다.',
  },
  {
    key: 'PERMISSION_BIND',
    name: '권한 바인딩',
    category: 'RBAC',
    description: '역할에 권한을 추가하거나 제거합니다.',
  },
  {
    key: 'MILESTONE_MANAGE',
    name: '마일스톤 관리',
    category: 'Delivery',
    description: '마일스톤 생성과 일정 조정을 수행합니다.',
  },
  {
    key: 'TASK_EDIT',
    name: '업무 편집',
    category: 'Delivery',
    description: '업무 내용과 일정, 담당자를 수정합니다.',
  },
  {
    key: 'REVIEW_SUBMIT',
    name: '검토 상신',
    category: 'Review',
    description: '업무를 검토 큐로 상신합니다.',
  },
  {
    key: 'REVIEW_APPROVE',
    name: '검토 승인',
    category: 'Review',
    description: '상신된 검토를 승인합니다.',
  },
  {
    key: 'REVIEW_REJECT',
    name: '검토 반려',
    category: 'Review',
    description: '상신된 검토를 반려하고 사유를 남깁니다.',
  },
  {
    key: 'REVIEW_ATTACHMENT_MANAGE',
    name: '검토 첨부 관리',
    category: 'Review',
    description: '상신 상태에서 첨부를 추가하거나 삭제합니다.',
  },
  {
    key: 'AUDIT_LOG_VIEW',
    name: '감사 로그 조회',
    category: 'Governance',
    description: '검토 이력과 변경 로그를 조회합니다.',
  },
];

const rolesByProject: Record<string, ProjectRole[]> = {
  'spark-console': [
    {
      id: 'role-admin',
      name: 'Project Admin',
      description: '프로젝트 전반의 멤버십과 권한, 검토 워크플로우를 운영합니다.',
      color: '#2563eb',
      memberIds: [101],
      permissionKeys: [
        'PROJECT_MEMBER_INVITE',
        'PROJECT_MEMBER_ROLE_ASSIGN',
        'ROLE_MANAGE',
        'PERMISSION_BIND',
        'MILESTONE_MANAGE',
        'TASK_EDIT',
        'REVIEW_SUBMIT',
        'REVIEW_APPROVE',
        'REVIEW_REJECT',
        'REVIEW_ATTACHMENT_MANAGE',
        'AUDIT_LOG_VIEW',
      ],
    },
    {
      id: 'role-review-lead',
      name: 'Review Lead',
      description: '검토 큐 우선순위와 최종 승인 라운드를 관리합니다.',
      color: '#7c3aed',
      memberIds: [201],
      permissionKeys: [
        'TASK_EDIT',
        'REVIEW_APPROVE',
        'REVIEW_REJECT',
        'REVIEW_ATTACHMENT_MANAGE',
        'AUDIT_LOG_VIEW',
      ],
    },
    {
      id: 'role-reviewer',
      name: 'Reviewer',
      description: '추가 검토자나 실무 검토자로 참여합니다.',
      color: '#db2777',
      memberIds: [301, 402],
      permissionKeys: ['REVIEW_SUBMIT', 'REVIEW_APPROVE', 'REVIEW_REJECT'],
    },
    {
      id: 'role-observer',
      name: 'Observer',
      description: '읽기 전용으로 검토 현황과 산출물을 확인합니다.',
      color: '#0f766e',
      memberIds: [202, 401, 403],
      permissionKeys: ['AUDIT_LOG_VIEW'],
    },
  ],
  'lighthouse-ops': [
    {
      id: 'role-admin-lite',
      name: 'Ops Admin',
      description: '운영 프로젝트 설정과 역할 구조를 관리합니다.',
      color: '#2563eb',
      memberIds: [501],
      permissionKeys: [
        'PROJECT_MEMBER_INVITE',
        'PROJECT_MEMBER_ROLE_ASSIGN',
        'ROLE_MANAGE',
        'PERMISSION_BIND',
        'MILESTONE_MANAGE',
        'TASK_EDIT',
        'AUDIT_LOG_VIEW',
      ],
    },
    {
      id: 'role-operator-lite',
      name: 'Operator',
      description: '운영 태스크를 수행하고 마일스톤 진척을 관리합니다.',
      color: '#9333ea',
      memberIds: [502],
      permissionKeys: ['TASK_EDIT', 'MILESTONE_MANAGE'],
    },
    {
      id: 'role-observer-lite',
      name: 'Observer',
      description: '운영 프로젝트 현황을 조회합니다.',
      color: '#0f766e',
      memberIds: [503],
      permissionKeys: ['AUDIT_LOG_VIEW'],
    },
  ],
};

const milestonesByProject: Record<string, ProjectMilestone[]> = {
  'spark-console': [
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
  'lighthouse-ops': [
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
};

const taskMetaByProject: Record<string, ProjectTaskMeta[]> = {
  'spark-console': [
    {
      taskId: 10,
      projectId: 'spark-console',
      milestoneId: 'milestone-review-core',
      assigneeId: 101,
      assigneeName: '김하늘',
      domain: '검토 운영',
      priority: 'HIGH',
      dueDate: '2026-03-14T09:00:00Z',
    },
    {
      taskId: 11,
      projectId: 'spark-console',
      milestoneId: 'milestone-review-core',
      assigneeId: 201,
      assigneeName: '박정민',
      domain: '정책 관리',
      priority: 'MEDIUM',
      dueDate: '2026-03-18T09:00:00Z',
    },
    {
      taskId: 12,
      projectId: 'spark-console',
      milestoneId: 'milestone-artifacts',
      assigneeId: 301,
      assigneeName: '최민서',
      domain: '파일 관리',
      priority: 'MEDIUM',
      dueDate: '2026-03-12T09:00:00Z',
    },
    {
      taskId: 13,
      projectId: 'spark-console',
      milestoneId: 'milestone-member-rbac',
      assigneeId: 202,
      assigneeName: '이서진',
      domain: '멤버십',
      priority: 'HIGH',
      dueDate: '2026-03-19T09:00:00Z',
    },
    {
      taskId: 14,
      projectId: 'spark-console',
      milestoneId: 'milestone-member-rbac',
      assigneeId: 101,
      assigneeName: '김하늘',
      domain: '역할 정책',
      priority: 'LOW',
      dueDate: '2026-03-22T09:00:00Z',
    },
  ],
  'lighthouse-ops': [
    {
      taskId: 20,
      projectId: 'lighthouse-ops',
      milestoneId: 'milestone-ops-template',
      assigneeId: 501,
      assigneeName: '정서윤',
      domain: '운영 템플릿',
      priority: 'HIGH',
      dueDate: '2026-03-21T09:00:00Z',
    },
    {
      taskId: 21,
      projectId: 'lighthouse-ops',
      milestoneId: 'milestone-ops-template',
      assigneeId: 502,
      assigneeName: '오현우',
      domain: '운영 보드',
      priority: 'MEDIUM',
      dueDate: '2026-03-23T09:00:00Z',
    },
    {
      taskId: 22,
      projectId: 'lighthouse-ops',
      milestoneId: 'milestone-audit',
      assigneeId: 501,
      assigneeName: '정서윤',
      domain: '변경 이력',
      priority: 'HIGH',
      dueDate: '2026-03-29T09:00:00Z',
    },
  ],
};

const auditLogsByProject: Record<string, AuditLogItem[]> = {
  'spark-console': [
    {
      id: 'log-101',
      projectId: 'spark-console',
      occurredAt: '2026-03-17T01:10:00Z',
      actorName: '김하늘',
      actionLabel: '역할 정책 수정',
      targetLabel: 'Project Admin',
      area: '역할 정책',
      summary: '검토 승인과 반려 권한 범위를 정리하고 역할 설명을 수정했습니다.',
    },
    {
      id: 'log-102',
      projectId: 'spark-console',
      occurredAt: '2026-03-16T08:40:00Z',
      actorName: '박정민',
      actionLabel: '검토 승인',
      targetLabel: '승인 큐 응답 시간 줄이기',
      area: '검토 운영',
      summary: '2차 검토 라운드를 승인하고 첨부 확인 메모를 남겼습니다.',
    },
    {
      id: 'log-103',
      projectId: 'spark-console',
      occurredAt: '2026-03-16T03:20:00Z',
      actorName: '이서진',
      actionLabel: '멤버 초대 재발송',
      targetLabel: '한유진',
      area: '멤버십',
      summary: '만료된 초대를 재발송하고 기본 역할을 Observer로 설정했습니다.',
    },
    {
      id: 'log-104',
      projectId: 'spark-console',
      occurredAt: '2026-03-15T10:05:00Z',
      actorName: '최민서',
      actionLabel: '첨부 버전 교체',
      targetLabel: '첨부 버전 관리 UX 개선',
      area: '파일 관리',
      summary: '검토 첨부 시안 파일을 최신 버전으로 교체했습니다.',
    },
  ],
  'lighthouse-ops': [
    {
      id: 'log-201',
      projectId: 'lighthouse-ops',
      occurredAt: '2026-03-16T06:15:00Z',
      actorName: '정서윤',
      actionLabel: '운영 템플릿 수정',
      targetLabel: '주간 운영 점검 템플릿 정비',
      area: '운영 템플릿',
      summary: '주간 점검 항목과 에스컬레이션 기준을 최신 운영 규칙에 맞췄습니다.',
    },
    {
      id: 'log-202',
      projectId: 'lighthouse-ops',
      occurredAt: '2026-03-15T11:25:00Z',
      actorName: '오현우',
      actionLabel: '운영 큐 정렬',
      targetLabel: '온콜 대응 큐 화면 정리',
      area: '운영 보드',
      summary: '긴급도 기준 정렬과 담당자 노출 순서를 조정했습니다.',
    },
  ],
};

export async function getProjects() {
  return projects;
}

export async function getProjectMembers(projectId: string) {
  return membersByProject[projectId] ?? [];
}

export async function getPermissions() {
  return permissions;
}

export async function getProjectRoles(projectId: string) {
  return rolesByProject[projectId] ?? [];
}

export async function getProjectMilestones(projectId: string) {
  return milestonesByProject[projectId] ?? [];
}

export async function getProjectTaskMeta(projectId: string) {
  return taskMetaByProject[projectId] ?? [];
}

export async function getProjectAuditLogs(projectId: string) {
  return auditLogsByProject[projectId] ?? [];
}
