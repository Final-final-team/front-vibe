import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoaderCircle, ShieldAlert } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { verifySession } from './api';

type Props = {
  children: ReactNode;
};

const authQueryKey = ['auth', 'session'] as const;

export default function AuthGate({ children }: Props) {
  const sessionQuery = useQuery({
    queryKey: authQueryKey,
    queryFn: verifySession,
    retry: false,
  });

  if (sessionQuery.isLoading) {
    return (
      <FullscreenShell>
        <GateNotice
          title="로그인 세션을 확인하는 중입니다"
          description="백엔드 인증 쿠키와 세션 상태를 점검하고 있습니다."
          tone="loading"
        />
      </FullscreenShell>
    );
  }

  if (sessionQuery.isError) {
    return (
      <FullscreenShell>
        <GateNotice
          title="인증 상태를 확인하지 못했습니다"
          description="백엔드와 통신할 수 없거나 인증 확인 요청이 실패했습니다. 서버 상태를 확인한 뒤 새로고침해 주세요."
          tone="warning"
        />
      </FullscreenShell>
    );
  }

  if (!sessionQuery.data?.authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function FullscreenShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_20%),linear-gradient(180deg,#f7f9fc_0%,#fbfcfe_100%)] px-6 py-12">
      {children}
    </div>
  );
}

function GateNotice({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: 'warning' | 'loading';
}) {
  return (
    <div className="mx-auto max-w-xl rounded-[28px] border border-border/70 bg-card px-8 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        {tone === 'loading' ? <LoaderCircle className="animate-spin" size={24} /> : <ShieldAlert size={24} />}
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}
