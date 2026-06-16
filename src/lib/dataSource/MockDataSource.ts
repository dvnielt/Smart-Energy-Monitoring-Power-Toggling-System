/**
 * MockDataSource
 * ---------------
 * In-memory implementation of the DataSource contract used for the demo build.
 * A teammate will write an ApiDataSource that hits the Raspberry Pi backend; the
 * eventual REST endpoints will likely look like:
 *
 *   GET    /devices                           -> Device[]
 *   POST   /devices/:id/toggle  { isOn }      -> Device
 *   WS     /devices/stream                    -> Device[]   (live readings)
 *   GET    /usage?date=YYYY-MM-DD             -> UsagePoint[]
 *   GET    /usage/range?start=...&end=...     -> UsagePoint[]
 *
 * All method signatures are async so swapping in real HTTP calls is mechanical.
 */
import type { Device, RatePeriod, UsagePoint } from "@/types"
import type { DataSource } from "./types"

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function periodForRate(rate: number): RatePeriod {
  if (rate >= 0.28) return "peak"
  if (rate >= 0.15) return "mid-peak"
  return "off-peak"
}

function currentTouRate(): { rate: number; period: RatePeriod } {
  const now = new Date()
  const hour = now.getHours() + now.getMinutes() / 60
  const { rate } = ratePeriodForHour(hour, 0)
  return { rate: parseFloat(rate.toFixed(3)), period: periodForRate(rate) }
}

// Tiny seeded PRNG so the same date returns the same shape on reselect.
function makeRng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function ratePeriodForHour(hour: number, jitter: number): { rate: number; active: number } {
  // Base TOU curve from spec.
  let base: number
  if (hour < 6) base = 0.10
  else if (hour < 10) base = 0.15 + (hour - 6) * 0.0175
  else if (hour < 14) base = 0.22 + (hour - 10) * 0.015
  else if (hour < 19) base = 0.30 + Math.sin(((hour - 14) / 5) * Math.PI) * 0.07
  else if (hour < 22) base = 0.20 - (hour - 19) * 0.0167
  else base = 0.11

  const rate = Math.max(0.08, base + jitter)
  return { rate, active: 0 }
}

export class MockDataSource implements DataSource {
  private devices: Device[]
  private subscribers = new Set<(d: Device[]) => void>()
  private interval: ReturnType<typeof setInterval> | null = null

  constructor() {
    const now = new Date().toISOString()
    const { rate, period } = currentTouRate()
    this.devices = [
      {
        id: "dev-1",
        name: "Living Room AC",
        applianceType: "Air Conditioner",
        isOn: true,
        isOnline: true,
        controlMode: "auto",
        voltage: 119.8,
        current: 6.42,
        powerDraw: 769,
        ratePeriod: period,
        currentRate: rate,
        lastUpdated: now,
      },
      {
        id: "dev-2",
        name: "Garage Dryer",
        applianceType: "Clothes Dryer",
        isOn: false,
        isOnline: true,
        controlMode: "manual",
        voltage: 120.1,
        current: 0,
        powerDraw: 0,
        ratePeriod: period,
        currentRate: rate,
        lastUpdated: now,
      },
      {
        id: "dev-3",
        name: "Kitchen Dishwasher",
        applianceType: "Dishwasher",
        isOn: true,
        isOnline: false,
        controlMode: "auto",
        voltage: 119.5,
        current: 9.81,
        powerDraw: 1173,
        ratePeriod: period,
        currentRate: rate,
        lastUpdated: now,
      },
    ]
  }

  async getDevices(): Promise<Device[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(this.snapshotDevices()), 150)
    )
  }

  async toggleDevice(id: string, nextState: boolean): Promise<Device> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const dev = this.devices.find((d) => d.id === id)
        if (!dev) {
          reject(new Error(`Device ${id} not found`))
          return
        }
        dev.isOn = nextState
        dev.controlMode = "manual"
        if (!nextState) {
          dev.current = 0
          dev.powerDraw = 0
        } else {
          // Restore a reasonable default current when turning on.
          dev.current = parseFloat(rand(5, 10).toFixed(2))
          dev.powerDraw = Math.round(dev.voltage * dev.current)
        }
        dev.lastUpdated = new Date().toISOString()
        this.emit()
        resolve({ ...dev })
      }, 150)
    })
  }

  subscribeToDevices(callback: (devices: Device[]) => void): () => void {
    this.subscribers.add(callback)
    // Push initial snapshot.
    callback(this.snapshotDevices())
    if (!this.interval) {
      this.interval = setInterval(() => this.tick(), 3000)
    }
    return () => {
      this.subscribers.delete(callback)
      if (this.subscribers.size === 0 && this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }
    }
  }

  async getDayUsage(date: Date): Promise<UsagePoint[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(this.generateDayData(date)), 150)
    )
  }

  async getRange(startDate: Date, endDate: Date): Promise<UsagePoint[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const out: UsagePoint[] = []
        const cursor = new Date(startDate)
        cursor.setHours(0, 0, 0, 0)
        const end = new Date(endDate)
        end.setHours(0, 0, 0, 0)
        while (cursor.getTime() <= end.getTime()) {
          out.push(...this.generateDayData(new Date(cursor)))
          cursor.setDate(cursor.getDate() + 1)
        }
        resolve(out)
      }, 150)
    })
  }

  // --- private ---

  private snapshotDevices(): Device[] {
    return this.devices.map((d) => ({ ...d }))
  }

  private emit() {
    const snap = this.snapshotDevices()
    this.subscribers.forEach((cb) => cb(snap))
  }

  private tick() {
    const now = new Date().toISOString()
    const { rate, period } = currentTouRate()

    // Simulate occasional reconnect for offline device
    for (const dev of this.devices) {
      if (!dev.isOnline && Math.random() < 0.08) {
        dev.isOnline = true
      }
    }

    for (const dev of this.devices) {
      dev.ratePeriod = period
      dev.currentRate = rate

      if (!dev.isOnline) continue

      if (!dev.isOn) {
        dev.voltage = parseFloat((120 + (Math.random() - 0.5) * 0.3).toFixed(1))
        dev.current = 0
        dev.powerDraw = 0
        dev.lastUpdated = now
        continue
      }
      dev.voltage = parseFloat(
        Math.max(115, Math.min(125, dev.voltage + (Math.random() - 0.5) * 0.6)).toFixed(1)
      )
      dev.current = parseFloat(
        Math.max(0.1, dev.current + (Math.random() - 0.5) * 0.3).toFixed(2)
      )
      dev.powerDraw = Math.round(dev.voltage * dev.current)
      dev.lastUpdated = now
    }
    this.emit()
  }

  private generateDayData(date: Date): UsagePoint[] {
    const seed = date.getDate() * 31 + (date.getMonth() + 1) * 137 + date.getFullYear()
    const rng = makeRng(seed)
    // Per-day offset to vary the curve slightly.
    const dayOffset = (rng() - 0.5) * 0.03

    const points: UsagePoint[] = []
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)

    // First pass: compute rates.
    const rates: number[] = []
    for (let i = 0; i < 96; i++) {
      const t = new Date(start.getTime() + i * 15 * 60 * 1000)
      const hour = t.getHours() + t.getMinutes() / 60
      const jitter = (rng() - 0.5) * 0.02 + dayOffset
      const { rate } = ratePeriodForHour(hour, jitter)
      rates.push(rate)
    }

    // Second pass: pick deviceActive windows.
    // The device targets the cheapest quarters of the day so the "With Our Device"
    // average lands at or below the daily minimum tier.
    // Strategy: rank all quarters by rate, mark the cheapest ~20% (overnight-ish)
    // as active. Always off during 14:00-19:00 peak.
    const ranked = rates
      .map((r, i) => ({ r, i }))
      .sort((a, b) => a.r - b.r)
    const targetCount = Math.floor(96 * 0.22)
    const activeSet = new Set<number>()
    for (const { i } of ranked) {
      const hr = new Date(start.getTime() + i * 15 * 60 * 1000).getHours()
      if (hr >= 14 && hr < 19) continue
      activeSet.add(i)
      if (activeSet.size >= targetCount) break
    }

    for (let i = 0; i < 96; i++) {
      const t = new Date(start.getTime() + i * 15 * 60 * 1000)
      points.push({
        time: t.toISOString(),
        ratePerKwh: parseFloat(rates[i].toFixed(4)),
        deviceActive: activeSet.has(i) ? 1 : 0,
      })
    }
    return points
  }
}

export { periodForRate }
