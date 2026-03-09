import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type Tone = 'blue' | 'green' | 'amber' | 'rose' | 'slate' | 'purple' | 'teal';

type Props = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

const toneStyles: Record<Tone, string> = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  slate: 'border-gray-200 bg-gray-50 text-gray-700',
  purple: 'border-purple-200 bg-purple-50 text-purple-700',
  teal: 'border-teal-200 bg-teal-50 text-teal-700',
};

export default function StatusPill({ children, tone = 'slate', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
