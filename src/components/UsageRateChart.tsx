import { useMemo, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Panel, PanelBody, PanelHeader } from "@/components/Panel"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useDayUsage } from "@/lib/hooks/useDayUsage"

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function UsageRateChart() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()))
  const [open, setOpen] = useState(false)
  const { data, loading } = useDayUsage(selectedDate)

  const today = useMemo(() => startOfDay(new Date()), [])
  const minDate = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() - 30)
    return d
  }, [today])

  const chartData = useMemo(
    () =>
      data.map((p) => ({
        time: new Date(p.time).getTime(),
        rate: p.ratePerKwh,
        active: p.deviceActive,
      })),
    [data]
  )

  const ticks = useMemo(() => {
    if (!chartData.length) return []
    const t: number[] = []
    for (let h = 0; h <= 24; h += 3) {
      const d = new Date(selectedDate)
      d.setHours(h, 0, 0, 0)
      if (h === 24) d.setDate(d.getDate() + 1)
      t.push(d.getTime())
    }
    return t
  }, [chartData, selectedDate])

  const dateControls = (
    <div className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-8 text-xs font-normal">
            <CalendarIcon className="h-3.5 w-3.5 opacity-60" />
            {format(selectedDate, "MMM d, yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => {
              if (d) {
                setSelectedDate(startOfDay(d))
                setOpen(false)
              }
            }}
            disabled={{ before: minDate, after: today }}
          />
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs"
        onClick={() => setSelectedDate(today)}
      >
        Today
      </Button>
    </div>
  )

  return (
    <Panel>
      <PanelHeader title="Rate vs. usage" action={dateControls} />
      <PanelBody className="pt-2">
        <div className="flex gap-4 text-[11px] text-[var(--color-muted-foreground)] mb-4 -mt-1">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-[var(--color-chart-ink)]" />
            Rate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-[var(--color-chart-teal)]" />
            Device active
          </span>
        </div>

        <div className="w-full h-[min(360px,45vh)]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-sm text-[var(--color-muted-foreground)]">
              Loading…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
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
                  ticks={ticks}
                  tickFormatter={(v) => format(new Date(v), "ha")}
                  stroke="var(--color-chart-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                  stroke="var(--color-chart-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 1]}
                  ticks={[0, 1]}
                  tickFormatter={(v) => (v === 1 ? "On" : "Off")}
                  stroke="var(--color-chart-muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  }}
                  labelFormatter={(v) => format(new Date(v as number), "h:mm a")}
                  formatter={(value: unknown, name: unknown) => {
                    const v = typeof value === "number" ? value : Number(value)
                    if (name === "rate") return [`$${v.toFixed(3)}`, "Rate"]
                    return [v === 1 ? "On" : "Off", "Device"]
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rate"
                  name="rate"
                  stroke="var(--color-chart-ink)"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={500}
                />
                <Line
                  yAxisId="right"
                  type="step"
                  dataKey="active"
                  name="active"
                  stroke="var(--color-chart-teal)"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </PanelBody>
    </Panel>
  )
}
