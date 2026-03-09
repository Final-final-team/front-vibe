import { useState, type ReactNode } from 'react';
import { WorkspaceContext } from './context';
import { useProjects } from './hooks';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: projects = [] } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const currentProject =
    projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null;

  return (
    <WorkspaceContext.Provider
      value={{
        projects,
        selectedProjectId: currentProject?.id ?? null,
        setSelectedProjectId,
        currentProject,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
