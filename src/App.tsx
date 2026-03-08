import { Outlet } from 'react-router-dom';
import WorkspaceLayout from './shared/layout/WorkspaceLayout';

export default function App() {
  return (
    <WorkspaceLayout>
      <Outlet />
    </WorkspaceLayout>
  );
}
