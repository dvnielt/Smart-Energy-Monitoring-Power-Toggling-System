import { useMemo, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  const { data } = useDayUsage(selectedDate)

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 flex-wrap">
        <div>
          <CardTitle>Usage vs. Electricity Rate</CardTitle>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            24-hour view — the device runs when rates dip.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
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
            variant="secondary"
            size="sm"
            onClick={() => setSelectedDate(today)}
          >
            Today
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 380 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 24, bottom: 16, left: 8 }}
            >
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                ticks={ticks}
                tickFormatter={(v) => format(new Date(v), "h:mm a")}
                angle={-30}
                textAnchor="end"
                height={50}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                stroke="#3b82f6"
                fontSize={12}
                label={{
                  value: "$/kWh",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#3b82f6", fontSize: 12 },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 1]}
                ticks={[0, 1]}
                tickFormatter={(v) => (v === 1 ? "On" : "Off")}
                stroke="#10b981"
                fontSize={12}
                label={{
                  value: "Device Active",
                  angle: 90,
                  position: "insideRight",
                  style: { fill: "#10b981", fontSize: 12 },
                }}
              />
              <Tooltip
                labelFormatter={(v) => format(new Date(v as number), "h:mm a")}
                formatter={(value: unknown, name: unknown) => {
                  const v = typeof value === "number" ? value : Number(value)
                  if (name === "rate") return [`$${v.toFixed(3)}`, "Rate"]
                  return [v === 1 ? "On" : "Off", "Device"]
                }}
              />
              <Legend verticalAlign="top" height={32} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="rate"
                name="Electricity Rate"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="step"
                dataKey="active"
                name="Device Active"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
