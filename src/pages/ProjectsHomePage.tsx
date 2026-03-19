import { ArrowRight, CirclePlay, FolderKanban, FolderPlus, Layers3, LoaderCircle, Sparkles, Target, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { createProject, workspaceKeys } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { BackendApiError, toBackendApiError } from '../shared/lib/http';
import { formatDate } from '../shared/lib/format';
import BrandLockup from '../shared/ui/BrandLockup';
import HubTutorialModal from '../features/workspace/components/HubTutorialModal';
import { completeHubTutorial, hasCompletedHubTutorial } from '../shared/lib/project-onboarding';

export default function ProjectsHomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { projects, currentProjectDetail, setSelectedProjectId } = useWorkspace();
  const [projectName, setProjectName] = useState('우리 팀 프로젝트');
  const [projectSummary, setProjectSummary] = useState('업무와 검토를 한 곳에서 관리할 기본 작업공간');
  const [tutorialOpen, setTutorialOpen] = useState(false);
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

  const totalOpenTasks = useMemo(
    () => projects.reduce((sum, project) => sum + project.openTaskCount, 0),
    [projects],
  );
  const totalMembers = useMemo(
    () => projects.reduce((sum, project) => sum + project.memberCount, 0),
    [projects],
  );
  const averageProgress = useMemo(() => {
    if (projects.length === 0) {
      return 0;
    }

    return Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length);
  }, [projects]);
  const featuredProject = projects[0] ?? null;

  useEffect(() => {
    if (!hasCompletedHubTutorial()) {
      setTutorialOpen(true);
    }
  }, []);

  function closeTutorialPermanently() {
    completeHubTutorial();
    setTutorialOpen(false);
  }

  return (
    <div className="space-y-8 pb-8 pt-6">
      <HubTutorialModal open={tutorialOpen} onOpenChange={setTutorialOpen} onComplete={closeTutorialPermanently} />

      <section className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fbff_0%,#eef4ff_34%,#fff7ed_100%)] shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
        <div className="grid gap-8 px-7 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-9 lg:py-9">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <BrandLockup caption="Project : HEY-A-JI" />
              <Badge variant="outline" className="rounded-full border-lime-200 bg-lime-50 px-3 py-1 text-lime-700">
                오늘의 작업 시작점
              </Badge>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-[34px] font-semibold tracking-tight text-slate-950 lg:text-[42px]">
                오늘 해야 할 프로젝트를 바로 선택하세요
              </h1>
              <p className="max-w-[44rem] text-[15px] leading-8 text-slate-600">
                <span className="block">업무, 검토, 멤버 현황을 먼저 보고 지금 가장 먼저 들어갈 작업 공간을 고를 수 있습니다.</span>
                <span className="block">설명보다 선택이 먼저인 시작 화면으로 정리했습니다.</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                className="rounded-2xl bg-slate-950 px-5 text-white hover:bg-slate-800"
                onClick={() => {
                  if (!featuredProject) return;
                  setSelectedProjectId(featuredProject.id);
                  navigate(`/projects/${featuredProject.id}/tasks`);
                }}
                disabled={!featuredProject}
              >
                가장 바쁜 프로젝트 열기
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl px-5"
                onClick={() => setTutorialOpen(true)}
              >
                사용법 보기
                <CirclePlay size={16} />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <HeroStat
                label="프로젝트"
                value={`${projects.length}개`}
                caption="현재 접근 가능한 작업공간"
                icon={<Layers3 size={17} />}
              />
              <HeroStat
                label="열린 업무"
                value={`${totalOpenTasks}건`}
                caption="즉시 확인이 필요한 업무"
                icon={<FolderKanban size={17} />}
              />
              <HeroStat
                label="평균 진행률"
                value={`${averageProgress}%`}
                caption="전체 프로젝트 평균"
                icon={<Target size={17} />}
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white/75 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_70%)]" />
            <div className="relative">
              <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Recommended now</div>
              {featuredProject ? (
                <>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">{featuredProject.code}</div>
                      <div className="mt-2 text-[24px] font-semibold tracking-tight text-slate-950">{featuredProject.name}</div>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                      진행률 {featuredProject.progress}%
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {featuredProject.description || '업무와 검토가 가장 먼저 모이는 대표 작업 공간입니다.'}
                  </p>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <MiniMetric label="멤버" value={`${featuredProject.memberCount}명`} />
                    <MiniMetric label="열린 업무" value={`${featuredProject.openTaskCount}건`} />
                    <MiniMetric label="검토 큐" value={`${featuredProject.reviewQueueCount}건`} />
                  </div>
                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#f97316)] transition-all"
                      style={{ width: `${featuredProject.progress}%` }}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>{featuredProject.ownerName}</span>
                    <span>업데이트 {formatDate(featuredProject.updatedAt)}</span>
                  </div>
                  <Button
                    className="mt-6 h-11 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
                    onClick={() => {
                      setSelectedProjectId(featuredProject.id);
                      navigate(`/projects/${featuredProject.id}/tasks`);
                    }}
                  >
                    지금 바로 시작
                    <ArrowRight size={16} />
                  </Button>
                </>
              ) : (
                <div className="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-sm leading-7 text-slate-500">
                  아직 시작된 프로젝트가 없습니다. 아래에서 첫 프로젝트를 만들면 바로 업무 화면으로 이어집니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {projects.length > 0 ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace lineup</div>
              <h2 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">지금 들어갈 프로젝트</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-2 text-sm text-muted-foreground">
              <Users size={15} />
              전체 참여 멤버 {totalMembers}명
            </div>
          </div>

          <section className="grid gap-4 xl:grid-cols-2">
            {projects.map((project) => {
              const isCurrent = currentProjectDetail?.projectId === project.id;

              return (
                <article
                  key={project.id}
                  className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(15,23,42,0.09)]"
                >
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[40px] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_70%)]" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                            {project.code}
                          </span>
                          {project.reviewQueueCount > 0 ? (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                              검토 {project.reviewQueueCount}건
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mt-4 text-[24px] font-semibold tracking-tight text-slate-950">{project.name}</h3>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                          {project.description || '업무와 검토를 이어서 처리할 수 있는 기본 작업 공간입니다.'}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Progress</div>
                        <div className="mt-1 text-lg font-semibold text-slate-900">{project.progress}%</div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {isCurrent ? (
                        <Badge className="rounded-full bg-blue-600 px-3 py-1 text-white hover:bg-blue-600">현재 작업공간</Badge>
                      ) : null}
                      {isCurrent ? (
                        <Badge variant="outline" className="rounded-full">
                          {getMembershipLabel(currentProjectDetail.membershipStatus)}
                        </Badge>
                      ) : null}
                      {isCurrent ? (
                        <Badge variant="outline" className="rounded-full">
                          {getProjectStatusLabel(currentProjectDetail.status)}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <ProjectMetric label="멤버" value={`${project.memberCount}명`} />
                      <ProjectMetric label="열린 업무" value={`${project.openTaskCount}건`} />
                      <ProjectMetric label="검토 큐" value={`${project.reviewQueueCount}건`} />
                    </div>

                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#111827,#2563eb)] transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>{project.ownerName}</span>
                      <span>최근 업데이트 {formatDate(project.updatedAt)}</span>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <Button
                        size="lg"
                        className="rounded-2xl bg-slate-950 px-5 text-white hover:bg-slate-800"
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          navigate(`/projects/${project.id}/tasks`);
                        }}
                      >
                        업무 시작
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-2xl px-5"
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          navigate(`/projects/${project.id}/reviews`);
                        }}
                      >
                        검토 확인
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] border border-slate-200/80 bg-[linear-gradient(160deg,#ffffff,#f7f9fc)] px-8 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <BrandLockup caption={projects.length > 0 ? 'Create next' : 'Start with'} />
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
            {projects.length > 0 ? '새 프로젝트를 추가로 만들 수 있습니다' : '첫 프로젝트를 만들고 바로 일을 시작하세요'}
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate-600">
            {projects.length > 0
              ? '이미 참여 중인 프로젝트가 있어도, 새 작업 공간을 추가로 만들고 바로 업무 보드로 이동할 수 있습니다.'
              : '처음 들어온 사용자도 별도 설명 페이지 없이 여기서 바로 프로젝트를 만들고, 생성 직후 업무 보드로 이동할 수 있습니다.'}
          </p>
          <div className="mt-7 space-y-4 text-sm leading-7 text-slate-600">
            <FeatureLine text="프로젝트를 만들면 담당, 업무, 검토 흐름이 바로 연결됩니다." />
            <FeatureLine text="운영용, 실험용, 팀별 공간을 나눠서 추가할 수 있습니다." />
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200/80 bg-white px-7 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="inline-flex items-center rounded-full border border-lime-200 bg-lime-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-lime-700">
            {projects.length > 0 ? 'Create another space' : 'Create your first space'}
          </div>
          <h3 className="mt-5 text-[28px] font-semibold tracking-tight text-slate-950">
            {projects.length > 0 ? '새 프로젝트 만들기' : '첫 프로젝트 만들기'}
          </h3>
          <form
            className="mt-6 space-y-4"
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
              <Input value={projectSummary} onChange={(event) => setProjectSummary(event.target.value)} placeholder="예: 업무와 검토를 한 곳에서 추적" />
            </Field>

            {apiError ? (
              <div className="rounded-[22px] border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm leading-6 text-destructive">
                프로젝트 생성에 실패했습니다. {apiError.message}
              </div>
            ) : null}

            <Button type="submit" size="lg" className="mt-2 h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <FolderPlus size={16} />}
              {createProjectMutation.isPending ? '프로젝트 생성 중' : '프로젝트 생성하고 시작'}
            </Button>
          </form>
        </div>
      </section>
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

function HeroStat({
  label,
  value,
  caption,
  icon,
}: {
  label: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/75 px-5 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
        <div className="text-slate-500">{icon}</div>
      </div>
      <div className="mt-3 text-[30px] font-semibold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{caption}</div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function ProjectMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-[18px] font-semibold tracking-tight text-slate-950">{value}</div>
    </div>
  );
}

function FeatureLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(145deg,#0b1120,#111f3a)] text-lime-300">
        <Sparkles size={14} />
      </div>
      <span>{text}</span>
    </div>
  );
}

function getMembershipLabel(status: string) {
  switch (status) {
    case 'ACTIVE':
      return '참여중';
    case 'INVITED':
      return '초대 대기';
    case 'DECLINED':
      return '참여 거절';
    case 'EXPIRED':
      return '초대 만료';
    default:
      return status;
  }
}

function getProjectStatusLabel(status: string) {
  switch (status) {
    case 'ACTIVE':
      return '활성';
    case 'ARCHIVED':
      return '보관';
    case 'DELETED':
      return '삭제';
    default:
      return status;
  }
}
