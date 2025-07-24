import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <AppLayout>
      <section className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Settings</h1>
        <p className="text-xl text-muted-foreground">Configure your trading bot and platform preferences</p>
      </section>

      <Tabs defaultValue="trading">
        <TabsList className="mb-8">
          <TabsTrigger value="trading">Trading Bot</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
          <TabsTrigger value="chains">Blockchains</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="trading">
          <Card>
            <CardHeader>
              <CardTitle>Trading Bot Configuration</CardTitle>
              <CardDescription>Configure automated trading parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bot-status">Trading Bot Status</Label>
                      <Switch id="bot-status" defaultChecked />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trade-interval">Trade Interval (seconds)</Label>
                      <Input id="trade-interval" type="number" defaultValue="60" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profit-threshold">Profit Threshold (USD)</Label>
                      <Input id="profit-threshold" type="number" defaultValue="3" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-trades">Maximum Concurrent Trades</Label>
                      <Input id="max-trades" type="number" defaultValue="10" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Strategy Configuration</h3>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-3 p-3 bg-muted text-sm font-medium">
                        <div>Strategy</div>
                        <div>Status</div>
                        <div>Allocation</div>
                      </div>
                      <div className="divide-y">
                        {[
                          { name: "Momentum Trading", status: true, allocation: 40 },
                          { name: "Breakout Trading", status: true, allocation: 30 },
                          { name: "Volatility Trading", status: false, allocation: 0 },
                          { name: "Swing Trading", status: true, allocation: 20 },
                          { name: "Liquidity Mining", status: true, allocation: 10 },
                        ].map((strategy, i) => (
                          <div key={i} className="grid grid-cols-3 p-3 text-sm">
                            <div className="font-medium">{strategy.name}</div>
                            <div>
                              <Switch checked={strategy.status} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Slider
                                defaultValue={[strategy.allocation]}
                                max={100}
                                step={5}
                                disabled={!strategy.status}
                              />
                              <span className="min-w-[40px] text-right">{strategy.allocation}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Risk Management</CardTitle>
              <CardDescription>Configure risk parameters for each risk level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-3 bg-muted text-sm font-medium">
                    <div>Risk Level</div>
                    <div>Status</div>
                    <div>Stop Loss</div>
                    <div>Take Profit</div>
                    <div>Max Position Size</div>
                  </div>
                  <div className="divide-y">
                    {[
                      { name: "Cold", color: "blue", status: true, stopLoss: 5, takeProfit: 10, maxSize: 0.5 },
                      { name: "Warm", color: "yellow", status: true, stopLoss: 7, takeProfit: 15, maxSize: 0.3 },
                      { name: "Hot", color: "orange", status: true, stopLoss: 10, takeProfit: 20, maxSize: 0.2 },
                      { name: "Steaming", color: "red", status: true, stopLoss: 15, takeProfit: 30, maxSize: 0.1 },
                      { name: "Nova", color: "purple", status: false, stopLoss: 20, takeProfit: 40, maxSize: 0.05 },
                    ].map((level, i) => (
                      <div key={i} className="grid grid-cols-5 p-3 text-sm">
                        <div className="font-medium flex items-center gap-2">
                          <Badge className={`bg-${level.color}-500`}>{level.name}</Badge>
                        </div>
                        <div>
                          <Switch checked={level.status} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Slider defaultValue={[level.stopLoss]} max={25} step={1} disabled={!level.status} />
                          <span className="min-w-[40px] text-right">{level.stopLoss}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Slider defaultValue={[level.takeProfit]} max={50} step={5} disabled={!level.status} />
                          <span className="min-w-[40px] text-right">{level.takeProfit}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Slider defaultValue={[level.maxSize * 100]} max={100} step={5} disabled={!level.status} />
                          <span className="min-w-[40px] text-right">{level.maxSize} ETH</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chains">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Configuration</CardTitle>
              <CardDescription>Configure which blockchains to trade on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 p-3 bg-muted text-sm font-medium">
                    <div>Blockchain</div>
                    <div>Status</div>
                    <div>Allocation</div>
                    <div>Gas Settings</div>
                  </div>
                  <div className="divide-y">
                    {[
                      { name: "Polygon", color: "purple", status: true, allocation: 35, gas: "Standard" },
                      { name: "BNB Chain", color: "yellow", status: true, allocation: 25, gas: "Fast" },
                      { name: "Arbitrum", color: "blue", status: true, allocation: 20, gas: "Standard" },
                      { name: "Optimism", color: "red", status: true, allocation: 15, gas: "Standard" },
                      { name: "Base", color: "green", status: true, allocation: 5, gas: "Fast" },
                    ].map((chain, i) => (
                      <div key={i} className="grid grid-cols-4 p-3 text-sm">
                        <div className="font-medium flex items-center gap-2">
                          <Badge className={`bg-${chain.color}-500`}>{chain.name}</Badge>
                        </div>
                        <div>
                          <Switch checked={chain.status} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Slider defaultValue={[chain.allocation]} max={100} step={5} disabled={!chain.status} />
                          <span className="min-w-[40px] text-right">{chain.allocation}%</span>
                        </div>
                        <div>
                          <select className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm">
                            <option>Slow</option>
                            <option>Standard</option>
                            <option>Fast</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue="user@example.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue="trader123" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" defaultValue="********" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications">Email Notifications</Label>
                      <Switch id="notifications" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="trade-alerts">Trade Alerts</Label>
                      <Switch id="trade-alerts" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="performance-reports">Weekly Performance Reports</Label>
                      <Switch id="performance-reports" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="market-updates">Market Updates</Label>
                      <Switch id="market-updates" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Manage API keys for ThirdWeb integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nebula-key">ThirdWeb Nebula API Key</Label>
                    <div className="flex gap-2">
                      <Input id="nebula-key" type="password" defaultValue="nebula-api-key-123456" />
                      <Button variant="outline">Reveal</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insight-key">ThirdWeb Insight API Key</Label>
                    <div className="flex gap-2">
                      <Input id="insight-key" type="password" defaultValue="insight-api-key-123456" />
                      <Button variant="outline">Reveal</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="engine-key">ThirdWeb Engine API Key</Label>
                    <div className="flex gap-2">
                      <Input id="engine-key" type="password" defaultValue="engine-api-key-123456" />
                      <Button variant="outline">Reveal</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="engine-url">ThirdWeb Engine API URL</Label>
                    <Input
                      id="engine-url"
                      defaultValue={process.env.ENGINE_API_URL || "https://engine-api.thirdweb.com"}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}
