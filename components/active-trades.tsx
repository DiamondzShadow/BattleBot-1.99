"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { type Trade, TradeStatus } from "@/lib/trading-bot-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ActiveTrades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch active trades
  const fetchTrades = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/trading-bot/trades")
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const data = await response.json()
      setTrades(data.trades)
    } catch (error) {
      console.error("Error fetching active trades:", error)
      setError("Failed to fetch active trades")
    } finally {
      setLoading(false)
    }
  }

  // Load initial trades
  useEffect(() => {
    fetchTrades()
    const interval = setInterval(fetchTrades, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  // Get status badge variant
  const getStatusBadge = (status: TradeStatus) => {
    switch (status) {
      case TradeStatus.PENDING:
        return "outline"
      case TradeStatus.EXECUTING:
        return "secondary"
      case TradeStatus.ACTIVE:
        return "default"
      case TradeStatus.COMPLETED:
        return "success"
      case TradeStatus.FAILED:
        return "destructive"
      default:
        return "outline"
    }
  }

  // Get risk level badge
  const getRiskBadge = (level: number) => {
    const levels = ["cold", "warm", "hot", "steaming", "nova"]
    const level_name = levels[Math.min(level - 1, 4)]

    switch (level) {
      case 1:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400">
            {level_name}
          </Badge>
        )
      case 2:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
            {level_name}
          </Badge>
        )
      case 3:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400">
            {level_name}
          </Badge>
        )
      case 4:
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-400">
            {level_name}
          </Badge>
        )
      case 5:
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400">
            {level_name}
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Trades</CardTitle>
            <CardDescription>Currently active trading bot positions</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchTrades}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No active trades at the moment</div>
        ) : (
          <div className="space-y-4">
            {trades.map((trade) => (
              <div key={trade.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className="font-medium">{trade.tokenSymbol}</span>
                    <Badge variant={getStatusBadge(trade.status)} className="ml-2">
                      {trade.status}
                    </Badge>
                  </div>
                  {getRiskBadge(trade.riskLevel)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <span className="text-muted-foreground">Chain:</span> {trade.chain}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span> {trade.amount}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Entry Price:</span> {trade.entryPrice}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Price:</span> {trade.currentPrice || "N/A"}
                  </div>
                </div>

                {trade.profitLoss && (
                  <div className="flex items-center mt-2">
                    <span className="text-muted-foreground mr-2">P/L:</span>
                    <span
                      className={`flex items-center ${
                        Number(trade.profitLoss) >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {Number(trade.profitLoss) >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {Number(trade.profitLoss) >= 0 ? "+" : ""}
                      {trade.profitLoss} ({trade.profitLossPercentage}%)
                    </span>
                  </div>
                )}

                <div className="mt-2 text-xs text-muted-foreground">
                  <div>
                    Strategy: {trade.strategy.name} ({trade.strategy.confidence}% confidence)
                  </div>
                  <div>Started: {new Date(trade.timestamp).toLocaleString()}</div>
                  {trade.txHash && (
                    <div className="truncate">
                      TX: <span className="font-mono">{trade.txHash}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
