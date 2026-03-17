import { Bell, ChevronDown, Sparkles } from 'lucide-react';
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
    <header className="border-b border-border/70 bg-background/94 px-6 py-3 backdrop-blur">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-muted/50 text-primary">
            <Sparkles size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[28px] font-semibold tracking-tight text-foreground">{title}</h1>
              <button className="text-muted-foreground transition hover:text-foreground">
                <ChevronDown size={18} />
              </button>
            </div>
            {!compactMeta && subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          {stats.length > 0 && (
            <div className="flex items-center gap-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-[82px] rounded-xl border border-border/70 bg-card px-3 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.03)]"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="mt-1 text-xl font-semibold tracking-tight text-foreground">{stat.value}</div>
                </div>
              ))}
            </div>
          )}
          {projects.length > 0 && onProjectChange && (
            <label className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-sm text-muted-foreground shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Project</span>
              <select
                value={selectedProjectId ?? ''}
                onChange={(event) => onProjectChange(event.target.value)}
                className="min-w-[210px] border-0 bg-transparent pr-2 text-sm font-semibold text-foreground outline-none"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.code})
                  </option>
                ))}
              </select>
            </label>
          )}
          <Button variant="outline" size="icon-sm" className="rounded-xl">
            <Bell size={15} />
          </Button>
        </div>
      </div>
    </header>
  );
}
