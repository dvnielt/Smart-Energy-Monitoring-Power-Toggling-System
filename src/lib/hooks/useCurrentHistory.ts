import { useEffect, useState } from "react"
import { dataSource } from "@/lib/dataSource"
import type { CurrentReading } from "@/types"

const MAX_POINTS = 40

export function useCurrentHistory() {
  const [history, setHistory] = useState<CurrentReading[]>([])

  useEffect(() => {
    const unsub = dataSource.subscribeToDevices((devices) => {
      const now = new Date().toISOString()
      setHistory((prev) => {
        const next = [...prev]
        for (const d of devices) {
          if (!d.isOnline) continue
          next.push({
            time: now,
            deviceId: d.id,
            deviceName: d.name,
            current: d.current,
          })
        }
        return next.slice(-MAX_POINTS * devices.length)
      })
    })
    return unsub
  }, [])

  return history
}
