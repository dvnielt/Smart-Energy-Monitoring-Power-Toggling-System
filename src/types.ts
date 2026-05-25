export type RatePeriod = "peak" | "off-peak" | "mid-peak"

export type Device = {
  id: string
  name: string
  applianceType: string
  isOn: boolean
  voltage: number
  current: number
  powerDraw: number
  ratePeriod: RatePeriod
  currentRate: number
  lastUpdated: string
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
