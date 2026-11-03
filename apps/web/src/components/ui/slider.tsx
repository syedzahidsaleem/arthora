import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  ticks?: { value: number; label?: string }[];
  showTicks?: boolean;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, ticks, showTicks = false, min = 0, max = 100, ...props }, ref) => {
  return (
    <div className="relative w-full space-y-1.5">
      <SliderPrimitive.Root
        ref={ref}
        min={min}
        max={max}
        className={cn(
          'relative flex w-full touch-none select-none items-center py-2 cursor-pointer',
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-white/[0.08] dark:bg-white/[0.08] border border-white/[0.06]">
          <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-brand-primary bg-white ring-offset-background transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing shadow-[0_0_12px_rgba(108,99,255,0.4)]" />
      </SliderPrimitive.Root>

      {showTicks && ticks && ticks.length > 0 && (
        <div className="relative w-full h-4">
          {ticks.map((tick) => {
            const minVal = Number(min);
            const maxVal = Number(max);
            const pct = Math.max(0, Math.min(100, ((tick.value - minVal) / (maxVal - minVal)) * 100));
            return (
              <span
                key={tick.value}
                style={{
                  left: `${pct}%`,
                  transform: pct === 0 ? 'translateX(0)' : pct === 100 ? 'translateX(-100%)' : 'translateX(-50%)',
                }}
                className="absolute text-[10px] font-mono tabular-nums text-content-muted whitespace-nowrap select-none"
              >
                {tick.label ?? tick.value}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
