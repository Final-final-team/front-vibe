import { ArrowRight, LogIn, ShieldCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { appConfig } from '../shared/config/app-config';
import { useQueryClient } from '@tanstack/react-query';

export default function LoginPage() {
  const queryClient = useQueryClient();
  const defaultTarget = `/projects/${appConfig.defaultProjectId}/tasks`;
  const hasAuthenticatedSession = queryClient.getQueryData<{ authenticated: boolean }>(['auth', 'session']);

  if (hasAuthenticatedSession?.authenticated) {
    return <Navigate to={defaultTarget} replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8fb_0%,#fbfcfe_100%)] px-6 py-12">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] border border-border/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(243,246,252,0.96))] px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <Badge className="rounded-full bg-primary/12 px-3 py-1 text-primary hover:bg-primary/12">OAuth Only</Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground">Google 로그인으로만 접근합니다</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            현재 백엔드 인증 계약은 Google OAuth를 기준으로 동작합니다. 로그인 성공 후 access/refresh 쿠키가 발급되고,
            프론트는 그 쿠키가 있는 경우에만 업무 화면 접근을 허용합니다.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <InfoCard title="인증 방식" description="Google OAuth 성공 후 쿠키 세션을 발급받습니다." />
            <InfoCard title="프로젝트 가정" description="초대 플로우 없이, 로그인한 사용자가 이미 하나의 프로젝트 멤버라고 가정합니다." />
            <InfoCard title="진입 화면" description="로그인 성공 후 기본 프로젝트의 업무 목록으로 바로 이동합니다." />
          </div>

          <div className="mt-8 rounded-[24px] border border-border/70 bg-background/80 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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

        <section className="rounded-[32px] border border-border/70 bg-background px-7 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="rounded-[28px] border border-border/70 bg-[linear-gradient(180deg,rgba(249,250,251,0.92),rgba(255,255,255,0.98))] px-6 py-8">
            <div className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Sign In
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Google 계정으로 시작</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              로그인 가능한 계정은 백엔드에서 프로젝트 멤버십을 가진 사용자여야 합니다. 멤버가 아니면 로그인 후에도 업무 조회가 막힙니다.
            </p>

            <Button asChild size="lg" className="mt-8 w-full rounded-2xl">
              <a href={`${appConfig.authBaseUrl}/oauth2/authorization/google`}>
                <LogIn size={16} />
                Google 로그인
              </a>
            </Button>

            <div className="mt-6 rounded-[22px] border border-border/70 bg-muted/30 px-4 py-4 text-sm leading-6 text-muted-foreground">
              <div className="font-semibold text-foreground">백엔드 운영 전제</div>
              <div className="mt-2">
                `APP_AUTH_LOGIN_SUCCESS_REDIRECT_URL`은 프론트의 `/auth/callback` 주소로 맞아야 합니다.
              </div>
              <div className="mt-2">
                현재 프론트 기본 프로젝트 ID는 `VITE_DEFAULT_PROJECT_ID`를 사용합니다.
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
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
