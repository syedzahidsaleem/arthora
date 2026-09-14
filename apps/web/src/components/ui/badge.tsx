import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border-2 border-black px-2.5 py-0.5 text-xs font-bold font-mono uppercase tracking-wider transition-all duration-150 shadow-neo-sm select-none',
  {
    variants: {
      variant: {
        default: 'bg-neo-yellow text-black',
        cyan: 'bg-neo-cyan text-black',
        pink: 'bg-neo-pink text-black',
        lime: 'bg-neo-lime text-black',
        purple: 'bg-neo-purple text-white',
        orange: 'bg-neo-orange text-black',
        outline: 'bg-transparent text-white border-white/40 shadow-none',
        dark: 'bg-neo-black text-white border-black',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
