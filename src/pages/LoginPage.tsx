import { ArrowRight, LoaderCircle, LogIn, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { appConfig } from '../shared/config/app-config';
import { useQueryClient } from '@tanstack/react-query';

export default function LoginPage() {
  const queryClient = useQueryClient();
  const defaultTarget = `/projects/${appConfig.defaultProjectId}/tasks`;
  const oauthTarget = `${appConfig.authBaseUrl}/oauth2/authorization/google`;
  const hasAuthenticatedSession = queryClient.getQueryData<{ authenticated: boolean }>(['auth', 'session']);

  useEffect(() => {
    window.location.replace(oauthTarget);
  }, [oauthTarget]);

  if (hasAuthenticatedSession?.authenticated) {
    return <Navigate to={defaultTarget} replace />;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#eef5ff_0%,#f8fbff_38%,#fffdf8_100%)] px-6 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-[22rem] w-[22rem] rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute right-[-6rem] top-[8rem] h-[18rem] w-[18rem] rounded-full bg-amber-200/25 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[18%] h-[20rem] w-[20rem] rounded-full bg-cyan-200/20 blur-3xl" />
      </div>
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative rounded-[36px] border border-white/70 bg-[linear-gradient(155deg,rgba(255,255,255,0.92),rgba(240,247,255,0.88))] px-8 py-10 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur">
          <Badge className="rounded-full bg-sky-500/10 px-3 py-1 text-sky-700 hover:bg-sky-500/10">OAuth Redirect</Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground">Google 로그인으로 바로 이동합니다</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            현재 백엔드 인증 계약은 Google OAuth를 기준으로 동작합니다. 이 화면은 잠깐만 보이고, 곧바로 Google 로그인으로 이동합니다.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <InfoCard title="인증 방식" description="Google OAuth 성공 후 쿠키 세션을 발급받습니다." />
            <InfoCard title="프로젝트 가정" description="초대 플로우 없이, 로그인한 사용자가 이미 하나의 프로젝트 멤버라고 가정합니다." />
            <InfoCard title="진입 화면" description="로그인 성공 후 기본 프로젝트의 업무 목록으로 바로 이동합니다." />
          </div>

          <div className="mt-8 rounded-[28px] border border-white/70 bg-white/70 px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">현재 준비 상태</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  프론트는 비로그인 사용자를 `/login`으로 강제하고, 백엔드의 OAuth 성공 리다이렉트가 `/auth/callback`으로 오면
                  기본 프로젝트로 이동하도록 맞춰져 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(18,35,58,0.96),rgba(11,23,41,0.98))] px-7 py-8 text-white shadow-[0_25px_80px_rgba(15,23,42,0.18)]">
          <div className="rounded-[30px] border border-white/10 bg-white/5 px-6 py-8 backdrop-blur">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Sign In
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">Google 계정으로 이동 중</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              브라우저가 자동으로 Google OAuth 로그인으로 이동합니다. 이동이 막히면 아래 버튼으로 직접 열 수 있습니다.
            </p>

            <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-sky-400/20 bg-sky-400/10 px-4 py-4 text-sm text-sky-100">
              <LoaderCircle className="animate-spin text-sky-300" size={18} />
              인증 페이지로 리다이렉트하는 중입니다.
            </div>

            <Button asChild size="lg" className="mt-8 w-full rounded-2xl border-0 bg-white text-slate-950 hover:bg-slate-100">
              <a href={oauthTarget}>
                <LogIn size={16} />
                Google 로그인
              </a>
            </Button>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-slate-300">
              <div className="font-semibold text-white">백엔드 운영 전제</div>
              <div className="mt-2">
                `APP_AUTH_LOGIN_SUCCESS_REDIRECT_URL`은 프론트의 `/auth/callback` 주소로 맞아야 합니다.
              </div>
              <div className="mt-2">
                현재 프론트 기본 프로젝트 ID는 `VITE_DEFAULT_PROJECT_ID`를 사용합니다.
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-sky-300">
              <ArrowRight size={16} />
              로그인 후 기본 프로젝트 업무 화면으로 이동
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[22px] border border-border/70 bg-background/85 px-4 py-4">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{description}</div>
    </div>
  );
}
