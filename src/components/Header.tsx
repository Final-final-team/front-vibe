import { Bell, ChevronDown, Sparkles } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

type Props = {
  title?: string;
  subtitle?: string;
  projects?: Array<{ id: string; name: string; code: string }>;
  selectedProjectId?: string | null;
  onProjectChange?: (projectId: string) => void;
  stats?: Array<{ label: string; value: string }>;
  compactMeta?: boolean;
};

export default function Header({
  title = 'Start from scratch',
  subtitle,
  projects = [],
  selectedProjectId,
  onProjectChange,
  stats = [],
  compactMeta = false,
}: Props) {
  return (
    <header className="border-b border-border/70 bg-card/90 px-6 pb-3 pt-2.5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/8 text-primary">
              <Sparkles size={15} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-semibold tracking-tight text-foreground">{title}</h1>
              {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <button className="text-muted-foreground transition hover:text-foreground">
              <ChevronDown size={20} />
            </button>
          </div>
          {compactMeta && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">내부 운영</Badge>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {stats.length > 0 && (
            <div className="hidden items-center gap-2 xl:flex">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border/70 bg-muted/25 px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="mt-1 text-base font-semibold text-foreground">{stat.value}</div>
                </div>
              ))}
            </div>
          )}
          {projects.length > 0 && onProjectChange && (
            <label className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              <span>Project</span>
              <select
                value={selectedProjectId ?? ''}
                onChange={(event) => onProjectChange(event.target.value)}
                className="border-0 bg-transparent pr-2 text-sm font-semibold text-foreground outline-none"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.code})
                  </option>
                ))}
              </select>
            </label>
          )}
          <Button variant="outline" className="rounded-2xl">
            주간 리듬
          </Button>
          <Button variant="outline" size="icon" className="rounded-2xl">
            <Bell size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}
