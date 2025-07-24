"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { AlertCircle, ArrowRight, Flame, Snowflake, ThermometerSun, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AnalysisResult } from "@/components/analysis-result"
import { ChatInterface } from "@/components/chat-interface"
import { SUPPORTED_CHAINS, getTradingService } from "@/lib/trading-service"
import { PublicKey } from "@solana/web3.js"

const riskLevels = [
  { id: 1, name: "Cold", icon: <Snowflake className="h-4 w-4" />, color: "bg-blue-500" },
  { id: 2, name: "Warm", icon: <ThermometerSun className="h-4 w-4" />, color: "bg-yellow-500" },
  { id: 3, name: "Hot", icon: <Flame className="h-4 w-4" />, color: "bg-orange-500" },
  { id: 4, name: "Steaming", icon: <Flame className="h-4 w-4" />, color: "bg-red-500" },
  { id: 5, name: "Nova", icon: <Flame className="h-4 w-4" />, color: "bg-purple-500" },
]

export function TokenAnalyzer() {
  const searchParams = useSearchParams()
  const [tokenAddress, setTokenAddress] = useState("")
  const [selectedChain, setSelectedChain] = useState("solana") // Default to Solana
  const [riskPreference, setRiskPreference] = useState([3])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState("")
  const [isExecutingTrade, setIsExecutingTrade] = useState(false)
  const [tradeAmount, setTradeAmount] = useState(0.1)
  const [isValidating, setIsValidating] = useState(false)

  const validateSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address)
      return true
    } catch (error) {
      return false
    }
  }

  const handleAnalyze = async () => {
    if (!tokenAddress) {
      setError("Please enter a token address")
      return
    }

    // Validate the token address format based on selected chain
    if (selectedChain === "solana") {
      if (!validateSolanaAddress(tokenAddress)) {
        setError("Invalid Solana token address format")
        return
      }
    } else {
      // For EVM chains
      if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
        setError("Invalid EVM token address format")
        return
      }
    }

    setError("")
    setIsValidating(true)
    setAnalysisResult(null) // Clear previous results

    try {
      // First validate the token
      const tradingService = getTradingService()
      setIsAnalyzing(true)
      setIsValidating(false)

      try {
        const result = await tradingService.analyzeToken(tokenAddress, selectedChain, riskPreference[0])

        // Check if there was an error in the analysis
        if (result.error) {
          console.warn("Analysis completed with errors:", result.error)
          setError(`Warning: ${result.error}`)
        }

        setAnalysisResult(result)
      } catch (analysisError) {
        console.error("Analysis error:", analysisError)
        setError(`Failed to analyze token: ${analysisError.message || "Unknown error"}`)
      }
    } catch (err) {
      console.error("Validation error:", err)
      setError(`Failed to validate token: ${err.message || "Unknown error"}`)
    } finally {
      setIsAnalyzing(false)
      setIsValidating(false)
    }
  }

  const handleExecuteTrade = async () => {
    if (!analysisResult) return

    setIsExecutingTrade(true)
    setError("")

    try {
      const tradingService = getTradingService()
      await tradingService.executeTrade(
        analysisResult.token.address,
        selectedChain,
        tradeAmount,
        analysisResult.analysis.strategy.name,
      )
    } catch (err) {
      console.error("Trade execution error:", err)
      setError(`Failed to execute trade: ${err.message || "Unknown error"}`)
    } finally {
      setIsExecutingTrade(false)
    }
  }

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")
    const chainFromUrl = searchParams.get("chain")

    if (tokenFromUrl) {
      setTokenAddress(tokenFromUrl)
    }

    if (chainFromUrl && Object.keys(SUPPORTED_CHAINS).includes(chainFromUrl)) {
      setSelectedChain(chainFromUrl)
    }

    // Auto-analyze if both parameters are present
    if (tokenFromUrl && chainFromUrl) {
      handleAnalyze()
    }
  }, [searchParams])

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Token Analyzer</CardTitle>
          <CardDescription>Enter a token address to analyze its risk profile and execute trades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Label htmlFor="token-address">Token Address</Label>
                <Input
                  id="token-address"
                  placeholder={selectedChain === "solana" ? "Enter Solana token address..." : "0x..."}
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="chain">Blockchain</Label>
                <Select value={selectedChain} onValueChange={setSelectedChain}>
                  <SelectTrigger id="chain">
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
                      <SelectItem key={id} value={id}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label>Risk Preference</Label>
                <span className="text-sm font-medium">{riskLevels.find((r) => r.id === riskPreference[0])?.name}</span>
              </div>
              <Slider
                defaultValue={[3]}
                max={5}
                min={1}
                step={1}
                value={riskPreference}
                onValueChange={setRiskPreference}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">Cold</span>
                <span className="text-xs text-muted-foreground">Nova</span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyze} disabled={isAnalyzing || isValidating} className="w-full">
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Validating Token...
              </>
            ) : isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                Analyze Token <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {analysisResult && (
        <Tabs defaultValue="analysis">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
            <TabsTrigger value="trade">Execute Trade</TabsTrigger>
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="analysis">
            <AnalysisResult result={analysisResult} />
          </TabsContent>
          <TabsContent value="trade">
            <Card>
              <CardHeader>
                <CardTitle>Execute Trade</CardTitle>
                <CardDescription>
                  Execute a real trade based on the analysis of {analysisResult.token.symbol}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="trade-amount">Trade Amount ({selectedChain === "solana" ? "SOL" : "ETH"})</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        id="trade-amount"
                        defaultValue={[0.1]}
                        max={1}
                        min={0.01}
                        step={0.01}
                        value={[tradeAmount]}
                        onValueChange={(value) => setTradeAmount(value[0])}
                      />
                      <span className="min-w-[60px] text-right">{tradeAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Recommended Strategy</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Strategy:</span>
                        <span className="text-sm font-medium">{analysisResult.analysis.strategy.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Confidence:</span>
                        <span className="text-sm font-medium">{analysisResult.analysis.strategy.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Risk Level:</span>
                        <span className="text-sm font-medium">{analysisResult.analysis.riskLevelName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {analysisResult.analysis.strategy.description}
                      </p>
                    </div>
                  </div>

                  <Alert className="bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-600 dark:text-amber-400">Trading Risk</AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-300">
                      This will execute a real trade using actual funds. Cryptocurrency trading involves significant
                      risk. Only trade with funds you can afford to lose.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleExecuteTrade}
                  disabled={isExecutingTrade || !analysisResult.analysis.tradingEnabled}
                  className="w-full"
                  variant={analysisResult.analysis.tradingEnabled ? "default" : "outline"}
                >
                  {isExecutingTrade ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Executing Trade...
                    </>
                  ) : analysisResult.analysis.tradingEnabled ? (
                    "Execute Trade"
                  ) : (
                    "Trading Not Recommended"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="chat">
            <ChatInterface tokenData={analysisResult} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
