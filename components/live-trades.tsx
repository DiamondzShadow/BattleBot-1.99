"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTradingService } from "@/lib/trading-service"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LiveTrades() {
  const [activeTrades, setActiveTrades] = useState([])
  const [tradeHistory, setTradeHistory] = useState([])
  const [stats, setStats] = useState({
    totalTrades: 0,
    activeTrades: 0,
    completedTrades: 0,
    totalProfit: 0,
    winRate: 0,
    profitPerTrade: 0,
  })

  useEffect(() => {
    const tradingService = getTradingService()

    // Initial data load
    setActiveTrades(tradingService.getActiveTrades())
    setTradeHistory(tradingService.getTradeHistory())
    setStats(tradingService.getTradingStats())

    // Subscribe to updates
    const unsubscribe = tradingService.subscribe((update) => {
      if (update.type === "new_trade" || update.type === "trade_update") {
        setActiveTrades(tradingService.getActiveTrades())
      }

      if (update.type === "trade_closed") {
        setTradeHistory(tradingService.getTradeHistory())
      }

      setStats(tradingService.getTradingStats())
    })

    return () => unsubscribe()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Trading Activity</CardTitle>
        <CardDescription>Real-time view of active trades and trading history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Profit/Loss</div>
            <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {stats.totalProfit >= 0 ? "+" : ""}
              {stats.totalProfit.toFixed(4)} ETH
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
            <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Active Trades</div>
            <div className="text-2xl font-bold">{stats.activeTrades}</div>
          </div>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Trades ({activeTrades.length})</TabsTrigger>
            <TabsTrigger value="history">Trade History ({tradeHistory.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="pt-4">
            {activeTrades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active trades. Analyze a token to start trading.
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <div className="grid grid-cols-6 p-3 bg-muted text-sm font-medium">
                  <div>Token</div>
                  <div>Chain</div>
                  <div>Amount</div>
                  <div>Entry Price</div>
                  <div>Current P/L</div>
                  <div>Status</div>
                </div>
                <div className="divide-y">
                  {activeTrades.map((trade) => (
                    <div key={trade.id} className="grid grid-cols-6 p-3 text-sm">
                      <div className="font-medium">{trade.tokenSymbol}</div>
                      <div>{trade.chain}</div>
                      <div>{trade.amount} ETH</div>
                      <div>${trade.entryPrice}</div>
                      <div
                        className={`flex items-center ${Number.parseFloat(trade.profitLoss) >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {Number.parseFloat(trade.profitLoss) >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Number.parseFloat(trade.profitLoss) >= 0 ? "+" : ""}
                        {trade.profitLoss} ETH
                        <span className="text-xs ml-1">
                          ({Number.parseFloat(trade.profitLossPercentage) >= 0 ? "+" : ""}
                          {trade.profitLossPercentage}%)
                        </span>
                      </div>
                      <div>
                        <Badge
                          variant={trade.status === "executing" ? "outline" : "default"}
                          className={
                            trade.status === "executing"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400"
                              : ""
                          }
                        >
                          {trade.status === "executing" ? "Executing" : "Active"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="pt-4">
            {tradeHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No trade history yet. Completed trades will appear here.
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <div className="grid grid-cols-6 p-3 bg-muted text-sm font-medium">
                  <div>Token</div>
                  <div>Chain</div>
                  <div>Amount</div>
                  <div>Entry Price</div>
                  <div>Final P/L</div>
                  <div>Date</div>
                </div>
                <div className="divide-y">
                  {tradeHistory.map((trade) => (
                    <div key={trade.id} className="grid grid-cols-6 p-3 text-sm">
                      <div className="font-medium">{trade.tokenSymbol}</div>
                      <div>{trade.chain}</div>
                      <div>{trade.amount} ETH</div>
                      <div>${trade.entryPrice}</div>
                      <div
                        className={`flex items-center ${Number.parseFloat(trade.profitLoss) >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {Number.parseFloat(trade.profitLoss) >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Number.parseFloat(trade.profitLoss) >= 0 ? "+" : ""}
                        {trade.profitLoss} ETH
                        <span className="text-xs ml-1">
                          ({Number.parseFloat(trade.profitLossPercentage) >= 0 ? "+" : ""}
                          {trade.profitLossPercentage}%)
                        </span>
                      </div>
                      <div className="text-muted-foreground">{new Date(trade.timestamp).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
