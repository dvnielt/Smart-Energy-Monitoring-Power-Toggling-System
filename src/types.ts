export type RatePeriod = "peak" | "off-peak" | "mid-peak"

export type ControlMode = "auto" | "manual"

export type Device = {
  id: string
  name: string
  applianceType: string
  isOn: boolean
  isOnline: boolean
  controlMode: ControlMode
  voltage: number
  current: number
  powerDraw: number
  ratePeriod: RatePeriod
  currentRate: number
  lastUpdated: string
}

export type CurrentReading = {
  time: string
  deviceId: string
  deviceName: string
  current: number
}

export type UsagePoint = {
  time: string
  ratePerKwh: number
  deviceActive: number
}

export type SavingsBar = {
  label: string
  value: number
  description: string
  color: string
}
