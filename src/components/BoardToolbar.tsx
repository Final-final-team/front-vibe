import { ArrowUpDown, ChevronDown, Filter, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
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
    <div className="border-x border-b border-border/70 bg-card px-5 py-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button onClick={onOpenModal} className="h-10 rounded-2xl px-4 shadow-[0_10px_30px_rgba(37,99,235,0.25)]">
            <Plus size={16} />
            {primaryLabel}
          </Button>
          <div className="inline-flex items-center rounded-2xl border border-border/70 bg-muted/40 p-1">
            <button
              type="button"
              className="rounded-xl bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm"
            >
              보드 보기
            </button>
            <button
              type="button"
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              큐 보기
            </button>
          </div>
        {contextLabel && (
            <span className="rounded-full border border-border/70 bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {contextLabel}
            </span>
        )}
        </div>

        <div className="flex flex-col gap-3 xl:min-w-[640px] xl:flex-row xl:items-center xl:justify-end">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="현재 뷰에서 검색"
              className="h-10 rounded-2xl border-border/70 bg-muted/35 pl-10 shadow-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
          {filterLabels.map((label) => (
              <button
              key={label}
              type="button"
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-2xl border border-border/70 bg-background px-3.5 text-sm font-medium text-foreground/85 shadow-sm transition',
                  'hover:border-border hover:bg-muted/40',
                )}
            >
                <Filter size={14} className="text-muted-foreground" />
              {label}
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
          ))}
            <Separator orientation="vertical" className="hidden h-8 xl:block" />
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border/70 bg-background px-3.5 text-sm font-medium text-foreground/85 shadow-sm transition hover:border-border hover:bg-muted/40"
            >
              <ArrowUpDown size={14} className="text-muted-foreground" />
              정렬
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-3.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/40"
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
