import { ArrowRight, FolderKanban, Layers3, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';

export default function ProjectsHomePage() {
  const navigate = useNavigate();
  const { projects, currentProjectDetail, setSelectedProjectId } = useWorkspace();

  return (
    <div className="space-y-6">
      <section className="pt-6">
        <div className="border-b border-border/70 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">프로젝트 허브</Badge>
            <span className="text-sm text-muted-foreground">가장 먼저 보는 메인 화면입니다. 프로젝트를 고른 뒤 업무와 검토로 들어갑니다.</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-6 text-sm">
            <SummaryInline title="프로젝트" value={`${projects.length}개`} icon={<Layers3 size={16} />} />
            <SummaryInline
              title="열린 업무"
              value={`${projects.reduce((sum, project) => sum + project.openTaskCount, 0)}건`}
              icon={<FolderKanban size={16} />}
            />
            <SummaryInline
              title="참여 멤버"
              value={`${projects.reduce((sum, project) => sum + project.memberCount, 0)}명`}
              icon={<Users size={16} />}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article key={project.id} className="border-b border-border/70 px-1 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{project.code}</div>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">{project.name}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{project.description}</p>
                {currentProjectDetail?.projectId === project.id ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/[0.06] text-primary">
                      현재 작업공간
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      {getMembershipLabel(currentProjectDetail.membershipStatus)}
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      {getProjectStatusLabel(currentProjectDetail.status)}
                    </Badge>
                  </div>
                ) : null}
              </div>
              <div className="rounded-full border border-border/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                진행률 {project.progress}%
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <MetricCard label="멤버" value={`${project.memberCount}명`} />
              <MetricCard label="열린 업무" value={`${project.openTaskCount}건`} />
              <MetricCard label="검토 큐" value={`${project.reviewQueueCount}건`} />
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted/60">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${project.progress}%` }} />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{project.ownerName}</span>
              <span>업데이트 {formatDate(project.updatedAt)}</span>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <Button
                className="flex-1 rounded-xl"
                onClick={() => {
                  setSelectedProjectId(project.id);
                  navigate(`/projects/${project.id}/tasks`);
                }}
              >
                업무 보드 열기
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setSelectedProjectId(project.id);
                  navigate(`/projects/${project.id}/reviews`);
                }}
              >
                <ArrowRight size={16} />
                검토
              </Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function SummaryInline({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="text-foreground/70">{icon}</span>
      <span>{title}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/15 px-3 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
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
