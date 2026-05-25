# Smart Energy Monitoring Dashboard - Build Spec

## Project Context

This is the web dashboard for a Senior Design II project: a **Smart Energy Monitoring & Power Toggling System** (FIU EEL-4920, Team 10). The hardware is an ESP32-based smart plug that sits between a wall outlet and a residential appliance. It pulls live Time-of-Use (TOU) electricity pricing data and automatically toggles power to the appliance, shifting usage to off-peak hours so the user saves money without changing their habits. The dashboard is the web companion app users access to see device status, monitor savings, and manually override the device.

**This build is for a demo due tomorrow.** Functionality over polish. All data should be mocked / fake for now; a backend API on a Raspberry Pi will replace the mock data layer later, so structure the data fetching cleanly enough that swapping the source is trivial.

## Tech Stack

- **Vite + React** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for component primitives (Card, Button, Switch, Calendar, Popover, etc.)
- **Recharts** for the line graph and bar graph
- **date-fns** for date manipulation
- **lucide-react** for icons
- Single-page app, no routing needed
- No auth, no backend. Mock data lives in `src/lib/mockData.ts`

Initialize with `npm create vite@latest -- --template react-ts`, then install Tailwind and shadcn following their standard setup. Use the default shadcn theme (slate / neutral). Dark mode is not required, light mode only is fine.

## Overall Layout

Single-page dashboard, no sidebar, no nav. Top of page has a simple header (project name on the left: "Smart Energy Dashboard", small subtitle "Team 10 - Senior Design II"). Below the header, three sections in this order, stacked vertically with generous spacing:

1. **Connected Devices** section: a grid of device widget cards (responsive, 1 column on mobile, 2 on tablet, 3 on desktop)
2. **Usage vs. Electricity Rate** section: the dual-line graph card, full width
3. **Off-Peak Savings Comparison** section: the bar graph card, full width

Use a max-width container (`max-w-7xl mx-auto px-4 py-8`) so it doesn't sprawl on wide monitors. Each section gets a section heading (text-xl font-semibold) above its content.

## Component 1: Device Widget

**Purpose:** Show the state of one connected smart plug, expose a manual toggle button, and display the appliance's live electrical readings.

**Data shape (one device):**
```ts
type Device = {
  id: string;              // uuid
  name: string;            // e.g. "Living Room AC"
  applianceType: string;   // e.g. "Air Conditioner"
  isOn: boolean;           // current relay state
  voltage: number;         // volts, e.g. 119.8
  current: number;         // amps, e.g. 6.42
  powerDraw: number;       // watts, computed or from sensor, e.g. 769
  ratePeriod: "peak" | "off-peak" | "mid-peak"; // current TOU bucket for this device's location
  currentRate: number;     // $/kWh right now, e.g. 0.32
  lastUpdated: string;     // ISO timestamp
};
```

**Mock data:** Create at least 3 sample devices with different states. Examples:
- "Living Room AC" / Air Conditioner / ON / 119.8V / 6.42A / 769W / peak / $0.32
- "Garage Dryer" / Clothes Dryer / OFF / 120.1V / 0.0A / 0W / peak / $0.32
- "Kitchen Dishwasher" / Dishwasher / ON / 119.5V / 9.81A / 1173W / off-peak / $0.11

**Widget visual layout (each card):**
- Card with padding (use shadcn `Card`, `CardHeader`, `CardContent`)
- Top row: appliance name (font-semibold text-lg) on the left, status pill on the right showing "ON" (green bg) or "OFF" (gray bg)
- Below name: small muted text showing applianceType
- A divider, then a 2-column grid of readings:
  - Voltage: `119.8 V`
  - Current: `6.42 A`
  - Power: `769 W` (this one slightly larger / bolder, it's the headline number)
  - Rate: `$0.32 /kWh` with a small colored dot indicating ratePeriod (red=peak, yellow=mid-peak, green=off-peak)
- Bottom row: a full-width shadcn `Button` that says "Turn Off" or "Turn On" depending on state. Clicking it calls `toggleDevice(id, !isOn)` from the `useDevices` hook. The button should be disabled briefly while the promise resolves (set a local `pending` state). When OFF, current and powerDraw should be 0 (the data source handles this on toggle).
- Small muted timestamp under the button: "Updated 12s ago" (compute from `lastUpdated`)

**Auto-update simulation:** Live readings update every 3 seconds via the `subscribeToDevices` subscription on `MockDataSource` (see Data Source Abstraction below). For each device that is `isOn`, jitter voltage by +/- 0.3V, current by +/- 0.15A, and recompute `powerDraw = voltage * current` rounded to nearest whole watt. Devices that are off stay at 0/0/0. Components do not own the interval; the data source does.

**Multiple devices:** Render the device list with `.map()` over a `devices` array in state. The grid should handle 1 to N devices gracefully.

## Component 2: Usage vs. Rate Line Graph

**Purpose:** Show a 24-hour view of the electricity cost rate alongside when the device(s) were actually running. The visual story: our device runs when the rate line is low.

**Data shape:**
```ts
type UsagePoint = {
  time: string;           // ISO timestamp, 15-min increments
  ratePerKwh: number;     // $/kWh at that moment
  deviceActive: number;   // 0 or 1 (or a fractional value if multiple devices, but start with 0/1)
};
```

96 data points per day (24 hours * 4 quarters). Mock a realistic TOU curve:
- 12am-6am: off-peak (~$0.09-0.12)
- 6am-10am: mid-peak ramping up (~$0.15-0.22)
- 10am-2pm: high mid-peak (~$0.22-0.28)
- 2pm-7pm: peak (~$0.30-0.38, with the spike around 5-6pm)
- 7pm-10pm: mid-peak descending (~$0.20-0.15)
- 10pm-12am: off-peak (~$0.10-0.12)

Add small random jitter (+/- $0.01) to make the curve feel real.

For `deviceActive`: set it to 1 during typical off-peak windows (overnight 11pm-6am, brief midday low around 11am-12pm) and during the cheapest mid-peak dips. Set it to 0 during the 2-7pm peak. The point is that the active segments should visibly overlap with the lower portions of the rate line.

**Generator function:** Write a `generateDayData(date: Date): UsagePoint[]` that returns 96 points for any given date. Vary the curve slightly day-to-day using the date as a seed so different selected days look different but consistent on reselect (use a simple hash like `date.getDate() * 31 + date.getMonth()` to seed pseudo-random offsets).

**Chart:**
- Recharts `LineChart` with two `Line` series, both using the same x-axis (time)
- Line 1 (rate): smooth line, colored a blue (`#3b82f6`), stroke width 2, no dots. Left Y-axis labeled "$/kWh", formatted as `$0.00`.
- Line 2 (device active): step line (`type="step"`), colored green (`#10b981`), stroke width 2, no dots. Right Y-axis labeled "Device Active", domain `[0, 1]`, ticks at 0 and 1 only, showing "Off" and "On" as labels.
- X-axis: time of day, formatted as `h:mm a` (e.g. "3:00 PM"). Show ticks every 3 hours (8 ticks total). Make sure ticks read horizontally; rotate -30 if needed.
- Tooltip: show time, rate as currency, and "Device: On/Off"
- Legend at the top
- Card height: 380px chart area, full width inside the card

**Calendar filter:**
- Above the chart inside the card header, place a shadcn `Popover` with a `Button` trigger showing the currently selected date (default to today). Button text format: "Aug 15, 2025" with a calendar icon.
- Popover contains a shadcn `Calendar` component (single date select)
- Restrict selectable dates: today minus 30 days through today, inclusive. Dates outside that range should be disabled.
- When the user picks a date, regenerate the chart data with `generateDayData(selectedDate)`.
- Also include a small "Today" button next to the date picker that resets to today.

## Component 3: Off-Peak Savings Bar Graph

**Purpose:** Hammer home the value prop: running the appliance through our device during off-peak hours saves real money compared to running it at peak, average, or even unmanaged off-peak times.

**Data shape:**
```ts
type SavingsBar = {
  label: string;
  value: number;        // $/kWh
  description: string;  // shown in tooltip
  color: string;
};
```

**The four bars (compute these from a 30-day mock dataset, see below):**

1. **"Avg Peak Cost"** - For each of the last 30 days, find the single highest `ratePerKwh` value. Take the average of those 30 daily-maximums. Color: red (`#ef4444`).
2. **"Avg Median Cost"** - For each of the last 30 days, find the median `ratePerKwh` across all 96 points. Take the average of those 30 daily-medians. Color: orange (`#f59e0b`).
3. **"Avg Off-Peak Cost"** - For each of the last 30 days, find the single lowest `ratePerKwh` value. Take the average of those 30 daily-minimums. Color: blue (`#3b82f6`).
4. **"With Our Device"** - For each of the last 30 days, take the average of `ratePerKwh` values *only at the 15-minute points where `deviceActive === 1`*. Then average those 30 daily averages. Color: green (`#10b981`).

The fourth bar should come out lowest (or close to the third) because the device intentionally only runs during cheap windows. If your generator is producing values where bar 4 isn't clearly the winner, tune the device-active windows in the generator to lock onto the lowest-rate quarters more aggressively.

**Compute on mount:** Generate 30 days of data once with `generateDayData()` (today minus 30 through yesterday), compute the four aggregates, and store in component state. Don't recompute on every render.

**Chart:**
- Recharts `BarChart`, vertical bars
- X-axis: the 4 labels
- Y-axis: `$/kWh`, formatted `$0.000`
- Each bar uses its own color (pass `fill` via a `Cell` per bar)
- Show the value on top of each bar (use Recharts `LabelList` with formatter `$0.000`)
- Tooltip: show the label, the value formatted as currency, and the description
- Card height: 380px chart, full width
- Card header: title "30-Day Cost Comparison" with a small muted subtitle "Average electricity cost per kWh across pricing tiers"
- Below the chart, a small callout / summary line: "Using your smart plug saves an estimated **$X.XX per kWh** versus average peak rates." Compute X.XX as `bar1.value - bar4.value`, formatted to 3 decimals.

## Data Source Abstraction (Critical)

The mock data must sit behind an interface so a teammate can wire in a real backend later by writing one new file, not by hunting through components. Build this from the start:

**`src/lib/dataSource/types.ts`** - the contract every implementation conforms to:
```ts
export interface DataSource {
  // Devices
  getDevices(): Promise<Device[]>;
  toggleDevice(id: string, nextState: boolean): Promise<Device>;
  subscribeToDevices(callback: (devices: Device[]) => void): () => void; // returns unsubscribe fn

  // Usage / rate timeseries
  getDayUsage(date: Date): Promise<UsagePoint[]>;
  getRange(startDate: Date, endDate: Date): Promise<UsagePoint[]>;
}
```

Every method returns a Promise even in the mock (use `Promise.resolve(...)` or a tiny `setTimeout` delay of ~150ms to make it realistic). The real backend will be async, so consuming components should already be written against async calls.

**`src/lib/dataSource/MockDataSource.ts`** - implements `DataSource` using the generator functions. The 3-second jitter for live readings happens here: the `subscribeToDevices` method spins up a `setInterval` that mutates the in-memory device array and fires the callback. `toggleDevice` updates the in-memory state and immediately fires the callback so the UI reflects the change. Return an unsubscribe function that clears the interval.

**`src/lib/dataSource/index.ts`** - exports a single configured instance:
```ts
import { MockDataSource } from "./MockDataSource";
// import { ApiDataSource } from "./ApiDataSource"; // teammate adds this later

export const dataSource: DataSource = new MockDataSource();
// To swap later: export const dataSource: DataSource = new ApiDataSource("http://pi.local:8000");
```

**Components consume `dataSource` only.** Never import `MockDataSource` directly from a component. Never call generator functions from a component. The swap to the real backend should be a one-line edit in `dataSource/index.ts`.

For consuming, write a couple of tiny hooks in `src/lib/hooks/` so components stay clean:
- `useDevices()` - calls `getDevices()` on mount, subscribes via `subscribeToDevices`, returns `{ devices, toggleDevice }` where `toggleDevice` is wired to `dataSource.toggleDevice`.
- `useDayUsage(date)` - calls `getDayUsage(date)` whenever `date` changes, returns `{ data, loading }`.
- `useThirtyDayAggregates()` - calls `getRange(today-30, yesterday)` once on mount, computes the four bar values, returns them.

## File Structure

```
src/
  App.tsx
  main.tsx
  index.css
  types.ts                       // Device, UsagePoint, SavingsBar
  components/
    Header.tsx
    DeviceWidget.tsx
    DeviceGrid.tsx
    UsageRateChart.tsx
    SavingsBarChart.tsx
    ui/                          // shadcn components
  lib/
    utils.ts                     // cn(), currency/time formatters
    dataSource/
      types.ts                   // DataSource interface
      MockDataSource.ts          // mock implementation with generators inline
      index.ts                   // exports configured dataSource instance
    hooks/
      useDevices.ts
      useDayUsage.ts
      useThirtyDayAggregates.ts
```

Keep components reasonably sized. `App.tsx` should be a thin composition file: header + three section components.

## Notes for the Build

- All data access must go through `dataSource`. No exceptions, no shortcuts. If a component needs data, it goes through a hook that uses `dataSource`.
- The 3-second jitter, the 30-day generator, the per-date seeding, all of that lives inside `MockDataSource` as private methods. It is implementation detail of the mock and not visible to the rest of the app.
- Write a brief comment block at the top of `MockDataSource.ts` explaining what each method returns and what the eventual API endpoints will likely look like, so the teammate writing `ApiDataSource` has a head start.
- Don't waste time on responsive perfection past tablet width. Desktop demo is the priority.
- Don't add loading skeletons, error states, empty states, or animations beyond what shadcn gives by default. Functionality only.
- No tests.
- Use `Number.toFixed(2)` or a small formatter helper for currency. Don't pull in a heavy i18n library.
- Tailwind: stick to default theme colors. The specific hex values called out above (for chart lines/bars) should be used directly in the Recharts components, not as Tailwind classes.

## Done Criteria

- `npm run dev` boots cleanly with no console errors
- Three device widgets render, each toggle button flips state and zeroes power readings when off
- Readings jitter every 3 seconds on active devices
- Line chart renders 96 points with both series visible, legend, axes, tooltip
- Calendar filter actually changes the chart data when a different date is picked, and limits selection to the last 30 days
- Bar chart renders 4 distinct bars in 4 colors with values labeled, and the "Our Device" bar is visibly the lowest
- Summary line under the bar chart shows a positive savings number

## Repo

Once it's running locally, init a git repo and push to GitHub as a public repo named `smart-energy-dashboard`. Include a one-paragraph README explaining what this is, what stack it uses, and how to run it (`npm install && npm run dev`). Note in the README that all data is currently mocked and that a Raspberry Pi backend will be wired in later.
