import { LoaderCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appConfig } from '../shared/config/app-config';

const redirectTarget = `/projects/${appConfig.defaultProjectId}/tasks`;

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate(redirectTarget, { replace: true });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8fb_0%,#fbfcfe_100%)] px-6 py-12">
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-[28px] border border-border/70 bg-background px-8 py-14 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <LoaderCircle className="animate-spin" size={24} />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">로그인 결과를 반영하는 중입니다</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          인증 쿠키를 확인한 뒤 기본 프로젝트 업무 화면으로 이동합니다.
        </p>
      </div>
    </div>
  );
}
