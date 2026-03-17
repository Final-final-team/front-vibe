import type { ReactNode } from 'react';
import Button from './Button';

type Props = {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  onCancel: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
};

export default function Dialog({
  open,
  title,
  description,
  children,
  confirmLabel = '확인',
  cancelLabel = '닫기',
  confirmVariant = 'primary',
  onCancel,
  onConfirm,
  confirmDisabled,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-[560px] rounded-[28px] border border-border/80 bg-background p-5 shadow-[0_28px_90px_rgba(15,23,42,0.18)] sm:p-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
          {description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>}
        </div>
        {children && <div className="mt-5">{children}</div>}
        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border/70 pt-4">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          {onConfirm && (
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              disabled={confirmDisabled}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
