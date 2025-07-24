"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Play, PowerOff, RefreshCw, Settings } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProductionBotControl() {
  const [status, setStatus] = useState<{
    isRunning: boolean
    activeTrades: number
    completedTrades: number
  } | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  // Fetch trading bot status
  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/production-bot/status")
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const data = await response.json()
      setStatus(data.status)
      setStats(data.stats)
    } catch (error) {
      console.error("Error fetching production trading bot status:", error)
      setError("Failed to fetch production trading bot status")
    } finally {
      setLoading(false)
    }
  }

  // Start the trading bot
  const startBot = async () => {
    try {
      setUpdating(true)
      setError(null)
      const response = await fetch("/api/production-bot/start", { method: "POST" })
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      await fetchStatus()
    } catch (error) {
      console.error("Error starting production trading bot:", error)
      setError("Failed to start production trading bot")
    } finally {
      setUpdating(false)
    }
  }

  // Stop the trading bot
  const stopBot = async () => {
    try {
      setUpdating(true)
      setError(null)
      const response = await fetch("/api/production-bot/stop", { method: "POST" })
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      await fetchStatus()
    } catch (error) {
      console.error("Error stopping production trading bot:", error)
      setError("Failed to stop production trading bot")
    } finally {
      setUpdating(false)
    }
  }

  // Load initial status
  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Production Trading Bot
            </CardTitle>
            <CardDescription>Real-time trading bot using DEXTools and BullMe</CardDescription>
          </div>
          {status && (
            <Badge
              variant={status.isRunning ? "default" : "outline"}
              className={
                status.isRunning
                  ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
              }
            >
              {status.isRunning ? "Running" : "Stopped"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="status">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Bot Status</div>
                  <div className="text-2xl font-bold">{status?.isRunning ? "Running" : "Stopped"}</div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Active Trades</div>
                  <div className="text-2xl font-bold">{status?.activeTrades || 0}</div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Completed Trades</div>
                  <div className="text-2xl font-bold">{status?.completedTrades || 0}</div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={startBot}
                  disabled={updating || (status?.isRunning ?? false)}
                  className="w-32"
                  variant={status?.isRunning ? "outline" : "default"}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Bot
                </Button>
                <Button
                  onClick={stopBot}
                  disabled={updating || !(status?.isRunning ?? false)}
                  className="w-32"
                  variant={status?.isRunning ? "destructive" : "outline"}
                >
                  <PowerOff className="mr-2 h-4 w-4" />
                  Stop Bot
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="pt-4">
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Total Profit/Loss</div>
                      <div
                        className={`text-2xl font-bold ${stats.totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {stats.totalProfit >= 0 ? "+" : ""}
                        {stats.totalProfit.toFixed(4)} ETH
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
                      <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Profit Per Trade</div>
                      <div
                        className={`text-2xl font-bold ${
                          stats.profitPerTrade >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {stats.profitPerTrade >= 0 ? "+" : ""}
                        {stats.profitPerTrade.toFixed(4)} ETH
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
                      <div className="text-2xl font-bold">{stats.totalTrades}</div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Active Trades</div>
                      <div className="text-2xl font-bold">{stats.activeTrades}</div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Completed Trades</div>
                      <div className="text-2xl font-bold">{stats.completedTrades}</div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchStatus} variant="outline" className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </CardFooter>
    </Card>
  )
}
