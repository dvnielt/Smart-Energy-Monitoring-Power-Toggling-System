# Smart Energy Dashboard

Web companion app for the **Smart Energy Monitoring & Power Toggling System** — an ESP32-based smart plug built for FIU's EEL-4920 Senior Design II (Team 10). The plug sits between a wall outlet and a residential appliance, pulls live Time-of-Use (TOU) electricity pricing data, and automatically toggles power to shift usage to off-peak hours. This dashboard shows device status, live electrical readings, a 24-hour usage vs. rate graph, and a 30-day cost-comparison bar chart that quantifies how much the smart plug saves vs. average peak rates.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS** (v4 via `@tailwindcss/vite`)
- **shadcn/ui** primitives (Card, Button, Popover, Calendar)
- **Recharts** for the line and bar charts
- **date-fns** for time formatting
- **lucide-react** for icons

## Run

```sh
npm install
npm run dev
```

Open the printed URL (default <http://localhost:5173>).

## Mock data note

All data on the dashboard is currently mocked through `src/lib/dataSource/MockDataSource.ts`. A Raspberry Pi backend will be wired in later as an `ApiDataSource` — the swap is a one-line change in `src/lib/dataSource/index.ts`. Components only ever consume the `dataSource` instance via hooks, so the implementation can change without touching any UI code.
