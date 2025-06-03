
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    inverted?: boolean;
    damageValue?: number; // Percentage of damage to show as red
  }
>(({ className, value, inverted = false, damageValue = 0, ...props }, ref) => {
  const getProgressColor = (percentage: number, isInverted: boolean) => {
    if (isInverted) {
      // Inverted: green when low (empty), red when high (full)
      if (percentage <= 20) return "bg-green-500";
      if (percentage <= 60) return "bg-yellow-500";
      return "bg-red-500";
    } else {
      // Normal: red when low, green when high
      if (percentage <= 20) return "bg-red-500";
      if (percentage <= 60) return "bg-yellow-500";
      return "bg-green-500";
    }
  };

  const progressValue = value || 0;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-gray-700",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          getProgressColor(progressValue, inverted)
        )}
        style={{ transform: `translateX(-${100 - progressValue}%)` }}
      />
      {damageValue > 0 && (
        <div
          className="absolute top-0 right-0 h-full bg-red-600/80 transition-all"
          style={{ width: `${damageValue}%` }}
        />
      )}
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
