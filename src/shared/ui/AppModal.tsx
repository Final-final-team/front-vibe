import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { cn } from '../lib/cn';
import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  badges?: ReactNode;
  side?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  sideClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export default function AppModal({
  open,
  onOpenChange,
  title,
  description,
  badges,
  side,
  footer,
  children,
  className,
  bodyClassName,
  footerClassName,
  sideClassName,
  size = 'lg',
}: Props) {
  const sizeClassName =
    size === 'sm'
      ? 'w-[min(640px,calc(100vw-2.5rem))] max-w-[calc(100vw-2.5rem)] sm:max-w-[640px]'
      : size === 'md'
        ? 'w-[min(820px,calc(100vw-2.5rem))] max-w-[calc(100vw-2.5rem)] sm:max-w-[820px]'
        : size === 'xl'
          ? 'w-[min(1180px,calc(100vw-2.5rem))] max-w-[calc(100vw-2.5rem)] sm:max-w-[1180px]'
          : 'w-[min(1024px,calc(100vw-2.5rem))] max-w-[calc(100vw-2.5rem)] sm:max-w-[1024px]';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'max-h-[92vh] overflow-hidden rounded-[28px] border border-border/80 p-0 shadow-[0_28px_90px_rgba(15,23,42,0.18)]',
          sizeClassName,
          className,
        )}
      >
        <div className="m-3 flex max-h-[calc(92vh-1.5rem)] flex-col overflow-hidden rounded-[22px] border border-border/70 bg-background">
          <div className="flex items-start justify-between gap-4 border-b border-border/70 px-6 py-5">
            <DialogHeader className="min-w-0">
              {badges ? <div className="mb-3 flex flex-wrap items-center gap-2">{badges}</div> : null}
              <DialogTitle className="break-keep text-[24px] font-semibold tracking-tight leading-tight">{title}</DialogTitle>
              {description ? <DialogDescription className="mt-2 text-sm leading-6">{description}</DialogDescription> : null}
            </DialogHeader>
            <DialogClose asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="h-9 w-9 rounded-full border-border/70 bg-background text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
              >
                <X size={16} />
                <span className="sr-only">닫기</span>
              </Button>
            </DialogClose>
          </div>

          <div
            className={cn(
              'min-h-0 overflow-y-auto px-6 py-6',
              side ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : '',
              bodyClassName,
            )}
          >
            <div className={cn(side ? 'grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]' : '')}>
              <div className="min-w-0">{children}</div>
              {side ? <aside className={cn('border-l border-border/70 pl-6', sideClassName)}>{side}</aside> : null}
            </div>
          </div>

          {footer ? (
            <div className={cn('flex justify-end border-t border-border/70 bg-muted/10 px-6 py-4', footerClassName)}>
              {footer}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
