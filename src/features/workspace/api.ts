import { backendRequest } from '../../shared/lib/http';
import type { PermissionDefinition, ProjectDetail, ProjectMember, ProjectRole, WorkspaceProject } from './types';
import type { AuditLogItem } from './types';

type BackendProjectSummary = {
  projectId: number;
  projectMemberId: number;
  name: string;
  code: string;
  description: string | null;
  ownerName: string;
  memberCount: number;
  milestoneCount: number;
  openTaskCount: number;
  reviewQueueCount: number;
  progress: number;
  imageUrl: string | null;
  status: string;
  updatedAt: string;
  createdAt: string;
};

type BackendProjectBootstrap = {
  hasProject: boolean;
  defaultProjectId: number | null;
  projects: BackendProjectSummary[];
};

type BackendProjectDetail = {
  projectId: number;
  projectMemberId: number;
  myUserId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  membershipStatus: string;
  createdAt: string;
  updatedAt: string;
};

type CreateProjectInput = {
  name: string;
  description: string;
};

type CreateProjectResponse = {
  projectId: number;
  projectMemberId: number;
  myUserId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  membershipStatus: string;
  createdAt: string;
  updatedAt: string;
};

type BackendProjectMemberRole = {
  roleId: number;
  roleCode: string;
  roleName: string;
  roleDescription: string | null;
};

type BackendProjectMemberWithRoles = {
  member: {
    projectMemberId: number;
    projectId: number;
    userId: number;
    nickname: string | null;
    email: string | null;
    status: string;
  };
  roles: BackendProjectMemberRole[];
};

type BackendProjectRole = {
  roleId: number;
  code: string;
  name: string;
  description: string | null;
  system: boolean;
  leaderRole: boolean;
  memberIds: number[];
  permissionKeys: string[];
};

const ROLE_COLOR_PALETTE = ['#2563eb', '#7c3aed', '#0f766e', '#d97706', '#db2777', '#0ea5e9', '#16a34a'];

function toWorkspaceProject(project: BackendProjectSummary): WorkspaceProject {
  return {
    id: String(project.projectId),
    name: project.name,
    code: project.code,
    description: project.description ?? '',
    ownerName: project.ownerName,
    memberCount: project.memberCount,
    milestoneCount: project.milestoneCount,
    openTaskCount: project.openTaskCount,
    reviewQueueCount: project.reviewQueueCount,
    progress: project.progress,
    updatedAt: project.updatedAt,
  };
}

function colorForRole(roleId: number) {
  return ROLE_COLOR_PALETTE[roleId % ROLE_COLOR_PALETTE.length];
}

function toProjectDetail(project: BackendProjectDetail): ProjectDetail {
  return {
    projectId: String(project.projectId),
    projectMemberId: project.projectMemberId,
    myUserId: project.myUserId,
    name: project.name,
    description: project.description ?? '',
    imageUrl: project.imageUrl,
    status: project.status,
    membershipStatus: project.membershipStatus,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export async function fetchProjectBootstrap() {
  const result = await backendRequest<BackendProjectBootstrap>('/api/projects/bootstrap');
  return {
    hasProject: result.hasProject,
    defaultProjectId: result.defaultProjectId ? String(result.defaultProjectId) : null,
    projects: result.projects.map(toWorkspaceProject),
  };
}

export async function createProject(input: CreateProjectInput) {
  const result = await backendRequest<CreateProjectResponse>('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      description: input.description,
    }),
  });

  return {
    projectId: String(result.projectId),
  };
}

export async function fetchProjectDetail(projectId: string) {
  const result = await backendRequest<BackendProjectDetail>(`/api/projects/${projectId}`);
  return toProjectDetail(result);
}

export async function fetchProjectMembers(projectId: string) {
  const result = await backendRequest<BackendProjectMemberWithRoles[]>(`/api/projects/${projectId}/members/with-roles`);
  return result.map<ProjectMember>((item) => ({
    id: item.member.projectMemberId,
    userId: item.member.userId,
    name: item.member.nickname ?? `사용자 ${item.member.userId}`,
    email: item.member.email ?? `user-${item.member.userId}@unknown.local`,
    team: '-',
    inviteStatus: item.member.status === 'ACTIVE' ? 'ACTIVE' : 'INVITED',
    roleIds: item.roles.map((role) => String(role.roleId)),
    lastActiveAt: null,
  }));
}

export async function fetchProjectRoles(projectId: string) {
  const result = await backendRequest<BackendProjectRole[]>(`/api/projects/${projectId}/roles`);
  return result.map<ProjectRole>((role) => ({
    id: String(role.roleId),
    name: role.name,
    description: role.description ?? role.code,
    color: colorForRole(role.roleId),
    system: role.system,
    leaderRole: role.leaderRole,
    memberIds: role.memberIds,
    permissionKeys: role.permissionKeys,
  }));
}

export async function fetchPermissionCatalog() {
  return backendRequest<PermissionDefinition[]>('/api/permissions/catalog');
}

type BackendProjectAuditLog = {
  id: string;
  projectId: number;
  occurredAt: string;
  actorName: string;
  actionLabel: string;
  targetLabel: string;
  area: string;
  summary: string;
};

export async function fetchProjectAuditLogs(projectId: string) {
  const result = await backendRequest<BackendProjectAuditLog[]>(`/api/projects/${projectId}/audit-logs`);
  return result.map<AuditLogItem>((item) => ({
    id: item.id,
    projectId: String(item.projectId),
    occurredAt: item.occurredAt,
    actorName: item.actorName,
    actionLabel: item.actionLabel,
    targetLabel: item.targetLabel,
    area: item.area,
    summary: item.summary,
  }));
}

export async function assignProjectMemberRole(projectId: string, projectMemberId: number, roleId: string) {
  await backendRequest(`/api/projects/${projectId}/members/${projectMemberId}/roles/${roleId}`, {
    method: 'POST',
  });
}

export async function revokeProjectMemberRole(projectId: string, projectMemberId: number, roleId: string) {
  await backendRequest(`/api/projects/${projectId}/members/${projectMemberId}/roles/${roleId}`, {
    method: 'DELETE',
  });
}

export async function createProjectRole(
  projectId: string,
  input: {
    name: string;
    description: string;
  },
) {
  return backendRequest<BackendProjectRole>(`/api/projects/${projectId}/roles`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateProjectRolePermissions(projectId: string, roleId: string, permissionKeys: string[]) {
  return backendRequest<BackendProjectRole>(`/api/projects/${projectId}/roles/${roleId}/permissions`, {
    method: 'PATCH',
    body: JSON.stringify({ permissionKeys }),
  });
}
