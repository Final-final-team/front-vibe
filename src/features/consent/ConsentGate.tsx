import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { appConfig } from '../../shared/config/app-config';
import { fetchRequiredConsentCheck } from './api';
import RequiredConsentModal from './RequiredConsentModal';

type Props = {
  children: ReactNode;
};

export const consentKeys = {
  all: ['consents'] as const,
  statuses: ['consents', 'statuses'] as const,
  required: ['consents', 'required-check'] as const,
};

export default function ConsentGate({ children }: Props) {
  const enabled = !appConfig.useMock;
  const requiredCheckQuery = useQuery({
    queryKey: consentKeys.required,
    queryFn: fetchRequiredConsentCheck,
    enabled,
    retry: false,
  });

  if (appConfig.useMock) {
    return <>{children}</>;
  }

  if (requiredCheckQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <LoaderCircle className="animate-spin" size={20} />
      </div>
    );
  }

  if (requiredCheckQuery.isError) {
    return <>{children}</>;
  }

  const satisfied = requiredCheckQuery.data?.requiredConsentsSatisfied ?? true;

  return (
    <>
      {children}
      {!satisfied ? <RequiredConsentModal open /> : null}
    </>
  );
}
