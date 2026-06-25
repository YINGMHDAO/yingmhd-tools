import { cn } from '@/utils/cn';
import { type InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full h-9 px-3 text-sm bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md outline-none transition-colors duration-150 placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
