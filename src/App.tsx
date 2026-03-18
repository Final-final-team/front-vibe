import AuthGate from './features/auth/AuthGate';
import ConsentGate from './features/consent/ConsentGate';
import { Outlet } from 'react-router-dom';
import { WorkspaceProvider } from './features/workspace/provider';
import WorkspaceLayout from './shared/layout/WorkspaceLayout';

export default function App() {
  return (
    <AuthGate>
      <ConsentGate>
        <WorkspaceProvider>
          <WorkspaceLayout>
            <Outlet />
          </WorkspaceLayout>
        </WorkspaceProvider>
      </ConsentGate>
    </AuthGate>
  );
}
