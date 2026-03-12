import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type Props = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Card({ title, description, action, children, className }: Props) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur',
        className,
      )}
    >
      {(title || description || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-border/60 bg-muted/20 px-6 py-5">
          <div className="min-w-0">
            {title && <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>}
            {description && <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}
