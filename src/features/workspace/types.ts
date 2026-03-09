export type InviteStatus = 'ACTIVE' | 'INVITED' | 'EXPIRED' | 'DECLINED';
export type MilestoneHealth = 'ON_TRACK' | 'AT_RISK' | 'COMPLETE';
export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type WorkspaceProject = {
  id: string;
  name: string;
  code: string;
  description: string;
  ownerName: string;
  memberCount: number;
  milestoneCount: number;
  openTaskCount: number;
  reviewQueueCount: number;
  progress: number;
  updatedAt: string;
};

export type ProjectMember = {
  id: number;
  name: string;
  email: string;
  team: string;
  inviteStatus: InviteStatus;
  roleIds: string[];
  lastActiveAt: string | null;
};

export type PermissionDefinition = {
  key: string;
  name: string;
  category: string;
  description: string;
};

export type ProjectRole = {
  id: string;
  name: string;
  description: string;
  color: string;
  memberIds: number[];
  permissionKeys: string[];
};

export type ProjectMilestone = {
  id: string;
  name: string;
  summary: string;
  dueDate: string;
  health: MilestoneHealth;
  taskIds: number[];
};

export type ProjectTaskMeta = {
  taskId: number;
  projectId: string;
  milestoneId: string;
  assigneeId: number;
  assigneeName: string;
  domain: string;
  priority: PriorityLevel;
  dueDate: string;
};
