"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  BarChart3,
  Flame,
  LineChart,
  Snowflake,
  ThermometerSun,
  TrendingDown,
  TrendingUp,
  Users,
  ExternalLink,
  Twitter,
  Info,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TokenPriceChart } from "./token-price-chart"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const getRiskIcon = (level) => {
  switch (level) {
    case 1:
      return <Snowflake className="h-4 w-4" />
    case 2:
      return <ThermometerSun className="h-4 w-4" />
    case 3:
    case 4:
    case 5:
      return <Flame className="h-4 w-4" />
    default:
      return <Flame className="h-4 w-4" />
  }
}

const getRiskColor = (level) => {
  switch (level) {
    case 1:
      return "bg-blue-500"
    case 2:
      return "bg-yellow-500"
    case 3:
      return "bg-orange-500"
    case 4:
      return "bg-red-500"
    case 5:
      return "bg-purple-500"
    default:
      return "bg-gray-500"
  }
}

export function AnalysisResult({ result }) {
  if (!result) return null

  const { token, analysis } = result

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {/* Token Logo */}
              <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                {result.token.logoUrl ? (
                  <img
                    src={result.token.logoUrl || "/placeholder.svg"}
                    alt={result.token.symbol}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // If logo fails to load, replace with a colored placeholder
                      const target = e.target as HTMLImageElement
                      const color = result.token.address.slice(2, 8)
                      target.src = `https://via.placeholder.com/48/${color}?text=${result.token.symbol.substring(0, 2)}`
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <span className="text-lg font-bold">{token.symbol.substring(0, 2)}</span>
                  </div>
                )}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {token.symbol}
                  {token.tokenType && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="ml-2">
                            {token.tokenType}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Token Type: {token.tokenType}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {token.website && (
                    <a
                      href={token.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {token.twitter && (
                    <a
                      href={token.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-muted-foreground hover:text-primary"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  {token.name} on {token.chain}
                  {token.description && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 ml-1" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p>{token.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </CardDescription>
                <div className="text-sm text-muted-foreground mt-2">
                  {result.token.description ||
                    `${result.token.name} is a token on the ${result.token.chain} blockchain.`}
                </div>
              </div>
            </div>
            <Badge className={`flex items-center gap-1 ${getRiskColor(analysis.riskLevel)} text-white`}>
              {getRiskIcon(analysis.riskLevel)}
              {analysis.riskLevelName} Risk
            </Badge>
          </div>
          {token.tags && token.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {token.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
              <TabsTrigger value="strategy">Trading Strategy</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="pt-4">
              <TokenPriceChart
                tokenAddress={token.address}
                tokenSymbol={token.symbol}
                chain={token.chain.toLowerCase()}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Price</span>
                      <span className="text-sm font-medium">${analysis.priceUsd?.toFixed(6) || "0.00"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={analysis.priceChange24h >= 0 ? "outline" : "destructive"}
                        className="flex items-center gap-1"
                      >
                        {analysis.priceChange24h >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(analysis.priceChange24h)?.toFixed(2) || "0.00"}% (24h)
                      </Badge>
                      <Badge
                        variant={analysis.priceChange7d >= 0 ? "outline" : "destructive"}
                        className="flex items-center gap-1"
                      >
                        {analysis.priceChange7d >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(analysis.priceChange7d)?.toFixed(2) || "0.00"}% (7d)
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Market Cap</span>
                      <span className="text-sm font-medium">${analysis.marketCapUsd?.toLocaleString() || "0"}</span>
                    </div>
                    <Progress value={Math.min((analysis.marketCapUsd / 10000000) * 100, 100)} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">24h Volume</span>
                      <span className="text-sm font-medium">${analysis.volume24hUsd?.toLocaleString() || "0"}</span>
                    </div>
                    <Progress
                      value={Math.min((analysis.volume24hUsd / analysis.marketCapUsd) * 100, 100)}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Liquidity</span>
                      <span className="text-sm font-medium">${analysis.liquidityUsd?.toLocaleString() || "0"}</span>
                    </div>
                    <Progress
                      value={Math.min((analysis.liquidityUsd / analysis.marketCapUsd) * 100, 100)}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Holders</span>
                      <span className="text-sm font-medium">{analysis.holdersCount?.toLocaleString() || "0"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Detailed Analysis</h3>
                  <div className="space-y-3">
                    {analysis.details.map((detail, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{detail.name}</span>
                          <Badge variant="secondary">{detail.value}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{detail.description}</p>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`mt-4 p-4 border rounded-lg ${analysis.tradingEnabled ? "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800"}`}
                  >
                    <h4 className="font-semibold mb-2">AI Recommendation</h4>
                    <p
                      className={
                        analysis.tradingEnabled
                          ? "text-green-700 dark:text-green-300"
                          : "text-red-700 dark:text-red-300"
                      }
                    >
                      {analysis.tradingEnabled
                        ? `This token meets your risk preference (${analysis.riskLevelName}). Suitable for trading with the recommended strategy.`
                        : `This token exceeds your risk preference. High risk of significant volatility. Trading not recommended.`}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="pt-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Price Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Current Price:</span>
                          <span className="text-sm font-medium">${analysis.priceUsd?.toFixed(6) || "0.00"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">24h Change:</span>
                          <span
                            className={`text-sm font-medium ${analysis.priceChange24h >= 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {analysis.priceChange24h >= 0 ? "+" : ""}
                            {analysis.priceChange24h}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">7d Change:</span>
                          <span
                            className={`text-sm font-medium ${analysis.priceChange7d >= 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {analysis.priceChange7d >= 0 ? "+" : ""}
                            {analysis.priceChange7d}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Volatility:</span>
                          <span className="text-sm font-medium">
                            {analysis.riskLevel >= 4
                              ? "Very High"
                              : analysis.riskLevel >= 3
                                ? "High"
                                : analysis.riskLevel >= 2
                                  ? "Medium"
                                  : "Low"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <LineChart className="h-4 w-4" />
                        Market Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Market Cap:</span>
                          <span className="text-sm font-medium">${analysis.marketCapUsd?.toLocaleString() || "0"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">24h Volume:</span>
                          <span className="text-sm font-medium">${analysis.volume24hUsd?.toLocaleString() || "0"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Volume/Market Cap:</span>
                          <span className="text-sm font-medium">
                            {((analysis.volume24hUsd / analysis.marketCapUsd) * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Liquidity:</span>
                          <span className="text-sm font-medium">${analysis.liquidityUsd?.toLocaleString() || "0"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Holder Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Holders:</span>
                          <span className="text-sm font-medium">{analysis.holdersCount?.toLocaleString() || "0"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Distribution:</span>
                          <span className="text-sm font-medium">
                            {analysis.details.find((d) => d.name === "Holder Distribution")?.value || "Unknown"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Holder Growth:</span>
                          <span className="text-sm font-medium">
                            {analysis.riskLevel <= 2 ? "Steady" : analysis.riskLevel === 3 ? "Moderate" : "Rapid"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Overall Risk:</span>
                          <span className="text-sm font-medium">{analysis.riskLevelName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Market Cap Risk:</span>
                          <span className="text-sm font-medium">
                            {analysis.details.find((d) => d.name === "Market Cap")?.value || "Unknown"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Liquidity Risk:</span>
                          <span className="text-sm font-medium">
                            {analysis.details.find((d) => d.name === "Liquidity Analysis")?.value || "Unknown"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Trading Recommendation:</span>
                          <span
                            className={`text-sm font-medium ${analysis.tradingEnabled ? "text-green-500" : "text-red-500"}`}
                          >
                            {analysis.tradingEnabled ? "Suitable for Trading" : "Not Recommended"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Trading Strategy</CardTitle>
                  <CardDescription>AI-powered strategy recommendation based on token analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{analysis.strategy.name}</h3>
                        <p className="text-sm text-muted-foreground">{analysis.strategy.description}</p>
                      </div>
                      <div className="bg-muted rounded-full h-16 w-16 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold">{analysis.strategy.confidence}%</div>
                          <div className="text-xs">Confidence</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Strategy Details</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">Entry Conditions</h5>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="rounded-full bg-green-500 h-2 w-2 mt-1.5"></span>
                              <span>Wait for confirmation of trend direction</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="rounded-full bg-green-500 h-2 w-2 mt-1.5"></span>
                              <span>Enter during periods of lower volatility</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="rounded-full bg-green-500 h-2 w-2 mt-1.5"></span>
                              <span>Use limit orders to get better entry prices</span>
                            </li>
                          </ul>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h5 className="font-medium mb-2">Exit Conditions</h5>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="rounded-full bg-red-500 h-2 w-2 mt-1.5"></span>
                              <span>Set profit targets at 10-20% depending on market conditions</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="rounded-full bg-red-500 h-2 w-2 mt-1.5"></span>
                              <span>Use trailing stops to lock in profits during strong trends</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="rounded-full bg-red-500 h-2 w-2 mt-1.5"></span>
                              <span>Exit if volume significantly decreases</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h5 className="font-medium mb-2">Risk Management</h5>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="rounded-full bg-amber-500 h-2 w-2 mt-1.5"></span>
                            <span>Set stop loss at 5-7% below entry price</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="rounded-full bg-amber-500 h-2 w-2 mt-1.5"></span>
                            <span>Limit position size to manage overall portfolio risk</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="rounded-full bg-amber-500 h-2 w-2 mt-1.5"></span>
                            <span>Consider using a scaled entry approach for volatile tokens</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">AI Trading Bot Configuration</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        The trading bot will automatically apply this strategy when executing trades for this token.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium mb-1">Entry Strategy</div>
                          <div className="text-sm">{analysis.strategy.name}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">Risk Level</div>
                          <div className="text-sm">{analysis.riskLevelName}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">Take Profit</div>
                          <div className="text-sm">
                            {analysis.riskLevel === 1
                              ? "10%"
                              : analysis.riskLevel === 2
                                ? "15%"
                                : analysis.riskLevel === 3
                                  ? "20%"
                                  : analysis.riskLevel === 4
                                    ? "30%"
                                    : "40%"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">Stop Loss</div>
                          <div className="text-sm">
                            {analysis.riskLevel === 1
                              ? "5%"
                              : analysis.riskLevel === 2
                                ? "7%"
                                : analysis.riskLevel === 3
                                  ? "10%"
                                  : analysis.riskLevel === 4
                                    ? "15%"
                                    : "20%"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
