import { ArrowRight, FolderKanban, Layers3, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';
import PageHero from '../shared/ui/PageHero';

export default function ProjectsHomePage() {
  const navigate = useNavigate();
  const { projects, currentProjectDetail, setSelectedProjectId } = useWorkspace();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={<Badge className="rounded-full bg-primary/12 px-3 py-1 text-primary hover:bg-primary/12">Workspace Home</Badge>}
        title="프로젝트 허브"
        description="집 아이콘을 누르면 가장 먼저 보는 메인 화면입니다. 프로젝트 카드에서 작업공간을 고르고, 그다음 업무 보드나 검토 보관함으로 들어갑니다."
        stats={
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard title="프로젝트" value={`${projects.length}개`} icon={<Layers3 size={16} />} />
            <SummaryCard
              title="열린 업무"
              value={`${projects.reduce((sum, project) => sum + project.openTaskCount, 0)}건`}
              icon={<FolderKanban size={16} />}
            />
            <SummaryCard
              title="참여 멤버"
              value={`${projects.reduce((sum, project) => sum + project.memberCount, 0)}명`}
              icon={<Users size={16} />}
            />
          </div>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id}
            className="group rounded-[28px] border border-border/70 bg-background px-5 py-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_22px_55px_rgba(37,99,235,0.12)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{project.code}</div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">{project.name}</h3>
                {currentProjectDetail?.projectId === project.id ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/[0.06] text-primary">
                      현재 작업공간
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      멤버십 {getMembershipLabel(currentProjectDetail.membershipStatus)}
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      상태 {getProjectStatusLabel(currentProjectDetail.status)}
                    </Badge>
                  </div>
                ) : null}
              </div>
              <div className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-xs font-semibold text-muted-foreground">
                진행률 {project.progress}%
              </div>
            </div>

            <p className="mt-4 min-h-12 text-sm leading-7 text-muted-foreground">{project.description}</p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <MetricCard label="멤버" value={`${project.memberCount}명`} />
              <MetricCard label="열린 업무" value={`${project.openTaskCount}건`} />
              <MetricCard label="검토 큐" value={`${project.reviewQueueCount}건`} />
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted/70">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${project.progress}%` }} />
            </div>

            <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
              <span>{project.ownerName}</span>
              <span>업데이트 {formatDate(project.updatedAt)}</span>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <Button
                className="flex-1 rounded-2xl"
                onClick={() => {
                  setSelectedProjectId(project.id);
                  navigate(`/projects/${project.id}/tasks`);
                }}
              >
                업무 보드 열기
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl"
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

function SummaryCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-border/70 bg-background/85 px-4 py-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-border/70 bg-muted/20 px-3 py-3">
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
