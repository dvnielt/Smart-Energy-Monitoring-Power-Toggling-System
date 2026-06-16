import { useEffect, useState } from "react"

export function DashboardFooter() {
  const [lastSync, setLastSync] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setLastSync(new Date()), 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer className="mt-auto border-t border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-[var(--color-muted-foreground)]">
        <span>Mock data · ESP32 integration pending</span>
        <span className="font-mono tabular-nums">
          Synced {lastSync.toLocaleTimeString()}
        </span>
      </div>
    </footer>
  )
}
