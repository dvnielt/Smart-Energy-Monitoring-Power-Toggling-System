import type { Device, UsagePoint } from "@/types"

export interface DataSource {
  getDevices(): Promise<Device[]>
  toggleDevice(id: string, nextState: boolean): Promise<Device>
  subscribeToDevices(callback: (devices: Device[]) => void): () => void

  getDayUsage(date: Date): Promise<UsagePoint[]>
  getRange(startDate: Date, endDate: Date): Promise<UsagePoint[]>
}
