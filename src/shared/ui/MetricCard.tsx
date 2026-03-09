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
        'rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            {label}
          </div>
          <div className="mt-3 text-2xl font-semibold text-gray-900">{value}</div>
          {hint && <div className="mt-2 text-sm text-gray-500">{hint}</div>}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </section>
  );
}
