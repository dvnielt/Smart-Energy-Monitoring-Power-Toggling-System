import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full",
      "border border-[var(--color-border)] bg-[var(--color-muted)]",
      "transition-all duration-300 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]",
      "disabled:cursor-not-allowed disabled:opacity-40",
      "data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm",
        "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "data-[state=checked]:translate-x-[1.35rem] data-[state=unchecked]:translate-x-0.5"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
