import { ArrowRight, FolderPlus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { appConfig } from '../shared/config/app-config';
import { completeProjectOnboarding } from '../shared/lib/project-onboarding';

const defaultProjectPath = `/projects/${appConfig.defaultProjectId}/tasks`;

export default function ProjectOnboardingPage() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('우리 팀 프로젝트');
  const [projectSummary, setProjectSummary] = useState('업무와 검토를 한 곳에서 관리할 기본 작업공간');

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8fb_0%,#fbfcfe_100%)] px-6 py-12">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] border border-border/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(243,246,252,0.96))] px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <Badge className="rounded-full bg-primary/12 px-3 py-1 text-primary hover:bg-primary/12">Project Start</Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground">처음 사용할 프로젝트 정보를 먼저 적어둡니다</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            백엔드에 프로젝트 생성 API가 아직 없어서 실제 저장은 되지 않습니다. 대신 첫 진입 흐름을 비우지 않기 위해
            프로젝트 이름과 목적을 로컬에 저장하고, 준비된 기본 프로젝트로 연결합니다.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <InfoCard title="현재 상태" description="초대와 프로젝트 생성 API는 아직 없음" />
            <InfoCard title="임시 동작" description="입력값은 브라우저에만 저장하고 UI 라벨에 반영" />
            <InfoCard title="다음 단계" description="백엔드 프로젝트 API가 생기면 이 화면을 실제 생성 플로우로 교체" />
          </div>
        </section>

        <section className="rounded-[32px] border border-border/70 bg-background px-7 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Onboarding
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">기본 프로젝트 이름 정하기</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            로그인한 사용자가 이미 하나의 프로젝트 멤버라는 현재 백엔드 전제를 유지한 채, 첫 진입 경험만 보완합니다.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              completeProjectOnboarding({ projectName, projectSummary });
              navigate(defaultProjectPath, { replace: true });
            }}
          >
            <Field label="프로젝트 이름">
              <Input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="예: 운영 자동화 보드" />
            </Field>

            <Field label="프로젝트 설명">
              <Input
                value={projectSummary}
                onChange={(event) => setProjectSummary(event.target.value)}
                placeholder="예: 운영 업무와 리뷰 라운드를 한 곳에서 추적"
              />
            </Field>

            <div className="rounded-[22px] border border-border/70 bg-muted/30 px-4 py-4 text-sm leading-6 text-muted-foreground">
              <div className="flex items-start gap-2">
                <Sparkles size={16} className="mt-1 shrink-0 text-primary" />
                <div>
                  이 정보는 로컬 브라우저에만 저장됩니다. 실제 프로젝트 생성과 멤버 초대는 백엔드 API가 준비되면 연결합니다.
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full rounded-2xl">
              <FolderPlus size={16} />
              기본 프로젝트로 시작
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
            <ArrowRight size={16} />
            저장 후 `/projects/{appConfig.defaultProjectId}/tasks` 로 이동
          </div>
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

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[22px] border border-border/70 bg-background/85 px-4 py-4">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{description}</div>
    </div>
  );
}
