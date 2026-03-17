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
        'overflow-hidden border-b border-border/70 bg-transparent',
        className,
      )}
    >
      {(title || description || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-border/60 px-0 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="px-0 py-4">{children}</div>
    </section>
  );
}
