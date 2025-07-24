"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Loader2 } from "lucide-react"

interface PriceDataPoint {
  timestamp: number
  price: number
  volume?: number
  date: string
}

interface TokenPriceChartProps {
  tokenAddress: string
  tokenSymbol: string
  chain: string
}

export function TokenPriceChart({ tokenAddress, tokenSymbol, chain }: TokenPriceChartProps) {
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([])
  const [timeframe, setTimeframe] = useState("24h")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPriceData = async () => {
      setIsLoading(true)
      setError("")

      try {
        // In a production app, you would fetch this from a price API like CoinGecko, CoinMarketCap, or DEX APIs
        // For now, we'll generate realistic simulated data
        const now = Date.now()
        const data: PriceDataPoint[] = []

        // Determine time interval based on timeframe
        let interval: number
        let dataPoints: number

        switch (timeframe) {
          case "1h":
            interval = 60 * 1000 // 1 minute
            dataPoints = 60
            break
          case "24h":
            interval = 15 * 60 * 1000 // 15 minutes
            dataPoints = 96
            break
          case "7d":
            interval = 2 * 60 * 60 * 1000 // 2 hours
            dataPoints = 84
            break
          case "30d":
            interval = 8 * 60 * 60 * 1000 // 8 hours
            dataPoints = 90
            break
          default:
            interval = 15 * 60 * 1000
            dataPoints = 96
        }

        // Generate base price (would be fetched from API in production)
        const basePrice = Math.random() * 100 + 1 // $1 to $101

        // Generate price data with realistic patterns
        for (let i = dataPoints; i >= 0; i--) {
          const timestamp = now - i * interval
          const date = new Date(timestamp)

          // Create realistic price movements
          // More volatile for shorter timeframes, less for longer ones
          const volatilityFactor =
            timeframe === "1h" ? 0.002 : timeframe === "24h" ? 0.005 : timeframe === "7d" ? 0.01 : 0.02

          // Add some randomness but maintain a trend
          const trendFactor = Math.sin(i / (dataPoints / 3)) * volatilityFactor * 5
          const randomFactor = (Math.random() - 0.5) * volatilityFactor

          // Calculate price with trend and randomness
          const priceFactor = 1 + trendFactor + randomFactor
          const price = i === dataPoints ? basePrice : data[data.length - 1].price * priceFactor

          // Calculate volume (higher during price changes)
          const priceChange = i > 0 ? Math.abs(price - (data[data.length - 1]?.price || price)) : 0
          const baseVolume = basePrice * 1000
          const volume = baseVolume * (1 + (priceChange / price) * 10) * (0.8 + Math.random() * 0.4)

          data.push({
            timestamp,
            price,
            volume,
            date: date.toLocaleString(),
          })
        }

        setPriceData(data)
      } catch (err) {
        console.error("Failed to fetch price data:", err)
        setError("Failed to load price data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPriceData()
  }, [tokenAddress, chain, timeframe])

  const formatPrice = (price: number) => {
    if (price < 0.001) return price.toFixed(8)
    if (price < 0.01) return price.toFixed(6)
    if (price < 1) return price.toFixed(4)
    if (price < 1000) return price.toFixed(2)
    return price.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)

    switch (timeframe) {
      case "1h":
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      case "24h":
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      case "7d":
        return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit" })
      case "30d":
        return date.toLocaleDateString([], { month: "short", day: "numeric" })
      default:
        return date.toLocaleString()
    }
  }

  // Calculate price change
  const calculatePriceChange = () => {
    if (priceData.length < 2) return { change: 0, percentage: 0 }

    const firstPrice = priceData[0].price
    const lastPrice = priceData[priceData.length - 1].price
    const change = lastPrice - firstPrice
    const percentage = (change / firstPrice) * 100

    return { change, percentage }
  }

  const priceChange = calculatePriceChange()
  const isPriceUp = priceChange.change >= 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <CardTitle>{tokenSymbol} Price Chart</CardTitle>
            <CardDescription>Historical price data for {tokenSymbol}</CardDescription>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-[300px] text-destructive">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="text-2xl font-bold">${formatPrice(priceData[priceData.length - 1]?.price || 0)}</div>
                <div className={`text-sm ${isPriceUp ? "text-green-500" : "text-red-500"}`}>
                  {isPriceUp ? "▲" : "▼"} ${formatPrice(Math.abs(priceChange.change))} (
                  {priceChange.percentage.toFixed(2)}%)
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-2 md:mt-0">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>

            <Tabs defaultValue="price">
              <TabsList className="mb-4">
                <TabsTrigger value="price">Price</TabsTrigger>
                <TabsTrigger value="volume">Volume</TabsTrigger>
              </TabsList>

              <TabsContent value="price">
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      price: {
                        label: "Price",
                        color: isPriceUp ? "hsl(var(--chart-1))" : "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="timestamp" tickFormatter={formatDate} minTickGap={30} />
                        <YAxis domain={["auto", "auto"]} tickFormatter={(value) => `$${formatPrice(value)}`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={`var(--color-price)`}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                          name="Price"
                          formatter={(value) => [`$${formatPrice(value)}`, "Price"]}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </TabsContent>

              <TabsContent value="volume">
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      volume: {
                        label: "Volume",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="timestamp" tickFormatter={formatDate} minTickGap={30} />
                        <YAxis domain={["auto", "auto"]} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="volume"
                          stroke={`var(--color-volume)`}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                          name="Volume"
                          formatter={(value) => [`$${(value / 1000).toFixed(1)}K`, "Volume"]}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
