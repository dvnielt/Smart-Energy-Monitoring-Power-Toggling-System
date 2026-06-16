import { useDevices } from "@/lib/hooks/useDevices"
import { DeviceWidget } from "./DeviceWidget"

export function DeviceGrid() {
  const { devices, toggleDevice } = useDevices()

  return (
    <div className="flex flex-col gap-3">
      {devices.map((d, i) => (
        <div
          key={d.id}
          className="page-enter"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <DeviceWidget device={d} onToggle={toggleDevice} />
        </div>
      ))}
    </div>
  )
}
