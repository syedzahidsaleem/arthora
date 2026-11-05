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
    <div className="relative w-full space-y-2 select-none">
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
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-white border-2 border-black shadow-[inset_1px_1px_0px_#000]">
          <SliderPrimitive.Range className="absolute h-full bg-neo-mint border-r-2 border-black" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border-2 border-black bg-neo-yellow transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing shadow-[2px_2px_0px_#000] active:bg-neo-mint" />
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
                className="absolute text-[10px] font-mono font-bold tabular-nums text-[#222A2A] whitespace-nowrap select-none"
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
