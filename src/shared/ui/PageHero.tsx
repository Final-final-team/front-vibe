import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  stats?: ReactNode;
  className?: string;
};

export default function PageHero({ eyebrow, title, description, actions, stats, className }: Props) {
  return (
    <section
      className={cn(
        'rounded-[32px] border border-border/70 bg-[var(--surface-panel)] px-6 py-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:px-8 md:py-8',
        className,
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? <div>{eyebrow}</div> : null}
          <div className={eyebrow ? 'mt-4' : ''}>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h2>
            {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      {stats ? <div className="mt-6">{stats}</div> : null}
    </section>
  );
}
