import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, BarChart3, TrendingUp, TrendingDown } from "lucide-react"

export default function PortfolioPage() {
  return (
    <AppLayout>
      <section className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Portfolio</h1>
        <p className="text-xl text-muted-foreground">Track your trading portfolio performance and allocation</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.78 ETH</div>
            <p className="text-xs text-muted-foreground">≈ $12,345.67</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+2.45 ETH</div>
            <p className="text-xs text-muted-foreground">+42.3% all time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Across 4 chains</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Medium</div>
            <p className="text-xs text-muted-foreground">Balanced portfolio</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="allocation">
        <TabsList className="mb-8">
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="allocation">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
                <CardDescription>Distribution of assets across chains and risk levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <PieChart className="h-8 w-8 mb-2" />
                    <p>Allocation Chart</p>
                    <p className="text-sm">Portfolio allocation visualization would appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chain Distribution</CardTitle>
                <CardDescription>Assets by blockchain</CardDescription>
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
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Historical performance of your trading portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="flex flex-col items-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mb-2" />
                  <p>Performance Chart</p>
                  <p className="text-sm">Portfolio performance visualization would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Active Positions</CardTitle>
              <CardDescription>Currently open trading positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-7 p-4 font-medium border-b">
                  <div>Token</div>
                  <div>Chain</div>
                  <div>Entry Price</div>
                  <div>Current Price</div>
                  <div>Amount</div>
                  <div>Value</div>
                  <div>P/L</div>
                </div>
                {[1, 2, 3, 4, 5].map((i) => {
                  const change = Math.random() * 20 - 5 // Mostly positive
                  const entryPrice = (Math.random() * 10).toFixed(4)
                  const currentPrice = (Number(entryPrice) * (1 + change / 100)).toFixed(4)
                  const amount = (Math.random() * 0.5).toFixed(3)
                  const value = (Number(currentPrice) * Number(amount)).toFixed(4)
                  return (
                    <div key={i} className="grid grid-cols-7 p-4 border-b last:border-0">
                      <div className="font-medium">TOKEN{i}</div>
                      <div>{["Polygon", "BNB", "Arbitrum", "Optimism", "Base"][i % 5]}</div>
                      <div>${entryPrice}</div>
                      <div>${currentPrice}</div>
                      <div>{amount} ETH</div>
                      <div>${value}</div>
                      <div
                        className={change > 0 ? "text-green-500 flex items-center" : "text-red-500 flex items-center"}
                      >
                        {change > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {change > 0 ? "+" : ""}
                        {change.toFixed(2)}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
              <CardDescription>Record of completed trades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-7 p-4 font-medium border-b">
                  <div>Token</div>
                  <div>Chain</div>
                  <div>Type</div>
                  <div>Price</div>
                  <div>Amount</div>
                  <div>P/L</div>
                  <div>Date</div>
                </div>
                {[1, 2, 3, 4, 5].map((i) => {
                  const change = Math.random() * 20 - 5 // Mostly positive
                  const price = (Math.random() * 10).toFixed(4)
                  const amount = (Math.random() * 0.5).toFixed(3)
                  const date = new Date()
                  date.setDate(date.getDate() - i)
                  return (
                    <div key={i} className="grid grid-cols-7 p-4 border-b last:border-0">
                      <div className="font-medium">TOKEN{i}</div>
                      <div>{["Polygon", "BNB", "Arbitrum", "Optimism", "Base"][i % 5]}</div>
                      <div>{i % 2 === 0 ? "Buy" : "Sell"}</div>
                      <div>${price}</div>
                      <div>{amount} ETH</div>
                      <div className={change > 0 ? "text-green-500" : "text-red-500"}>
                        {change > 0 ? "+" : ""}
                        {((change * Number(amount)) / 100).toFixed(4)} ETH
                      </div>
                      <div>{date.toLocaleDateString()}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}
