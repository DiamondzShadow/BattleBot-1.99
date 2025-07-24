"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TradeStatus } from "@/lib/production-trading-bot"

export function ProductionActiveTrades() {
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch active trades
  const fetchTrades = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/production-bot/trades")
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const data = await response.json()
      setTrades(data.activeTrades || [])
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
      case TradeStatus.ACTIVE:
        return "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
      case TradeStatus.EXECUTING:
        return "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
      case TradeStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
      case TradeStatus.FAILED:
        return "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Active Trades</span>
          <Badge>{trades.length}</Badge>
        </CardTitle>
        <CardDescription>Real-time trades from DEXTools and BullMe</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : trades.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Chain</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Entry Price</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>P/L</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.tokenSymbol}</TableCell>
                    <TableCell className="capitalize">{trade.chain}</TableCell>
                    <TableCell>{trade.amount}</TableCell>
                    <TableCell>{Number.parseFloat(trade.entryPrice).toFixed(6)}</TableCell>
                    <TableCell>{trade.currentPrice ? Number.parseFloat(trade.currentPrice).toFixed(6) : "-"}</TableCell>
                    <TableCell>
                      {trade.profitLossPercentage ? (
                        <span
                          className={
                            Number.parseFloat(trade.profitLossPercentage) >= 0 ? "text-green-500" : "text-red-500"
                          }
                        >
                          {Number.parseFloat(trade.profitLossPercentage) >= 0 ? "+" : ""}
                          {Number.parseFloat(trade.profitLossPercentage).toFixed(2)}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(trade.status)}>
                        {trade.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">No active trades</div>
        )}
      </CardContent>
    </Card>
  )
}
