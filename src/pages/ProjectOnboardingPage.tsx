import { ArrowRight, FolderPlus, LoaderCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { BackendApiError, toBackendApiError } from '../shared/lib/http';
import { createProject } from '../features/workspace/hooks';
import { workspaceKeys } from '../features/workspace/hooks';

export default function ProjectOnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [projectName, setProjectName] = useState('우리 팀 프로젝트');
  const [projectSummary, setProjectSummary] = useState('업무와 검토를 한 곳에서 관리할 기본 작업공간');
  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async ({ projectId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workspaceKeys.bootstrap }),
        queryClient.invalidateQueries({ queryKey: workspaceKeys.projects }),
      ]);
      navigate(`/projects/${projectId}/tasks`, { replace: true });
    },
  });

  const apiError = createProjectMutation.error
    ? (createProjectMutation.error instanceof BackendApiError
        ? createProjectMutation.error
        : toBackendApiError(createProjectMutation.error))
    : null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f8fb_0%,#fbfcfe_100%)] px-6 py-12">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[32px] border border-border/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(243,246,252,0.96))] px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <Badge className="rounded-full bg-primary/12 px-3 py-1 text-primary hover:bg-primary/12">Project Start</Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground">처음 사용할 프로젝트 정보를 먼저 적어둡니다</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            현재는 OAuth 로그인 직후 소속 프로젝트가 없을 때 이 화면만 노출됩니다. 입력한 값은 실제 백엔드 프로젝트 생성 API로 전송되고,
            생성이 끝나면 바로 업무 보드로 이동합니다.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <InfoCard title="현재 상태" description="소속 프로젝트가 없는 로그인 사용자만 이 화면으로 들어옵니다." />
            <InfoCard title="생성 방식" description="입력값은 백엔드 프로젝트 생성 API로 저장됩니다." />
            <InfoCard title="다음 단계" description="생성이 끝나면 새 프로젝트의 업무 보드로 즉시 이동합니다." />
          </div>
        </section>

        <section className="rounded-[32px] border border-border/70 bg-background px-7 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Onboarding
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">기본 프로젝트 이름 정하기</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            새 프로젝트를 만든 뒤 바로 업무 화면으로 진입합니다. 추후 초대와 다중 프로젝트 온보딩이 붙으면 이 화면도 확장됩니다.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              createProjectMutation.mutate({
                name: projectName.trim(),
                description: projectSummary.trim(),
              });
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
                  지금은 프로젝트 생성만 우선 연결되어 있습니다. 멤버 초대와 역할 초기 설정은 다음 단계에서 붙습니다.
                </div>
              </div>
            </div>

            {apiError ? (
              <div className="rounded-[22px] border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm leading-6 text-destructive">
                프로젝트 생성에 실패했습니다. {apiError.message}
              </div>
            ) : null}

            <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <FolderPlus size={16} />}
              {createProjectMutation.isPending ? '프로젝트 생성 중' : '기본 프로젝트로 시작'}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
            <ArrowRight size={16} />
            생성 후 새 프로젝트 업무 보드로 이동
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
