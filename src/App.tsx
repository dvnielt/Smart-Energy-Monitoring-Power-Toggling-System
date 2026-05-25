import { Header } from "@/components/Header"
import { DeviceGrid } from "@/components/DeviceGrid"
import { UsageRateChart } from "@/components/UsageRateChart"
import { SavingsBarChart } from "@/components/SavingsBarChart"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

function App() {
  return (
    <div className="min-h-full bg-[var(--color-background)]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        <Section title="Connected Devices">
          <DeviceGrid />
        </Section>
        <Section title="Usage vs. Electricity Rate">
          <UsageRateChart />
        </Section>
        <Section title="Off-Peak Savings Comparison">
          <SavingsBarChart />
        </Section>
      </main>
    </div>
  )
}

export default App
