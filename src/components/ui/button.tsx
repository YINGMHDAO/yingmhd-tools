import { cn } from '@/utils/cn';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'default' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
  danger: 'bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]',
  ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
  outline:
    'bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--bg-hover)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 text-xs rounded',
  sm: 'h-7 px-2.5 text-xs rounded',
  md: 'h-8 px-3.5 text-sm rounded-md',
  lg: 'h-10 px-5 text-sm rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
