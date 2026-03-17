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
        'relative overflow-hidden rounded-2xl border border-border/70 bg-card/98 px-4 py-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]',
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-14 bg-[linear-gradient(135deg,rgba(37,99,235,0.07),transparent_55%)]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-3 text-[26px] font-semibold tracking-tight text-foreground">{value}</div>
          {hint && <div className="mt-1.5 text-sm leading-6 text-muted-foreground">{hint}</div>}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </section>
  );
}
