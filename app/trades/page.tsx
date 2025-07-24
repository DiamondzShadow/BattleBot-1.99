import { AppLayout } from "@/components/app-layout"
import { LiveTrades } from "@/components/live-trades"

export default function TradesPage() {
  return (
    <AppLayout>
      <section className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Active Trades</h1>
        <p className="text-xl text-muted-foreground">Monitor and manage your active trading positions</p>
      </section>

      <LiveTrades />
    </AppLayout>
  )
}
