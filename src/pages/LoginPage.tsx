import { LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8fb_0%,#fbfcfe_100%)] px-6 py-12">
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-[28px] border border-border/70 bg-background px-8 py-14 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          OAuth Login
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">Google 계정으로 로그인</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          로컬 백엔드 `8080`에서 OAuth 인증을 마치면 프론트로 다시 돌아옵니다.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-2xl px-6">
          <a href="http://localhost:8080/oauth2/authorization/google">
            <LogIn size={16} />
            로그인 시작
          </a>
        </Button>
      </div>
    </div>
  );
}
