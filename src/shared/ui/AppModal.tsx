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
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'w-[min(1120px,calc(100vw-3rem))] max-w-[calc(100vw-3rem)] overflow-hidden rounded-[28px] border border-border/80 p-0 shadow-[0_28px_90px_rgba(15,23,42,0.18)] sm:max-w-[1120px]',
          className,
        )}
      >
        <div className="m-3 rounded-[22px] border border-border/70 bg-background">
          <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
            <DialogHeader className="min-w-0">
              {badges ? <div className="mb-3 flex flex-wrap items-center gap-2">{badges}</div> : null}
              <DialogTitle className="text-[26px] font-semibold tracking-tight">{title}</DialogTitle>
              {description ? <DialogDescription className="mt-2 text-sm leading-6">{description}</DialogDescription> : null}
            </DialogHeader>
            <DialogClose asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="h-9 w-9 rounded-full border-border/70 bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={16} />
                <span className="sr-only">닫기</span>
              </Button>
            </DialogClose>
          </div>

          <div
            className={cn(
              'grid items-start gap-8 px-6 py-6',
              side ? 'lg:grid-cols-[minmax(0,1fr)_300px]' : '',
              bodyClassName,
            )}
          >
            <div className="min-w-0">{children}</div>
            {side ? <aside className="border-l border-border/70 pl-6">{side}</aside> : null}
          </div>

          {footer ? <div className="flex justify-end border-t border-border/70 bg-muted/15 px-6 py-4">{footer}</div> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
