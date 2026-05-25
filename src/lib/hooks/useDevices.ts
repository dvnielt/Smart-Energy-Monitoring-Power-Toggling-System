import { useEffect, useState, useCallback } from "react"
import { dataSource } from "@/lib/dataSource"
import type { Device } from "@/types"

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([])

  useEffect(() => {
    let mounted = true
    dataSource.getDevices().then((d) => {
      if (mounted) setDevices(d)
    })
    const unsub = dataSource.subscribeToDevices((d) => {
      if (mounted) setDevices(d)
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [])

  const toggleDevice = useCallback(async (id: string, nextState: boolean) => {
    return dataSource.toggleDevice(id, nextState)
  }, [])

  return { devices, toggleDevice }
}
