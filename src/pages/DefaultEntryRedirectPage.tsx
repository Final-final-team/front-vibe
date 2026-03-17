import { Navigate } from 'react-router-dom';
import { appConfig } from '../shared/config/app-config';
import { hasCompletedProjectOnboarding } from '../shared/lib/project-onboarding';

const defaultProjectPath = `/projects/${appConfig.defaultProjectId}`;

export default function DefaultEntryRedirectPage() {
  return <Navigate to={hasCompletedProjectOnboarding() ? `${defaultProjectPath}/tasks` : '/onboarding/project'} replace />;
}
