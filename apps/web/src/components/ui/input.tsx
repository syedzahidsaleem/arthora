import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border-2 border-black bg-[#16161D] px-4 py-2 text-sm font-medium text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-content-muted focus-visible:outline-none focus-visible:border-black focus-visible:shadow-neo transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
