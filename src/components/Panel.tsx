import { cn } from "@/lib/utils"

export function Panel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "surface-panel overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function PanelHeader({
  title,
  action,
  className,
}: {
  title: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--color-border)]/70",
        className
      )}
    >
      <h3 className="font-display text-[15px] font-semibold tracking-[-0.01em]">
        {title}
      </h3>
      {action}
    </div>
  )
}

export function PanelBody({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn("p-5", className)}>{children}</div>
}

export function SegmentControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="inline-flex p-0.5 rounded-lg bg-[var(--color-muted)] gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1 rounded-md text-xs font-medium transition-all duration-200",
            value === opt.value
              ? "bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
