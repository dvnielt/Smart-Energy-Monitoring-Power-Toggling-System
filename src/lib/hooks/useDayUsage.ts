import { useEffect, useState } from "react"
import { dataSource } from "@/lib/dataSource"
import type { UsagePoint } from "@/types"

export function useDayUsage(date: Date) {
  const [data, setData] = useState<UsagePoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    dataSource.getDayUsage(date).then((d) => {
      if (mounted) {
        setData(d)
        setLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [date])

  return { data, loading }
}
