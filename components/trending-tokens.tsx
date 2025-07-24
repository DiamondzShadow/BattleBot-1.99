"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, ArrowUp, ArrowDown, TrendingUp } from "lucide-react"
import { getCoinMarketCapService } from "@/lib/coinmarketcap-service"
import { getSolanaService } from "@/lib/solana-service"
import { SUPPORTED_CHAINS } from "@/lib/trading-service"

export function TrendingTokens() {
  const router = useRouter()
  const [activeChain, setActiveChain] = useState("bsc")
  const [trendingTokens, setTrendingTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      setLoading(true)
      try {
        if (activeChain === "solana") {
          const solanaService = getSolanaService()
          const tokens = await solanaService.getTrendingTokens()
          setTrendingTokens(tokens)
        } else {
          const cmcService = getCoinMarketCapService()
          const tokens = await cmcService.getTrendingTokens(activeChain)
          setTrendingTokens(tokens)
        }
      } catch (error) {
        console.error("Failed to fetch trending tokens:", error)
        setTrendingTokens([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingTokens()
  }, [activeChain])

  const handleAnalyzeToken = (token: any) => {
    const tokenAddress = token.platform?.token_address || token.address
    router.push(`/analyze?token=${tokenAddress}&chain=${activeChain}`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Tokens
            </CardTitle>
            <CardDescription>Discover the hottest tokens in the market right now</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeChain} onValueChange={setActiveChain} className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6">
            {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
              <TabsTrigger key={id} value={id}>
                {chain.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeChain} className="space-y-4">
            {loading ? (
              // Loading skeletons
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 ml-auto" />
                        <Skeleton className="h-3 w-12 ml-auto mt-1" />
                      </div>
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                ))
            ) : trendingTokens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No trending tokens found for this chain</div>
            ) : (
              trendingTokens.slice(0, 5).map((token, index) => {
                // Generate random price change for demo
                const priceChange = token.priceChange24h || Math.random() * 20 - 10
                const isPriceUp = priceChange > 0

                return (
                  <div
                    key={token.id || token.address}
                    className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={token.logo || token.logoUrl} alt={token.symbol} />
                        <AvatarFallback>{token.symbol.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-xs text-muted-foreground">{token.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">
                          ${token.price_usd || token.price || (Math.random() * 10).toFixed(6)}
                        </div>
                        <div
                          className={`text-xs flex items-center justify-end ${
                            isPriceUp ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {isPriceUp ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                          {Math.abs(priceChange).toFixed(2)}%
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleAnalyzeToken(token)}>
                        Analyze
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
