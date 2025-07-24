import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BarChart3, LineChart, PieChart } from "lucide-react"

export default function PerformancePage() {
  return (
    <AppLayout>
      <section className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Performance Analytics</h1>
        <p className="text-xl text-muted-foreground">Detailed analysis of your trading performance</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+2.45 ETH</div>
            <p className="text-xs text-muted-foreground">+42.3% all time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">52 of 76 trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+0.08 ETH</div>
            <p className="text-xs text-muted-foreground">Per winning trade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">-0.03 ETH</div>
            <p className="text-xs text-muted-foreground">Per losing trade</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="chains">Chains</TabsTrigger>
          <TabsTrigger value="risk">Risk Levels</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Trading performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="flex flex-col items-center text-muted-foreground">
                  <LineChart className="h-8 w-8 mb-2" />
                  <p>Performance Chart</p>
                  <p className="text-sm">Trading performance visualization would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Performance</CardTitle>
              <CardDescription>Performance breakdown by trading strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mb-2" />
                    <p>Strategy Comparison Chart</p>
                    <p className="text-sm">Strategy performance visualization would appear here</p>
                  </div>
                </div>

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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chains">
          <Card>
            <CardHeader>
              <CardTitle>Chain Performance</CardTitle>
              <CardDescription>Performance breakdown by blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <PieChart className="h-8 w-8 mb-2" />
                    <p>Chain Performance Chart</p>
                    <p className="text-sm">Chain performance visualization would appear here</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-500">Polygon</Badge>
                      <div className="text-sm text-muted-foreground">28 trades</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-500">+0.95 ETH</div>
                      <div className="text-sm text-muted-foreground">70% Win Rate</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500">BNB Chain</Badge>
                      <div className="text-sm text-muted-foreground">22 trades</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-500">+0.75 ETH</div>
                      <div className="text-sm text-muted-foreground">68% Win Rate</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500">Arbitrum</Badge>
                      <div className="text-sm text-muted-foreground">15 trades</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-500">+0.45 ETH</div>
                      <div className="text-sm text-muted-foreground">65% Win Rate</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-500">Optimism</Badge>
                      <div className="text-sm text-muted-foreground">8 trades</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-500">+0.25 ETH</div>
                      <div className="text-sm text-muted-foreground">62% Win Rate</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500">Base</Badge>
                      <div className="text-sm text-muted-foreground">3 trades</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-500">+0.05 ETH</div>
                      <div className="text-sm text-muted-foreground">67% Win Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Risk Level Performance</CardTitle>
              <CardDescription>Performance breakdown by risk level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mb-2" />
                    <p>Risk Level Performance Chart</p>
                    <p className="text-sm">Risk level performance visualization would appear here</p>
                  </div>
                </div>

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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}
