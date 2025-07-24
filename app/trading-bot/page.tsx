import { TradingBotControl } from "@/components/trading-bot-control"
import { TrendingTokens } from "@/components/trending-tokens"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
// Import the ActiveTrades component
import { ActiveTrades } from "@/components/active-trades"

export const metadata = {
  title: "Trading Bot | Blockchain Trading Analysis",
  description: "Automated trading bot for cryptocurrency markets",
}

export default function TradingBotPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Trading Bot</h1>

      <Alert variant="warning" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Risk Warning</AlertTitle>
        <AlertDescription>
          Automated trading involves significant risk. Only use funds you can afford to lose. Past performance is not
          indicative of future results.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TradingBotControl />
        </div>
        <div>
          <TrendingTokens />
        </div>
      </div>

      <div className="mt-8">
        <ActiveTrades />
      </div>
    </div>
  )
}
