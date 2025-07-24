import { ProductionBotControl } from "@/components/production-bot-control"
import { ProductionActiveTrades } from "@/components/production-active-trades"

export default function ProductionBotPage() {
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Production Trading Bot</h1>
      <p className="text-muted-foreground">
        Real-time trading bot that pulls trending tokens from DEXTools and BullMe, simulates round-trip swaps, and
        executes profitable trades.
      </p>

      <div className="grid grid-cols-1 gap-6">
        <ProductionBotControl />
        <ProductionActiveTrades />
      </div>
    </div>
  )
}
