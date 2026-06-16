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

import { Panel, PanelBody, PanelHeader } from "@/components/Panel"
import { useThirtyDayAggregates } from "@/lib/hooks/useThirtyDayAggregates"

const BAR_COLORS = [
  "hsl(0 45% 58%)",
  "var(--color-chart-sand)",
  "var(--color-chart-muted)",
  "var(--color-chart-teal)",
]

export function SavingsBarChart() {
  const bars = useThirtyDayAggregates()
  const peak = bars.find((b) => b.label === "Avg Peak Cost")?.value ?? 0
  const ours = bars.find((b) => b.label === "With Our Device")?.value ?? 0
  const savings = Math.max(0, peak - ours)

  const shortLabels = bars.map((b) => {
    if (b.label === "Avg Peak Cost") return "Peak"
    if (b.label === "Avg Median Cost") return "Median"
    if (b.label === "Avg Off-Peak Cost") return "Off-peak"
    return "Our device"
  })

  const chartData = bars.map((b, i) => ({
    ...b,
    shortLabel: shortLabels[i],
  }))

  return (
    <Panel className="h-full flex flex-col">
      <PanelHeader title="30-day savings" />
      <PanelBody className="flex-1 flex flex-col pt-2">
        <div className="w-full flex-1 min-h-[min(300px,38vh)]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 24, right: 8, bottom: 4, left: 0 }}
              barCategoryGap="28%"
            >
              <CartesianGrid
                stroke="var(--color-border)"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="shortLabel"
                stroke="var(--color-chart-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <YAxis
                tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                stroke="var(--color-chart-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const p = payload[0].payload as (typeof chartData)[number]
                  return (
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                      <div className="font-medium mb-0.5">{p.label}</div>
                      <div className="font-mono">${p.value.toFixed(3)}/kWh</div>
                    </div>
                  )
                }}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                animationDuration={600}
                label={{
                  position: "top",
                  fontSize: 10,
                  fill: "var(--color-muted-foreground)",
                  formatter: (v: unknown) =>
                    typeof v === "number" ? `$${v.toFixed(2)}` : "",
                }}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i] ?? "var(--color-chart-muted)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {bars.length > 0 && (
          <p className="mt-4 pt-4 border-t border-[var(--color-border)]/70 text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            Estimated savings of{" "}
            <span className="font-mono font-medium text-[var(--color-foreground)]">
              ${savings.toFixed(3)}/kWh
            </span>{" "}
            vs. peak rates
          </p>
        )}
      </PanelBody>
    </Panel>
  )
}
