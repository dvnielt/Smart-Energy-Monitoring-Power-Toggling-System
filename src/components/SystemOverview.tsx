import type { Device } from "@/types"
import { useDevices } from "@/lib/hooks/useDevices"

function computeStats(devices: Device[]) {
  const online = devices.filter((d) => d.isOnline).length
  const active = devices.filter((d) => d.isOn && d.isOnline).length
  const totalPower = devices
    .filter((d) => d.isOnline)
    .reduce((sum, d) => sum + d.powerDraw, 0)
  const avgRate =
    devices.length > 0
      ? devices.reduce((sum, d) => sum + d.currentRate, 0) / devices.length
      : 0
  return { online, total: devices.length, active, totalPower, avgRate }
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit?: string
}) {
  return (
    <div className="min-w-[7rem]">
      <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-muted-foreground)] mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-2xl font-medium tracking-tight leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-[var(--color-muted-foreground)]">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

export function MetricsStrip() {
  const { devices } = useDevices()
  const stats = computeStats(devices)

  return (
    <div className="flex flex-wrap items-end gap-x-10 gap-y-5 py-1">
      <Metric
        label="Connected"
        value={`${stats.online}/${stats.total}`}
      />
      <Metric label="Active" value={String(stats.active)} />
      <Metric
        label="Total draw"
        value={stats.totalPower.toLocaleString()}
        unit="W"
      />
      <Metric
        label="Current rate"
        value={`$${stats.avgRate.toFixed(2)}`}
        unit="/kWh"
      />
    </div>
  )
}
