import { Bell, ChevronDown, Sparkles } from 'lucide-react';

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
          <div className="flex h-8 w-8 items-center justify-center text-primary">
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
            <div className="hidden items-center xl:flex">
              {stats.map((stat, index) => (
                <div key={stat.label} className="flex items-center">
                  {index > 0 ? <div className="mx-3 h-9 w-px bg-border" /> : null}
                  <div className="min-w-[72px]">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {stat.label}
                    </div>
                    <div className="mt-1 text-xl font-semibold tracking-tight text-foreground">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {projects.length > 0 && onProjectChange && (
            <label className="flex items-center gap-2 border-b border-border/70 px-1 py-2 text-sm text-muted-foreground">
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
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition hover:text-foreground"
          >
            <Bell size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
