import { createContext } from 'react';
import type { ProjectDetail, WorkspaceProject } from './types';

export type WorkspaceContextValue = {
  projects: WorkspaceProject[];
  selectedProjectId: string | null;
  setSelectedProjectId: (projectId: string) => void;
  currentProject: WorkspaceProject | null;
  currentProjectDetail: ProjectDetail | null;
  currentUserId: number | null;
};

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
