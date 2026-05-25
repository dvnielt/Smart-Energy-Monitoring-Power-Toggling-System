import { useEffect, useState } from "react"
import type { Device } from "@/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn, timeAgo } from "@/lib/utils"

type Props = {
  device: Device
  onToggle: (id: string, nextState: boolean) => Promise<unknown>
}

const RATE_DOT: Record<Device["ratePeriod"], string> = {
  peak: "bg-red-500",
  "mid-peak": "bg-yellow-500",
  "off-peak": "bg-green-500",
}

const RATE_LABEL: Record<Device["ratePeriod"], string> = {
  peak: "Peak",
  "mid-peak": "Mid-Peak",
  "off-peak": "Off-Peak",
}

export function DeviceWidget({ device, onToggle }: Props) {
  const [pending, setPending] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const handleToggle = async () => {
    setPending(true)
    try {
      await onToggle(device.id, !device.isOn)
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold text-lg leading-tight">
              {device.name}
            </div>
            <div className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
              {device.applianceType}
            </div>
          </div>
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-medium",
              device.isOn
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-700"
            )}
          >
            {device.isOn ? "ON" : "OFF"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="border-t border-[var(--color-border)] pt-4 grid grid-cols-2 gap-y-3 gap-x-4">
          <div>
            <div className="text-xs text-[var(--color-muted-foreground)]">
              Voltage
            </div>
            <div className="font-medium tabular-nums">
              {device.voltage.toFixed(1)} V
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-muted-foreground)]">
              Current
            </div>
            <div className="font-medium tabular-nums">
              {device.current.toFixed(2)} A
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-muted-foreground)]">
              Power
            </div>
            <div className="font-bold text-xl tabular-nums">
              {device.powerDraw} W
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--color-muted-foreground)]">
              Rate
            </div>
            <div className="font-medium tabular-nums flex items-center gap-2">
              <span
                className={cn("inline-block h-2 w-2 rounded-full", RATE_DOT[device.ratePeriod])}
                title={RATE_LABEL[device.ratePeriod]}
              />
              ${device.currentRate.toFixed(2)} /kWh
            </div>
          </div>
        </div>

        <Button
          className="w-full mt-5"
          variant={device.isOn ? "destructive" : "default"}
          disabled={pending}
          onClick={handleToggle}
        >
          {pending ? "Working…" : device.isOn ? "Turn Off" : "Turn On"}
        </Button>
        <div className="mt-2 text-xs text-[var(--color-muted-foreground)] text-center">
          Updated {timeAgo(device.lastUpdated)}
        </div>
      </CardContent>
    </Card>
  )
}
