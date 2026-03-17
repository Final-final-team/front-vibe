import { Bell, ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

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
  title = '워크스페이스',
  subtitle,
  projects = [],
  selectedProjectId,
  onProjectChange,
  stats = [],
  compactMeta = false,
}: Props) {
  const [noticeOpen, setNoticeOpen] = useState(false);

  return (
    <>
    <header className="border-b border-border/70 bg-background/94 px-5 py-2.5 backdrop-blur">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center text-primary">
            <Sparkles size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-[24px] font-semibold tracking-tight text-foreground">{title}</h1>
              <button className="text-muted-foreground transition hover:text-foreground">
                <ChevronDown size={16} />
              </button>
            </div>
            {!compactMeta && subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          {stats.length > 0 && (
            <div className="hidden items-center xl:flex">
              {stats.map((stat, index) => (
                <div key={stat.label} className="flex items-center">
                  {index > 0 ? <div className="mx-2.5 h-8 w-px bg-border" /> : null}
                  <div className="min-w-[62px]">
                    <div className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">
                      {stat.label}
                    </div>
                    <div className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {projects.length > 0 && onProjectChange && (
            <label className="flex items-center gap-2 border-b border-border/70 px-1 py-1.5 text-sm text-muted-foreground">
              <span className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground">프로젝트</span>
              <select
                value={selectedProjectId ?? ''}
                onChange={(event) => onProjectChange(event.target.value)}
                className="min-w-[190px] border-0 bg-transparent pr-2 text-sm font-semibold text-foreground outline-none"
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
            className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition hover:text-foreground"
            onClick={() => setNoticeOpen(true)}
          >
            <Bell size={14} />
          </button>
        </div>
      </div>
    </header>
      <Dialog open={noticeOpen} onOpenChange={setNoticeOpen}>
        <DialogContent className="max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle>알림 기능 준비 중</DialogTitle>
            <DialogDescription>
              알림 센터와 실시간 알림 설정은 추후 구현 예정입니다. 현재는 업무와 검토 흐름 정리에 우선 집중하고 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setNoticeOpen(false)}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
