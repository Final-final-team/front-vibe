import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  icon?: ReactNode;
};

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-200 disabled:text-white',
  secondary:
    'border border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:text-blue-700 disabled:text-gray-300',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-300',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-200 disabled:text-white',
};

export default function Button({
  className,
  children,
  icon,
  variant = 'primary',
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
