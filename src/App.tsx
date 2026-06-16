import { Header } from "@/components/Header"
import { DeviceGrid } from "@/components/DeviceGrid"
import { UsageRateChart } from "@/components/UsageRateChart"
import { SavingsBarChart } from "@/components/SavingsBarChart"
import { CurrentReadingsChart } from "@/components/CurrentReadingsChart"
import { DashboardFooter } from "@/components/DashboardFooter"

function App() {
  return (
    <div className="min-h-full flex flex-col grain">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
          {/* Devices — left column on wide screens */}
          <section className="xl:col-span-5 page-enter">
            <div className="mb-4">
              <h2 className="font-display text-lg font-semibold tracking-[-0.02em]">
                Devices
              </h2>
            </div>
            <DeviceGrid />
          </section>

          {/* Live current — right column, spans full height feel */}
          <section className="xl:col-span-7 page-enter page-enter-delay-1">
            <CurrentReadingsChart />
          </section>

          {/* Analytics row */}
          <section className="xl:col-span-7 page-enter page-enter-delay-2">
            <UsageRateChart />
          </section>

          <section className="xl:col-span-5 page-enter page-enter-delay-3">
            <SavingsBarChart />
          </section>
        </div>
      </main>

      <DashboardFooter />
    </div>
  )
}

export default App
