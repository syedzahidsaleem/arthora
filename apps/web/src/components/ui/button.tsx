import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-black tracking-wide border-2 border-black select-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5',
  {
    variants: {
      variant: {
        default:
          'bg-neo-mint text-black shadow-neo hover:shadow-neo-lg hover:bg-neo-yellow',
        yellow:
          'bg-neo-yellow text-black shadow-neo hover:shadow-neo-lg hover:bg-neo-mint',
        secondary:
          'bg-neo-aqua text-black shadow-neo hover:shadow-neo-lg hover:bg-[#68E8FF]',
        destructive:
          'bg-neo-rust text-white shadow-neo hover:shadow-neo-lg hover:bg-[#D43818]',
        outline:
          'bg-white text-black border-2 border-black shadow-neo hover:shadow-neo-lg hover:bg-neo-lilac/40',
        ghost:
          'border-transparent hover:border-black hover:bg-neo-lilac/40 hover:shadow-neo-sm text-[#222A2A]',
        link: 'border-0 text-[#EC4624] underline-offset-4 hover:underline p-0 h-auto font-black',
        gradient:
          'bg-gradient-to-r from-neo-yellow via-neo-mint to-neo-aqua text-black font-black shadow-neo hover:shadow-neo-lg',
        lime: 'bg-neo-mint text-black shadow-neo hover:shadow-neo-lg hover:bg-neo-yellow',
        pink: 'bg-neo-pink text-black shadow-neo hover:shadow-neo-lg hover:bg-[#FF85D0]',
        lilac: 'bg-neo-lilac text-black shadow-neo hover:shadow-neo-lg hover:bg-neo-mint',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-8.5 rounded-lg px-3 text-xs',
        lg: 'h-13 rounded-2xl px-7 text-base font-black',
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
