import { useEffect, useState } from "react"
import { dataSource } from "@/lib/dataSource"
import type { SavingsBar, UsagePoint } from "@/types"

function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function groupByDay(points: UsagePoint[]): Map<string, UsagePoint[]> {
  const map = new Map<string, UsagePoint[]>()
  for (const p of points) {
    const key = p.time.slice(0, 10)
    const arr = map.get(key) ?? []
    arr.push(p)
    map.set(key, arr)
  }
  return map
}

export function useThirtyDayAggregates() {
  const [bars, setBars] = useState<SavingsBar[]>([])

  useEffect(() => {
    const end = new Date()
    end.setDate(end.getDate() - 1)
    end.setHours(0, 0, 0, 0)
    const start = new Date(end)
    start.setDate(start.getDate() - 29)

    dataSource.getRange(start, end).then((points) => {
      const days = groupByDay(points)
      const dailyMax: number[] = []
      const dailyMin: number[] = []
      const dailyMedian: number[] = []
      const dailyDeviceAvg: number[] = []
      for (const dayPoints of days.values()) {
        const rates = dayPoints.map((p) => p.ratePerKwh)
        dailyMax.push(Math.max(...rates))
        dailyMin.push(Math.min(...rates))
        dailyMedian.push(median(rates))
        const active = dayPoints.filter((p) => p.deviceActive === 1)
        if (active.length > 0) {
          dailyDeviceAvg.push(
            active.reduce((s, p) => s + p.ratePerKwh, 0) / active.length
          )
        }
      }
      const avg = (nums: number[]) =>
        nums.reduce((a, b) => a + b, 0) / nums.length

      setBars([
        {
          label: "Avg Peak Cost",
          value: avg(dailyMax),
          description:
            "Average of each day's single highest $/kWh over the last 30 days.",
          color: "#ef4444",
        },
        {
          label: "Avg Median Cost",
          value: avg(dailyMedian),
          description:
            "Average of each day's median $/kWh over the last 30 days.",
          color: "#f59e0b",
        },
        {
          label: "Avg Off-Peak Cost",
          value: avg(dailyMin),
          description:
            "Average of each day's single lowest $/kWh over the last 30 days.",
          color: "#3b82f6",
        },
        {
          label: "With Our Device",
          value: avg(dailyDeviceAvg),
          description:
            "Average $/kWh paid when our smart plug had the appliance running.",
          color: "#10b981",
        },
      ])
    })
  }, [])

  return bars
}
