import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { appConfig } from '../shared/config/app-config';
import { BackendApiError, toBackendApiError } from '../shared/lib/http';
import { loginWithLocalAccount, signupWithLocalAccount } from '../features/auth/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [signupForm, setSignupForm] = useState({
    email: '',
    nickname: '',
    password: '',
  });

  const defaultTarget = `/projects/${appConfig.defaultProjectId}/tasks`;

  const loginMutation = useMutation({
    mutationFn: loginWithLocalAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
      navigate(defaultTarget, { replace: true });
    },
  });

  const signupMutation = useMutation({
    mutationFn: signupWithLocalAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
      navigate(defaultTarget, { replace: true });
    },
  });

  const activeError = useMemo(() => {
    const source = tab === 'login' ? loginMutation.error : signupMutation.error;
    if (!source) {
      return null;
    }
    return source instanceof BackendApiError ? source : toBackendApiError(source);
  }, [loginMutation.error, signupMutation.error, tab]);

  const hasAuthenticatedSession = queryClient.getQueryData<{ authenticated: boolean }>(['auth', 'session']);
  if (hasAuthenticatedSession?.authenticated) {
    return <Navigate to={defaultTarget} replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8fb_0%,#fbfcfe_100%)] px-6 py-12">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] border border-border/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(243,246,252,0.96))] px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <Badge className="rounded-full bg-primary/12 px-3 py-1 text-primary hover:bg-primary/12">Local Auth</Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground">테스트용 로컬 로그인을 바로 붙였습니다</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            백엔드의 임시 로컬 인증 API `/api/auth/local/signup`, `/api/auth/local/login` 기준으로 동작합니다.
            성공하면 access/refresh 쿠키를 받은 뒤 기본 프로젝트 업무 화면으로 이동합니다.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <InfoCard title="로그인" description="기존 테스트 계정으로 바로 진입" />
            <InfoCard title="회원가입" description="새 이메일과 닉네임을 만들어 즉시 로그인" />
            <InfoCard title="쿠키 세션" description="이후 화면 진입은 백엔드 쿠키로만 판정" />
          </div>

          <div className="mt-8 rounded-[24px] border border-border/70 bg-background/80 px-5 py-4">
            <div className="text-sm font-semibold text-foreground">Google OAuth도 유지</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              임시 로컬 로그인으로 먼저 검증하고, 필요하면 기존 Google 로그인 경로도 계속 사용할 수 있습니다.
            </p>
            <Button asChild variant="outline" className="mt-4 rounded-2xl">
              <a href={`${appConfig.authBaseUrl}/oauth2/authorization/google`}>
                <LogIn size={16} />
                Google 로그인 사용
              </a>
            </Button>
          </div>
        </section>

        <section className="rounded-[32px] border border-border/70 bg-background px-7 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <Tabs value={tab} onValueChange={(value) => setTab(value as 'login' | 'signup')} className="gap-6">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted/70 p-1">
              <TabsTrigger value="login" className="rounded-2xl">로그인</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-2xl">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">기존 계정으로 들어가기</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  이메일과 비밀번호를 입력하면 백엔드가 인증 쿠키를 내려줍니다.
                </p>
              </div>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void loginMutation.mutateAsync(loginForm);
                }}
              >
                <Field label="이메일">
                  <Input
                    type="email"
                    placeholder="tester@example.com"
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </Field>
                <Field label="비밀번호">
                  <Input
                    type="password"
                    placeholder="8자 이상"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                  />
                </Field>
                {tab === 'login' && activeError ? <ErrorBanner code={activeError.code} message={activeError.message} /> : null}
                <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={loginMutation.isPending}>
                  <LogIn size={16} />
                  {loginMutation.isPending ? '로그인 처리 중...' : '로컬 로그인'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">테스트 계정 만들기</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  새 계정을 만든 뒤 즉시 로그인 상태로 전환합니다. 닉네임은 2자 이상, 비밀번호는 8자 이상이어야 합니다.
                </p>
              </div>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void signupMutation.mutateAsync(signupForm);
                }}
              >
                <Field label="이메일">
                  <Input
                    type="email"
                    placeholder="new-user@example.com"
                    value={signupForm.email}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </Field>
                <Field label="닉네임">
                  <Input
                    placeholder="테스터"
                    value={signupForm.nickname}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, nickname: event.target.value }))}
                  />
                </Field>
                <Field label="비밀번호">
                  <Input
                    type="password"
                    placeholder="8자 이상"
                    value={signupForm.password}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))}
                  />
                </Field>
                {tab === 'signup' && activeError ? <ErrorBanner code={activeError.code} message={activeError.message} /> : null}
                <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={signupMutation.isPending}>
                  <UserPlus size={16} />
                  {signupMutation.isPending ? '계정 생성 중...' : '계정 만들고 시작'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function ErrorBanner({ code, message }: { code: string; message: string }) {
  return (
    <div className="rounded-[20px] border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-800">
      <div className="flex items-start gap-2">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold">{code}</div>
          <div className="mt-1 leading-6">{message}</div>
        </div>
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
