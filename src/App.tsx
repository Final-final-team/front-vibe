import { Outlet } from 'react-router-dom';
import { WorkspaceProvider } from './features/workspace/provider';
import WorkspaceLayout from './shared/layout/WorkspaceLayout';

export default function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceLayout>
        <Outlet />
      </WorkspaceLayout>
    </WorkspaceProvider>
  );
}
