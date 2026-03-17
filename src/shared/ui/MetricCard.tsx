import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type Props = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
};

export default function MetricCard({ label, value, hint, icon, className }: Props) {
  return (
    <section
      className={cn(
        'relative overflow-hidden border-b border-border/70 px-0 py-3',
        className,
      )}
    >
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-[24px] font-semibold tracking-tight text-foreground">{value}</div>
          {hint && <div className="mt-1 text-sm leading-6 text-muted-foreground">{hint}</div>}
        </div>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/8 text-primary">
            {icon}
          </div>
        )}
      </div>
    </section>
  );
}
