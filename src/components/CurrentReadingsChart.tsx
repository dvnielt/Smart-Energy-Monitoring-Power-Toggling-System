import { useMemo, useState } from "react"
import { format } from "date-fns"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Panel, PanelBody, PanelHeader, SegmentControl } from "@/components/Panel"
import { useCurrentHistory } from "@/lib/hooks/useCurrentHistory"
import { useDevices } from "@/lib/hooks/useDevices"

const DEVICE_COLORS: Record<string, string> = {
  "dev-1": "var(--color-chart-teal)",
  "dev-2": "var(--color-chart-sand)",
  "dev-3": "var(--color-chart-ink)",
}

export function CurrentReadingsChart() {
  const history = useCurrentHistory()
  const { devices } = useDevices()
  const [selectedId, setSelectedId] = useState<string>("all")

  const options = useMemo(
    () => [
      { value: "all" as const, label: "All" },
      ...devices.map((d) => ({
        value: d.id,
        label: d.name.split(" ").pop() ?? d.name,
      })),
    ],
    [devices]
  )

  const deviceIds = useMemo(
    () => (selectedId === "all" ? devices.map((d) => d.id) : [selectedId]),
    [devices, selectedId]
  )

  const chartData = useMemo(() => {
    const times = [...new Set(history.map((h) => h.time))].sort()
    return times.map((time) => {
      const row: Record<string, string | number> = {
        time: new Date(time).getTime(),
      }
      for (const id of deviceIds) {
        const reading = history.find((h) => h.time === time && h.deviceId === id)
        row[id] = reading?.current ?? 0
      }
      return row
    })
  }, [history, deviceIds])

  const deviceNames = useMemo(() => {
    const map: Record<string, string> = {}
    for (const d of devices) map[d.id] = d.name
    return map
  }, [devices])

  return (
    <Panel className="h-full flex flex-col">
      <PanelHeader
        title="Current draw"
        action={
          <SegmentControl
            value={selectedId}
            onChange={setSelectedId}
            options={options}
          />
        }
      />
      <PanelBody className="flex-1 pt-2 pb-4">
        <p className="text-xs text-[var(--color-muted-foreground)] mb-4 -mt-1">
          ACS712 sensor · 3s interval
        </p>
        <div className="w-full h-[min(340px,42vh)]">
          {chartData.length < 2 ? (
            <div className="h-full flex items-center justify-center text-sm text-[var(--color-muted-foreground)]">
              Warming up…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
              >
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(v) => format(new Date(v), "h:mm")}
                  stroke="var(--color-chart-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  tickFormatter={(v) => `${Number(v).toFixed(1)}`}
                  stroke="var(--color-chart-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  unit=" A"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  }}
                  labelFormatter={(v) =>
                    format(new Date(v as number), "h:mm:ss a")
                  }
                  formatter={(value: unknown, name: unknown) => {
                    const v = typeof value === "number" ? value : Number(value)
                    const id = String(name)
                    return [`${v.toFixed(2)} A`, deviceNames[id] ?? id]
                  }}
                />
                {deviceIds.map((id) => (
                  <Line
                    key={id}
                    type="monotone"
                    dataKey={id}
                    name={deviceNames[id] ?? id}
                    stroke={DEVICE_COLORS[id] ?? "var(--color-chart-muted)"}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    animationDuration={400}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </PanelBody>
    </Panel>
  )
}
