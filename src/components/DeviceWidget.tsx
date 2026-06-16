import { useEffect, useState } from "react"
import type { Device } from "@/types"
import { Switch } from "@/components/ui/switch"
import { cn, timeAgo } from "@/lib/utils"

type Props = {
  device: Device
  onToggle: (id: string, nextState: boolean) => Promise<unknown>
}

const RATE_LABEL: Record<Device["ratePeriod"], string> = {
  peak: "Peak",
  "mid-peak": "Mid-peak",
  "off-peak": "Off-peak",
}

export function DeviceWidget({ device, onToggle }: Props) {
  const [pending, setPending] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const handleToggle = async (nextState: boolean) => {
    if (!device.isOnline || pending) return
    setPending(true)
    try {
      await onToggle(device.id, nextState)
    } finally {
      setPending(false)
    }
  }

  const meta = [
    device.isOnline ? `${device.voltage.toFixed(1)} V` : null,
    device.isOnline ? `${device.current.toFixed(2)} A` : null,
    device.isOnline ? `$${device.currentRate.toFixed(2)}/kWh` : null,
    RATE_LABEL[device.ratePeriod],
  ]
    .filter(Boolean)
    .join("  ·  ")

  return (
    <article
      className={cn(
        "group relative surface-panel transition-all duration-300 ease-out",
        "hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]",
        !device.isOnline && "opacity-60"
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-3 bottom-3 w-[3px] rounded-full transition-colors duration-500",
          device.isOn && device.isOnline
            ? "bg-[var(--color-primary)]"
            : "bg-[var(--color-border)]"
        )}
      />

      <div className="pl-5 pr-4 py-4 sm:py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-display text-[15px] font-semibold tracking-[-0.01em] truncate">
                {device.name}
              </h3>
              <span className="text-[11px] text-[var(--color-muted-foreground)]">
                {device.applianceType}
              </span>
            </div>

            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              {!device.isOnline
                ? "Offline"
                : `${device.controlMode === "auto" ? "Auto" : "Manual"} · Updated ${timeAgo(device.lastUpdated)}`}
            </p>
          </div>

          <Switch
            checked={device.isOn}
            disabled={pending || !device.isOnline}
            onCheckedChange={handleToggle}
            aria-label={`Toggle ${device.name}`}
          />
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <div
              className={cn(
                "font-mono text-3xl sm:text-[2rem] font-medium tracking-tight leading-none transition-colors duration-300",
                device.isOn && device.isOnline
                  ? "text-[var(--color-foreground)]"
                  : "text-[var(--color-muted-foreground)]"
              )}
            >
              {device.isOnline ? device.powerDraw.toLocaleString() : "—"}
              {device.isOnline && (
                <span className="text-base font-normal text-[var(--color-muted-foreground)] ml-1">
                  W
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)] font-mono truncate">
              {device.isOnline ? meta : "Waiting for connection"}
            </p>
          </div>

          <div
            className={cn(
              "text-[11px] font-medium uppercase tracking-[0.06em] shrink-0 transition-colors duration-300",
              device.isOn
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-muted-foreground)]"
            )}
          >
            {pending ? "…" : device.isOn ? "On" : "Off"}
          </div>
        </div>
      </div>
    </article>
  )
}
