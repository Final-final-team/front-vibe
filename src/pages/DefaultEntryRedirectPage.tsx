import { Navigate } from 'react-router-dom';
import { hasCompletedProjectOnboarding } from '../shared/lib/project-onboarding';

export default function DefaultEntryRedirectPage() {
  return <Navigate to={hasCompletedProjectOnboarding() ? '/projects' : '/onboarding/project'} replace />;
}
