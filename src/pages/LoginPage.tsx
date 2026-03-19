import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { appConfig } from '../shared/config/app-config';
import BrandLockup from '../shared/ui/BrandLockup';

export default function LoginPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const defaultTarget = `/projects/${appConfig.defaultProjectId}/tasks`;
  const shouldPromptAccount = searchParams.get('loggedOut') === '1';
  const oauthTarget = shouldPromptAccount
    ? `${appConfig.authBaseUrl}/oauth2/authorization/google?prompt=select_account&max_age=0`
    : `${appConfig.authBaseUrl}/oauth2/authorization/google`;
  const hasAuthenticatedSession = queryClient.getQueryData<{ authenticated: boolean }>(['auth', 'session']);

  useEffect(() => {
    if (shouldPromptAccount) return;
    window.location.replace(oauthTarget);
  }, [oauthTarget, shouldPromptAccount]);

  if (hasAuthenticatedSession?.authenticated) {
    return <Navigate to={defaultTarget} replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#f7faff_50%,#ffffff_100%)] px-6 py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-7rem] h-[24rem] w-[24rem] rounded-full bg-sky-300/12 blur-3xl" />
        <div className="absolute right-[-5rem] top-[8rem] h-[18rem] w-[18rem] rounded-full bg-lime-200/12 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
        <section className="w-full rounded-[32px] border border-white/80 bg-white/90 px-8 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex justify-center">
            <BrandLockup className="justify-center" />
          </div>

          <div className="mt-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {shouldPromptAccount ? '다른 계정으로 다시 로그인' : '로그인'}
            </h1>
          </div>

          <Button asChild size="lg" className="mt-8 h-14 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
            <a href={oauthTarget}>
              <LogIn size={16} />
              로그인하기
            </a>
          </Button>
        </section>
      </div>
    </div>
  );
}
