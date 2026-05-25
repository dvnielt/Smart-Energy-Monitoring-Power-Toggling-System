import { useDevices } from "@/lib/hooks/useDevices"
import { DeviceWidget } from "./DeviceWidget"

export function DeviceGrid() {
  const { devices, toggleDevice } = useDevices()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {devices.map((d) => (
        <DeviceWidget key={d.id} device={d} onToggle={toggleDevice} />
      ))}
    </div>
  )
}
