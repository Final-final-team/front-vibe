import { createContext } from 'react';
import type { WorkspaceProject } from './types';

export type WorkspaceContextValue = {
  projects: WorkspaceProject[];
  selectedProjectId: string | null;
  setSelectedProjectId: (projectId: string) => void;
  currentProject: WorkspaceProject | null;
};

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
