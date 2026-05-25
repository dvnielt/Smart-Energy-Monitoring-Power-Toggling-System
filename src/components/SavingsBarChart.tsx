import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useThirtyDayAggregates } from "@/lib/hooks/useThirtyDayAggregates"

export function SavingsBarChart() {
  const bars = useThirtyDayAggregates()
  const peak = bars.find((b) => b.label === "Avg Peak Cost")?.value ?? 0
  const ours = bars.find((b) => b.label === "With Our Device")?.value ?? 0
  const savings = Math.max(0, peak - ours)

  return (
    <Card>
      <CardHeader>
        <CardTitle>30-Day Cost Comparison</CardTitle>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Average electricity cost per kWh across pricing tiers
        </p>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 380 }}>
          <ResponsiveContainer>
            <BarChart
              data={bars}
              margin={{ top: 30, right: 24, bottom: 8, left: 8 }}
              barCategoryGap="20%"
            >
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                stroke="#6b7280"
                fontSize={11}
                interval={0}
                tickMargin={8}
                height={56}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tickFormatter={(v) => `$${Number(v).toFixed(3)}`}
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null
                  const p = payload[0].payload as (typeof bars)[number]
                  return (
                    <div className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 shadow-md text-sm">
                      <div className="font-semibold">{p.label}</div>
                      <div className="tabular-nums">
                        ${p.value.toFixed(3)} /kWh
                      </div>
                      <div className="text-xs text-[var(--color-muted-foreground)] mt-1 max-w-[220px]">
                        {p.description}
                      </div>
                    </div>
                  )
                }}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                label={{
                  position: "top",
                  fontSize: 12,
                  fill: "#111827",
                  fontWeight: 600,
                  formatter: (v: unknown) =>
                    typeof v === "number" ? `$${v.toFixed(3)}` : "",
                }}
              >
                {bars.map((b, i) => (
                  <Cell key={i} fill={b.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {bars.length > 0 && (
          <div className="mt-4 text-sm text-[var(--color-foreground)]">
            Using your smart plug saves an estimated{" "}
            <span className="font-semibold">${savings.toFixed(3)} per kWh</span>{" "}
            versus average peak rates.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
