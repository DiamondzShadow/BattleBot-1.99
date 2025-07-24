import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, LineChart, PieChart, TrendingUp, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TrendingTokens } from "@/components/trending-tokens"
import { LiveTrades } from "@/components/live-trades"
import { TokenPriceChart } from "@/components/token-price-chart"

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Trading Dashboard</h1>
          <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Total Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">+2.45 ETH</div>
              <p className="text-xs text-muted-foreground">+5.2% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">+3% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Active Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Across 4 chains</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Portfolio Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4 Chains</div>
              <p className="text-xs text-muted-foreground">Diversified across 12 tokens</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Performance</TabsTrigger>
            <TabsTrigger value="trades">Active Trades</TabsTrigger>
            <TabsTrigger value="tokens">Monitored Tokens</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="settings">Bot Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Trading Performance</CardTitle>
                  <CardDescription>Profit/loss over the past 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <LineChart className="h-8 w-8 mb-2" />
                      <p>Performance Chart</p>
                      <p className="text-sm">Trading data visualization would appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Chain Distribution</CardTitle>
                  <CardDescription>Trading allocation by blockchain</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Polygon</span>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: "35%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">BNB Chain</span>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: "25%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Arbitrum</span>
                        <span className="text-sm font-medium">20%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: "20%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Optimism</span>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: "15%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Base</span>
                        <span className="text-sm font-medium">5%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: "5%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Performance</CardTitle>
                  <CardDescription>Win rate by trading strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Momentum Trading</div>
                        <div className="text-sm text-muted-foreground">32 trades</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-500">72% Win Rate</div>
                        <div className="text-sm text-muted-foreground">+1.45 ETH</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Breakout Trading</div>
                        <div className="text-sm text-muted-foreground">28 trades</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-500">65% Win Rate</div>
                        <div className="text-sm text-muted-foreground">+0.85 ETH</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Volatility Trading</div>
                        <div className="text-sm text-muted-foreground">15 trades</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-500">48% Win Rate</div>
                        <div className="text-sm text-muted-foreground">-0.12 ETH</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Swing Trading</div>
                        <div className="text-sm text-muted-foreground">8 trades</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-500">75% Win Rate</div>
                        <div className="text-sm text-muted-foreground">+0.27 ETH</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Level Performance</CardTitle>
                  <CardDescription>Returns by risk category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500">Cold</Badge>
                        <div className="text-sm text-muted-foreground">12 trades</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-500">+0.35 ETH</div>
                        <div className="text-sm text-muted-foreground">8% ROI</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500">Warm</Badge>
                        <div className="text-sm text-muted-foreground">18 trades</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-500">+0.65 ETH</div>
                        <div className="text-sm text-muted-foreground">12% ROI</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-500">Hot</Badge>
                        <div className="text-sm text-muted-foreground">24 trades</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-500">+0.95 ETH</div>
                        <div className="text-sm text-muted-foreground">18% ROI</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-500">Steaming</Badge>
                        <div className="text-sm text-muted-foreground">15 trades</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-500">+0.75 ETH</div>
                        <div className="text-sm text-muted-foreground">22% ROI</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500">Nova</Badge>
                        <div className="text-sm text-muted-foreground">8 trades</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-500">-0.25 ETH</div>
                        <div className="text-sm text-muted-foreground">-15% ROI</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trades">
            <Card>
              <CardHeader>
                <CardTitle>Active Trades</CardTitle>
                <CardDescription>Currently open trading positions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-7 p-4 font-medium border-b">
                    <div>Token</div>
                    <div>Chain</div>
                    <div>Strategy</div>
                    <div>Entry Price</div>
                    <div>Current Price</div>
                    <div>P/L</div>
                    <div>Duration</div>
                  </div>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const change = Math.random() * 20 - 5 // Mostly positive
                    return (
                      <div key={i} className="grid grid-cols-7 p-4 border-b last:border-0">
                        <div className="font-medium">TOKEN{i}</div>
                        <div>{["Polygon", "BNB", "Arbitrum", "Optimism", "Base"][i % 5]}</div>
                        <div>{["Momentum", "Breakout", "Volatility", "Swing", "Liquidity"][i % 5]}</div>
                        <div>${(Math.random() * 10).toFixed(4)}</div>
                        <div>${(Math.random() * 10).toFixed(4)}</div>
                        <div className={change > 0 ? "text-green-500" : "text-red-500"}>
                          {change > 0 ? "+" : ""}
                          {change.toFixed(2)}%
                        </div>
                        <div>{Math.floor(Math.random() * 24) + 1}h</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tokens">
            <Card>
              <CardHeader>
                <CardTitle>Monitored Tokens</CardTitle>
                <CardDescription>Tokens currently being analyzed by the AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 p-4 font-medium border-b">
                    <div>Token</div>
                    <div>Chain</div>
                    <div>Risk Level</div>
                    <div>Price</div>
                    <div>24h Change</div>
                    <div>Trading Status</div>
                  </div>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const change = Math.random() * 20 - 10
                    return (
                      <div key={i} className="grid grid-cols-6 p-4 border-b last:border-0">
                        <div className="font-medium">TOKEN{i}</div>
                        <div>{["Polygon", "BNB", "Arbitrum", "Optimism", "Base"][i % 5]}</div>
                        <div>
                          <Badge
                            className={`${
                              i % 5 === 0
                                ? "bg-blue-500"
                                : i % 5 === 1
                                  ? "bg-yellow-500"
                                  : i % 5 === 2
                                    ? "bg-orange-500"
                                    : i % 5 === 3
                                      ? "bg-red-500"
                                      : "bg-purple-500"
                            }`}
                          >
                            {["Cold", "Warm", "Hot", "Steaming", "Nova"][i % 5]}
                          </Badge>
                        </div>
                        <div>${(Math.random() * 10).toFixed(4)}</div>
                        <div className={change > 0 ? "text-green-500" : "text-red-500"}>
                          {change > 0 ? "+" : ""}
                          {change.toFixed(2)}%
                        </div>
                        <div>
                          <Badge
                            variant={i % 3 === 0 ? "default" : i % 3 === 1 ? "outline" : "secondary"}
                            className={
                              i % 3 === 0
                                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                : i % 3 === 1
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400"
                                  : ""
                            }
                          >
                            {i % 3 === 0 ? "Trading" : i % 3 === 1 ? "Monitoring" : "Analyzing"}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>AI Trading Insights</CardTitle>
                <CardDescription>Recommendations from ThirdWeb Nebula</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold">Market Insight #{i}</h3>
                        <Badge variant="outline">
                          {["High Priority", "Medium Priority", "Low Priority", "Informational"][i - 1]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {
                          [
                            "Based on recent trading patterns and on-chain analysis, we've detected increased accumulation of tokens on Polygon by whale wallets. Consider increasing allocation to this chain.",
                            "Market sentiment analysis suggests increased interest in DeFi tokens on Arbitrum. The bot has adjusted strategy parameters to capitalize on this trend.",
                            "Risk analysis indicates potential volatility in gaming tokens on BNB Chain. The bot has reduced position sizes and tightened stop losses for these tokens.",
                            "Liquidity analysis shows improving conditions for small-cap tokens on Optimism. Consider enabling trading for tokens in the 'Hot' risk category on this chain.",
                          ][i - 1]
                        }
                      </p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Generated: {new Date().toLocaleDateString()}</span>
                        <span>Confidence: {85 - i * 5}%</span>
                        <span>Source: ThirdWeb Nebula</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Trading Bot Settings</CardTitle>
                <CardDescription>Configure automated trading parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Risk Parameters</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Maximum Risk Level</span>
                          <Badge>Hot (3/5)</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Position Size</span>
                          <span className="text-sm font-medium">0.1-0.5 ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Stop Loss</span>
                          <span className="text-sm font-medium">5-15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Take Profit</span>
                          <span className="text-sm font-medium">10-30%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Chain Allocation</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Polygon</span>
                          <span className="text-sm font-medium">35%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">BNB Chain</span>
                          <span className="text-sm font-medium">25%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Arbitrum</span>
                          <span className="text-sm font-medium">20%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Optimism</span>
                          <span className="text-sm font-medium">15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Base</span>
                          <span className="text-sm font-medium">5%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Strategy Configuration</h3>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 p-3 bg-muted text-sm font-medium">
                        <div>Strategy</div>
                        <div>Status</div>
                        <div>Risk Levels</div>
                        <div>Allocation</div>
                      </div>
                      <div className="divide-y">
                        {[
                          { name: "Momentum Trading", status: true, risk: "Cold, Warm, Hot", allocation: "40%" },
                          { name: "Breakout Trading", status: true, risk: "Warm, Hot, Steaming", allocation: "30%" },
                          { name: "Volatility Trading", status: false, risk: "Hot, Steaming, Nova", allocation: "0%" },
                          { name: "Swing Trading", status: true, risk: "Cold, Warm", allocation: "20%" },
                          { name: "Liquidity Mining", status: true, risk: "Cold", allocation: "10%" },
                        ].map((strategy, i) => (
                          <div key={i} className="grid grid-cols-4 p-3 text-sm">
                            <div className="font-medium">{strategy.name}</div>
                            <div>
                              <Badge
                                variant={strategy.status ? "default" : "outline"}
                                className={
                                  strategy.status
                                    ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                                }
                              >
                                {strategy.status ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                            <div>{strategy.risk}</div>
                            <div>{strategy.allocation}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">ThirdWeb Integration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="font-medium mb-2">Nebula</div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                        >
                          Connected
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          AI-powered blockchain analysis for token evaluation
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="font-medium mb-2">Insight</div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                        >
                          Connected
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          Advanced analytics and monitoring of on-chain activities
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <div className="font-medium mb-2">Engine</div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                        >
                          Connected
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          Automated trading execution based on AI recommendations
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TrendingTokens />
          <LiveTrades />
        </div>

        <TokenPriceChart />
      </main>
      <Footer />
    </div>
  )
}
