import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold tracking-wide border-2 border-black transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5',
  {
    variants: {
      variant: {
        default:
          'bg-neo-yellow text-black shadow-neo hover:shadow-neo-lg hover:bg-[#FFE570]',
        secondary:
          'bg-neo-cyan text-black shadow-neo hover:shadow-neo-lg hover:bg-[#68E8FF]',
        destructive:
          'bg-[#FF4D6D] text-white shadow-neo hover:shadow-neo-lg',
        outline:
          'bg-white dark:bg-[#18181F] text-black dark:text-white border-2 border-black shadow-neo hover:shadow-neo-lg',
        ghost:
          'border-transparent hover:border-black hover:bg-white/10 hover:shadow-neo-sm text-content-primary',
        link: 'border-0 text-neo-yellow underline-offset-4 hover:underline p-0 h-auto font-bold',
        gradient:
          'bg-gradient-to-r from-neo-yellow via-neo-lime to-neo-cyan text-black font-extrabold shadow-neo hover:shadow-neo-lg',
        lime: 'bg-neo-lime text-black shadow-neo hover:shadow-neo-lg hover:bg-[#33F7AC]',
        pink: 'bg-neo-pink text-black shadow-neo hover:shadow-neo-lg hover:bg-[#FF85D0]',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-8.5 rounded-md px-3 text-xs',
        lg: 'h-13 rounded-xl px-7 text-base font-extrabold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
