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
  titleActions?: ReactNode;
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
  titleActions,
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
      ? 'w-[min(620px,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] sm:max-w-[620px]'
      : size === 'md'
        ? 'w-[min(840px,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] sm:max-w-[840px]'
        : size === 'xl'
          ? 'w-[min(1140px,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] sm:max-w-[1140px]'
          : 'w-[min(980px,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] sm:max-w-[980px]';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'top-[50%] max-h-[90vh] overflow-hidden rounded-[26px] border border-border/80 p-0 shadow-[0_28px_90px_rgba(15,23,42,0.18)]',
          sizeClassName,
          className,
        )}
      >
        <div className="m-2.5 flex max-h-[calc(90vh-1.25rem)] flex-col overflow-hidden rounded-[22px] border border-border/70 bg-background sm:m-3">
          <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6 sm:py-5">
            <DialogHeader className="min-w-0">
              {badges ? <div className="mb-3 flex flex-wrap items-center gap-2">{badges}</div> : null}
              <div className="flex flex-wrap items-start gap-3">
                <DialogTitle className="min-w-0 flex-1 break-keep text-[24px] font-semibold tracking-tight leading-tight">
                  {title}
                </DialogTitle>
                {titleActions ? <div className="shrink-0">{titleActions}</div> : null}
              </div>
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

          <div className={cn('min-h-0 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6', bodyClassName)}>
            <div className={cn(side ? 'grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]' : '')}>
              <div className="min-w-0">{children}</div>
              {side ? (
                <aside className={cn('border-t border-border/70 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0', sideClassName)}>{side}</aside>
              ) : null}
            </div>
          </div>

          {footer ? (
            <div className={cn('flex justify-end border-t border-border/70 bg-muted/10 px-5 py-4 sm:px-6', footerClassName)}>
              {footer}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
