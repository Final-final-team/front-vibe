import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type Tone = 'blue' | 'green' | 'amber' | 'rose' | 'slate' | 'purple' | 'teal';

type Props = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

const toneStyles: Record<Tone, string> = {
  blue: 'border-sky-200 bg-sky-50 text-sky-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
  purple: 'border-violet-200 bg-violet-50 text-violet-700',
  teal: 'border-teal-200 bg-teal-50 text-teal-700',
};

export default function StatusPill({ children, tone = 'slate', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold',
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
