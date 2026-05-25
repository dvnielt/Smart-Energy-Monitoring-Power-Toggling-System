import { Zap } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-[var(--color-border)] bg-white">
      <div className="max-w-7xl mx-auto px-4 py-5 flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-[var(--color-primary)] text-white flex items-center justify-center">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Smart Energy Dashboard
          </h1>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Team 10 — Senior Design II
          </p>
        </div>
      </div>
    </header>
  )
}
