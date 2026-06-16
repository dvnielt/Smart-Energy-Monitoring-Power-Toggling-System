import { useEffect, useState } from "react"
import { useDevices } from "@/lib/hooks/useDevices"
import { MetricsStrip } from "@/components/SystemOverview"

export function Header() {
  const { devices } = useDevices()
  const onlineCount = devices.filter((d) => d.isOnline).length
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const allOnline = devices.length > 0 && onlineCount === devices.length

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="py-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--color-muted-foreground)]">
              Team 10 · Senior Design II
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-[1.65rem] sm:text-[1.85rem] font-semibold tracking-[-0.03em] leading-none">
                Smart Energy
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] transition-colors duration-300 ${
                  allOnline ? "" : "text-[var(--color-destructive)]"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                    allOnline
                      ? "bg-[var(--color-primary)]"
                      : "bg-[var(--color-destructive)]"
                  }`}
                />
                {allOnline
                  ? "All devices online"
                  : `${onlineCount} of ${devices.length} online`}
              </span>
            </div>
          </div>

          <div className="hidden lg:block">
            <MetricsStrip />
          </div>
        </div>

        <div className="lg:hidden pb-5 border-t border-[var(--color-border)]/60 pt-5">
          <MetricsStrip />
        </div>
      </div>
    </header>
  )
}
