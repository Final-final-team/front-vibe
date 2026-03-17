import { ArrowUpDown, ChevronDown, Filter, Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../shared/lib/cn';

interface BoardToolbarProps {
  onOpenModal: () => void;
  primaryLabel?: string;
  filterLabels?: string[];
  contextLabel?: string;
}

export default function BoardToolbar({
  onOpenModal,
  primaryLabel = '새로운 아이템 (5W1H 할당)',
  filterLabels = [],
  contextLabel,
}: BoardToolbarProps) {
  return (
    <div className="border-b border-border/70 bg-background px-6 py-2.5">
      <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onOpenModal} className="h-9 rounded-xl px-4 shadow-none">
            <Plus size={16} />
            {primaryLabel}
          </Button>
          <div className="inline-flex items-center rounded-xl border border-border/70 bg-muted/35 p-1">
            <button
              type="button"
              className="rounded-lg bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm"
            >
              보드 보기
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              큐 보기
            </button>
          </div>
          {contextLabel && (
            <span className="rounded-lg border border-border/70 bg-muted/25 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {contextLabel}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <div className="flex flex-wrap items-center gap-2">
            {filterLabels.map((label) => (
              <button
                key={label}
                type="button"
                className={cn(
                  'inline-flex h-9 items-center gap-2 rounded-xl border border-border/70 bg-background px-3.5 text-sm font-medium text-foreground/85 shadow-none transition',
                  'hover:border-border hover:bg-muted/40',
                )}
              >
                <Filter size={14} className="text-muted-foreground" />
                {label}
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
            ))}
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/70 bg-background px-3.5 text-sm font-medium text-foreground/85 shadow-none transition hover:border-border hover:bg-muted/40"
            >
              <ArrowUpDown size={14} className="text-muted-foreground" />
              정렬
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/20 px-3.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/40"
            >
              <SlidersHorizontal size={14} />
              보기 설정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
