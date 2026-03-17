import { LoaderCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useProjectBootstrap } from '../features/workspace/hooks';
import { appConfig } from '../shared/config/app-config';

export default function DefaultEntryRedirectPage() {
  const bootstrapQuery = useProjectBootstrap();

  if (appConfig.useMock) {
    return <Navigate to="/projects" replace />;
  }

  if (bootstrapQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <LoaderCircle className="animate-spin" size={20} />
      </div>
    );
  }

  if (!bootstrapQuery.data?.hasProject) {
    return <Navigate to="/onboarding/project" replace />;
  }

  return <Navigate to="/projects" replace />;
}
