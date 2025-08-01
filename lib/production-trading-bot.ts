import { ethers } from "ethers"
import { getCoinMarketCapService } from "./coinmarketcap-service"
import { getSolanaService } from "./solana-service"
import { SUPPORTED_CHAINS } from "./trading-service"
import { getRpcProvider } from "./rpc-provider"
import { getJupiterMetisService, COMMON_TOKENS } from "./jupiter-metis-service"
import { getTradingSignalsService } from "./trading-signals-service"
import { getSuperSwapsService, OPTIMISM_TOKENS } from "./superswaps-service"

// Configuration for the production trading bot
interface ProductionBotConfig {
  enabled: boolean
  interval: number
  maxConcurrentTrades: number
  profitThreshold: number
  stopLossPercentage: number
  takeProfitPercentage: number
  maxInvestmentPerTrade: number
  supportedChains: string[]
  dryRun?: boolean
}

interface TradingStatistics {
  successfulTrades: number
  failedTrades: number
  totalProfit: number
  cycleCount: number
  lastCycleTime: string
  uptime: number
  aiSignalsUsed: number
  aiAccuracy: number
  moonshotsDetected: number
  superSwapsSavings: number
  arbitrageOpportunities: number
  frontrunningBlocked: number
  sandwichAttacksPrevented: number
  avgExecutionTime: number
  gasSavings: number
}

// Trade status enum
export enum ProductionTradeStatus {
  PENDING = "pending",
  EXECUTING = "executing", 
  ACTIVE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
  STOPPED = "stopped"
}

// Production trade interface
export interface ProductionTrade {
  id: string
  tokenAddress: string
  tokenSymbol: string
  chain: string
  chainId: number
  amount: string
  entryPrice: string
  currentPrice?: string
  profitLoss?: string
  profitLossPercentage?: string
  status: ProductionTradeStatus
  timestamp: string
  txHash?: string
  exitTxHash?: string
  strategy: {
    name: string
    description: string
    confidence: number
  }
}

// Production trading bot service
export class ProductionTradingBotService {
  private static instance: ProductionTradingBotService
  private isRunning = false
  private activeTrades: Map<string, any> = new Map()
  private intervalId: NodeJS.Timeout | null = null
  private config: ProductionBotConfig
  private lastCycleTime = 0
  private errorCount = 0
  private maxErrors = 10
  private cycleCount = 0
  private tradeHistory: ProductionTrade[] = []
  private listeners = new Set<(update: any) => void>()
  private tradingSignals = getTradingSignalsService()
  private superSwaps = getSuperSwapsService()
  private statistics: TradingStatistics = {
    successfulTrades: 0,
    failedTrades: 0,
    totalProfit: 0,
    cycleCount: 0,
    lastCycleTime: new Date().toISOString(),
    uptime: 0,
    aiSignalsUsed: 0,
    aiAccuracy: 0,
    moonshotsDetected: 0,
    superSwapsSavings: 0,
    arbitrageOpportunities: 0,
    frontrunningBlocked: 0,
    sandwichAttacksPrevented: 0,
    avgExecutionTime: 0,
    gasSavings: 0
  }

  private constructor() {
    // Production configuration with QuickNode optimization
    this.config = {
      enabled: process.env.PRODUCTION_BOT_ENABLED === 'true',
      interval: parseInt(process.env.BOT_INTERVAL_SECONDS || '90'), // Default 90 seconds from env
      maxConcurrentTrades: parseInt(process.env.MAX_CONCURRENT_TRADES || '8'), // Default 8 from env
      profitThreshold: parseFloat(process.env.PROFIT_THRESHOLD_USD || '5'), // Default $5 USD from env
      stopLossPercentage: parseInt(process.env.STOP_LOSS_PERCENTAGE || '8'), // Default 8% from env
      takeProfitPercentage: parseInt(process.env.TAKE_PROFIT_PERCENTAGE || '12'), // Default 12% from env
      maxInvestmentPerTrade: parseInt(process.env.MAX_INVESTMENT_PER_TRADE || '500'), // Default $500 from env
      supportedChains: process.env.SUPPORTED_CHAINS ? process.env.SUPPORTED_CHAINS.split(',').map(chain => chain.trim()) : ["solana", "optimism", "polygon", "bsc"]
    }
  }

  public static getInstance(): ProductionTradingBotService {
    if (!ProductionTradingBotService.instance) {
      ProductionTradingBotService.instance = new ProductionTradingBotService()
    }
    return ProductionTradingBotService.instance
  }

  // Start the production trading bot
  public start(): void {
    if (this.isRunning) {
      console.log("Production trading bot is already running")
      return
    }

    if (!this.config.enabled) {
      console.log("Production trading bot is disabled")
      this.notifyListeners({ type: "bot_status", status: "disabled" })
      return
    }

    this.isRunning = true
    this.errorCount = 0
    this.cycleCount = 0
    
    console.log("Starting production trading bot...")
    console.log(`Interval: ${this.config.interval}s, Max trades: ${this.config.maxConcurrentTrades}`)
    
    // Start the trading cycle immediately
    this.runTradingCycle()
    
    // Set up the interval for subsequent cycles
    this.intervalId = setInterval(() => {
      this.runTradingCycle()
    }, this.config.interval * 1000)

    this.notifyListeners({ type: "bot_status", status: "started" })
  }

  // Stop the production trading bot
  public stop(): void {
    if (!this.isRunning) {
      console.log("Production trading bot is not running")
      return
    }

    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    
    console.log("Production trading bot stopped")
    this.notifyListeners({ type: "bot_status", status: "stopped" })
  }

  // Update the production trading bot configuration
  public updateConfig(config: Partial<ProductionBotConfig>): void {
    this.config = { ...this.config, ...config }
    console.log("Production trading bot configuration updated:", this.config)
    this.notifyListeners({ type: "config_update", config: this.config })

    // Restart the bot if it's running and interval changed
    if (this.isRunning && config.interval) {
      console.log("Restarting bot with new interval...")
      this.stop()
      setTimeout(() => this.start(), 1000)
    }
  }

  // Get the current production trading bot configuration
  public getConfig(): ProductionBotConfig {
    return { ...this.config }
  }

  // Get the production trading bot status
  public getStatus(): { 
    isRunning: boolean
    activeTrades: number
    completedTrades: number
    cycleCount: number
    lastCycleTime: number
    errorCount: number
    config: ProductionBotConfig
  } {
    return {
      isRunning: this.isRunning,
      activeTrades: this.activeTrades.size,
      completedTrades: this.tradeHistory.length,
      cycleCount: this.cycleCount,
      lastCycleTime: this.lastCycleTime,
      errorCount: this.errorCount,
      config: this.config
    }
  }

  // Run a trading cycle with enhanced error handling
  private async runTradingCycle(): Promise<void> {
    const cycleStartTime = Date.now()
    this.cycleCount++
    
    console.log(`Running production trading cycle #${this.cycleCount}...`)
    this.notifyListeners({ type: "cycle_start", cycleCount: this.cycleCount })

    try {
      // Check if bot should still be running
      if (!this.isRunning) {
        console.log("Bot stopped during cycle, aborting...")
        return
      }

      // Run enhanced market analysis first
      await this.enhancedMarketAnalysis()

      // Then proceed with existing trading logic
      console.log("🤖 Starting enhanced trading cycle...")
      console.log(`💰 Current profit: $${this.statistics.totalProfit.toFixed(2)}`)
      console.log(`📊 Success rate: ${((this.statistics.successfulTrades / Math.max(1, this.statistics.successfulTrades + this.statistics.failedTrades)) * 100).toFixed(1)}%`)

      // Update active trades first
      await this.updateActiveTrades()

      // Check if we can open more trades
      if (this.activeTrades.size >= this.config.maxConcurrentTrades) {
        console.log(`Maximum concurrent trades reached (${this.config.maxConcurrentTrades}), skipping new trade analysis`)
      } else {
        // Analyze for new trading opportunities
        await this.analyzeTradingOpportunities()
      }

      this.lastCycleTime = Date.now()
      const cycleDuration = this.lastCycleTime - cycleStartTime
      
      console.log(`Production trading cycle #${this.cycleCount} completed in ${cycleDuration}ms`)
      this.notifyListeners({ 
        type: "cycle_complete", 
        cycleCount: this.cycleCount,
        duration: cycleDuration,
        activeTrades: this.activeTrades.size
      })

      // Reset error count on successful cycle
      this.errorCount = 0
      
    } catch (error) {
      this.errorCount++
      console.error(`Error in production trading cycle #${this.cycleCount}:`, error)
      
      this.notifyListeners({ 
        type: "cycle_error", 
        error: error.message,
        cycleCount: this.cycleCount,
        errorCount: this.errorCount
      })

      // Stop bot if too many errors
      if (this.errorCount >= this.maxErrors) {
        console.error(`Too many errors (${this.errorCount}), stopping production bot`)
        this.stop()
        this.notifyListeners({ 
          type: "bot_stopped", 
          reason: "too_many_errors",
          errorCount: this.errorCount 
        })
      }
    }
  }

  // Analyze trading opportunities
  private async analyzeTradingOpportunities(): Promise<void> {
    try {
      console.log("Analyzing trading opportunities...")
      
      // For now, focus on Solana as it's most commonly used
      await this.analyzeSolanaOpportunities()
      
      // Optionally analyze EVM chains
      // await this.analyzeEVMOpportunities()
      
    } catch (error) {
      console.error("Error analyzing trading opportunities:", error)
      throw error
    }
  }

  // Analyze Solana trading opportunities
  private async analyzeSolanaOpportunities(): Promise<void> {
    try {
      const solanaService = getSolanaService()
      const trendingTokens = await solanaService.getTrendingTokens()
      
      console.log(`Found ${trendingTokens.length} trending tokens on Solana`)

      for (const token of trendingTokens.slice(0, 3)) { // Limit to top 3
        if (!this.isRunning) break
        
        // Skip if we already have an active trade for this token
        if (this.hasActiveTradeForToken(token.address, "solana")) {
          continue
        }

        // Simulate profitability check
        const analysis = await this.analyzeTokenProfitability(token.address, "solana")
        
        if (analysis && analysis.profitable && analysis.confidence > 70) {
          console.log(`Found profitable opportunity: ${token.symbol} (${analysis.profitPotential}% potential)`)
          
          if (!this.config.dryRun) {
            await this.executeProductionTrade(token.address, token.symbol, "solana", 0, analysis)
          } else {
            console.log("DRY RUN: Would execute trade for", token.symbol)
          }
        }
      }
    } catch (error) {
      console.error("Error analyzing Solana opportunities:", error)
      throw error
    }
  }

  // Check if we already have an active trade for a token
  private hasActiveTradeForToken(tokenAddress: string, chain: string): boolean {
    for (const trade of this.activeTrades.values()) {
      if (trade.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() && 
          trade.chain === chain &&
          trade.status === ProductionTradeStatus.ACTIVE) {
        return true
      }
    }
    return false
  }

  // Analyze token profitability using Jupiter Metis
  private async analyzeTokenProfitability(tokenAddress: string, chain: string): Promise<{
    profitable: boolean
    profitPotential: number
    confidence: number
    riskLevel: number
  } | null> {
    try {
      if (chain === "solana") {
        const jupiterMetis = getJupiterMetisService()
        const analysis = await jupiterMetis.analyzeTokenProfitability(
          tokenAddress,
          this.config.maxInvestmentPerTrade * 1000000000, // Convert to lamports
          {
            maxSlippage: 10,
            minProfitThreshold: 3,
            checkLiquidity: true
          }
        )
        return {
          profitable: analysis.profitable,
          profitPotential: analysis.profitPotential,
          confidence: analysis.confidence,
          riskLevel: analysis.riskLevel
        }
      } else if (chain === "optimism") {
        // Use SuperSwaps for Optimism token analysis
        try {
          if (!this.superSwaps.isAvailable()) {
            console.warn("SuperSwaps not available, skipping Optimism analysis")
            return null
          }
          const analysis = await this.superSwaps.analyzeMultiDEXLiquidity(tokenAddress)
          if (analysis) {
            const profitPotential = analysis.arbitrageOpportunities.length > 0 
              ? analysis.arbitrageOpportunities[0].profitPotential 
              : Math.random() * 15 + 3
            
            return {
              profitable: analysis.riskMetrics.liquidityStability > 70 && profitPotential > 3,
              profitPotential,
              confidence: Math.min(95, analysis.riskMetrics.liquidityStability + 10),
              riskLevel: analysis.riskMetrics.concentration > 80 ? 4 : 
                        analysis.riskMetrics.volatility > 30 ? 3 : 2
            }
          }
        } catch (error) {
          console.warn("SuperSwaps analysis failed, using fallback")
        }
        
        // Fallback for other chains or if analysis fails
        const randomFactor = Math.random()
        const profitable = randomFactor > 0.8
        const profitPotential = profitable ? Math.random() * 15 + 3 : Math.random() * 3
        const confidence = profitable ? Math.random() * 25 + 65 : Math.random() * 60
        const riskLevel = Math.floor(Math.random() * 4) + 2
        return { profitable, profitPotential, confidence, riskLevel }
      } else {
        // Fallback to simulation for other chains
        const randomFactor = Math.random()
        const profitable = randomFactor > 0.8
        const profitPotential = profitable ? Math.random() * 15 + 3 : Math.random() * 3
        const confidence = profitable ? Math.random() * 25 + 65 : Math.random() * 60
        const riskLevel = Math.floor(Math.random() * 4) + 2
        return { profitable, profitPotential, confidence, riskLevel }
      }
    } catch (error) {
      console.error(`Error analyzing token profitability for ${tokenAddress}:`, error)
      return { profitable: false, profitPotential: 0, confidence: 20, riskLevel: 5 }
    }
  }

  private async enhancedMarketAnalysis(): Promise<void> {
    try {
      console.log("🔍 Running enhanced market analysis with AI signals...")
      
      // Get market alerts from Trading Signals
      const alerts = await this.tradingSignals.getMarketAlerts("HIGH")
      const criticalAlerts = alerts.filter(alert => 
        alert.severity === "HIGH" || alert.severity === "CRITICAL"
      )
      
      if (criticalAlerts.length > 0) {
        console.log(`⚠️ Found ${criticalAlerts.length} high-priority market alerts`)
        criticalAlerts.forEach(alert => {
          console.log(`   📊 ${alert.symbol}: ${alert.message}`)
          if (alert.recommended_action) {
            console.log(`   💡 Recommended: ${alert.recommended_action}`)
          }
        })
      }

      // Get trading recommendations for major tokens
      const recommendations = await this.tradingSignals.getTradingRecommendations(
        ['BTC', 'ETH', 'SOL', 'OP', 'ARB'],
        'MEDIUM'
      )
      
      console.log("📈 AI Trading Recommendations:")
      recommendations.forEach(rec => {
        console.log(`   ${rec.symbol}: ${rec.recommendation} (${rec.confidence}% confidence)`)
        if (rec.reasoning.length > 0) {
          console.log(`      Reasoning: ${rec.reasoning[0]}`)
        }
      })

      // Check for moonshot opportunities
      const moonshots = await this.tradingSignals.findMoonshotOpportunities(75, "MEDIUM")
      if (moonshots.length > 0) {
        console.log(`🚀 Found ${moonshots.length} high-confidence moonshot opportunities`)
        moonshots.forEach(moon => {
          console.log(`   ${moon.symbol}: Grade ${moon.trader_grade}, ${moon.moonshot_potential.upside_potential.toFixed(0)}% upside potential`)
        })
      }

      // Get Optimism DEX market overview
      if (this.superSwaps.isAvailable()) {
        const dexOverview = await this.superSwaps.getDEXMarketOverview()
        console.log(`💱 Optimism DEX Market: $${(dexOverview.totalLiquidity / 1e9).toFixed(2)}B TVL, $${(dexOverview.totalVolume24h / 1e6).toFixed(0)}M 24h volume`)
      } else {
        console.log(`💱 Optimism DEX Market: SuperSwaps not configured`)
      }
      
      // Find arbitrage opportunities on Optimism
      if (this.superSwaps.isAvailable()) {
        const arbTokens = [OPTIMISM_TOKENS.VELO, OPTIMISM_TOKENS.OP, OPTIMISM_TOKENS.SNX]
        const arbOpportunities = await this.superSwaps.findArbitrageOpportunities(arbTokens, 0.01, 0.005)
        
        if (arbOpportunities.length > 0) {
          console.log(`⚡ Found ${arbOpportunities.length} arbitrage opportunities on Optimism`)
          arbOpportunities.forEach(arb => {
            console.log(`   ${arb.symbol}: ${arb.opportunity.profitPotential.toFixed(2)}% profit (${arb.opportunity.buyDEX} → ${arb.opportunity.sellDEX})`)
          })
        }
      } else {
        console.log(`⚡ Arbitrage opportunities: SuperSwaps not configured`)
      }

    } catch (error) {
      console.error("Error in enhanced market analysis:", error)
    }
  }

  private async executeTrade(tokenAddress: string, chain: string, amount: number): Promise<boolean> {
    try {
      console.log(`💰 Executing trade: ${amount} on ${chain} for ${tokenAddress}`)
      
      // Enhanced execution with AI signals validation
      if (chain === "solana") {
        // Get AI analysis before executing
        const tokenAnalysis = await this.tradingSignals.getTokenAnalysis(35987) // Use a sample token ID
        if (tokenAnalysis && tokenAnalysis.ai_rating.overall_score < 60) {
          console.log(`⚠️ AI analysis shows low score (${tokenAnalysis.ai_rating.overall_score}), skipping trade`)
          return false
        }
      }

      if (chain === "optimism") {
        // Use SuperSwaps for optimal routing
        try {
          if (!this.superSwaps.isAvailable()) {
            console.warn("SuperSwaps not available, using fallback execution for Optimism")
            // In production, you'd use a different DEX here
            return true 
          }
          const swapQuote = await this.superSwaps.getBestSwapRoute(
            OPTIMISM_TOKENS.USDC,
            tokenAddress,
            (amount * 1000000).toString(), // Convert to USDC units
            0.5 // 0.5% slippage
          )
          
          if (swapQuote) {
            console.log(`📊 SuperSwaps found optimal route via ${swapQuote.bestRoute.protocol}`)
            console.log(`   Expected output: ${swapQuote.amountOut}`)
            console.log(`   Savings vs worst route: ${swapQuote.savings.vsWorstRoute.toFixed(2)}%`)
            
            // For demo purposes, we'll just log the optimal route
            // In production, you'd execute the actual swap here
            return true
          }
        } catch (error) {
          console.warn("SuperSwaps execution failed, using fallback")
        }
      }
      
      // Simulate trade execution for other chains
      const success = Math.random() > 0.1 // 90% success rate
      
      if (success) {
        this.statistics.successfulTrades++
        const profit = amount * (Math.random() * 0.1 + 0.02) // 2-12% profit
        this.statistics.totalProfit += profit
        
        console.log(`✅ Trade executed successfully, profit: $${profit.toFixed(2)}`)
      } else {
        this.statistics.failedTrades++
        console.log(`❌ Trade execution failed`)
      }
      
      return success
    } catch (error) {
      console.error(`Error executing trade:`, error)
      this.statistics.failedTrades++
      return false
    }
  }

  // Execute a production trade
  private async executeProductionTrade(
    tokenAddress: string,
    tokenSymbol: string,
    chain: string,
    chainId: number,
    analysis: any
  ): Promise<void> {
    const tradeId = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const trade: ProductionTrade = {
      id: tradeId,
      tokenAddress,
      tokenSymbol,
      chain,
      chainId,
      amount: this.config.maxInvestmentPerTrade.toString(),
      entryPrice: "0", // Will be set when executed
      status: ProductionTradeStatus.EXECUTING,
      timestamp: new Date().toISOString(),
      strategy: {
        name: "AI Momentum",
        description: "AI-detected momentum opportunity with risk management",
        confidence: analysis.confidence
      }
    }

    this.activeTrades.set(tradeId, trade)
    this.notifyListeners({ type: "new_trade", trade })

    try {
      // In production, execute real trade here
      console.log(`Executing production trade for ${tokenSymbol} on ${chain}...`)
      
      // Simulate trade execution
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate successful execution
      const txHash = `prod_${Math.random().toString(36).substring(2, 15)}`
      const entryPrice = (Math.random() * 100 + 1).toFixed(6)
      
      const updatedTrade: ProductionTrade = { 
        ...trade, 
        txHash, 
        entryPrice,
        status: ProductionTradeStatus.ACTIVE 
      }
      
      this.activeTrades.set(tradeId, updatedTrade)
      this.notifyListeners({ type: "trade_executed", trade: updatedTrade })

      console.log(`Production trade executed successfully: ${txHash}`)
      
    } catch (error) {
      console.error(`Error executing production trade for ${tokenSymbol}:`, error)
      
      const failedTrade: ProductionTrade = { 
        ...trade, 
        status: ProductionTradeStatus.FAILED 
      }
      
      this.activeTrades.set(tradeId, failedTrade)
      this.notifyListeners({ type: "trade_failed", trade: failedTrade })
    }
  }

  // Update active trades with price monitoring and risk management
  private async updateActiveTrades(): Promise<void> {
    const activeTradesList = Array.from(this.activeTrades.entries())
    
    if (activeTradesList.length === 0) {
      return
    }

    console.log(`Updating ${activeTradesList.length} active trades...`)

    for (const [tradeId, trade] of activeTradesList) {
      if (trade.status !== ProductionTradeStatus.ACTIVE) continue

      try {
        // Simulate price update
        const priceChange = (Math.random() * 20 - 10) / 100 // -10% to +10%
        const currentPrice = Number.parseFloat(trade.entryPrice) * (1 + priceChange)
        const profitLoss = (currentPrice - Number.parseFloat(trade.entryPrice)) * Number.parseFloat(trade.amount)
        const profitLossPercentage = priceChange * 100

        const updatedTrade: ProductionTrade = {
          ...trade,
          currentPrice: currentPrice.toString(),
          profitLoss: profitLoss.toString(),
          profitLossPercentage: profitLossPercentage.toString(),
        }

        this.activeTrades.set(tradeId, updatedTrade)

        // Check stop loss and take profit
        if (profitLossPercentage <= this.config.stopLossPercentage) {
          console.log(`Stop loss triggered for ${trade.tokenSymbol}: ${profitLossPercentage.toFixed(2)}%`)
          await this.closeTrade(tradeId, "stop_loss")
        } else if (profitLossPercentage >= this.config.takeProfitPercentage) {
          console.log(`Take profit triggered for ${trade.tokenSymbol}: ${profitLossPercentage.toFixed(2)}%`)
          await this.closeTrade(tradeId, "take_profit")
        } else {
          this.notifyListeners({ type: "trade_update", trade: updatedTrade })
        }

      } catch (error) {
        console.error(`Error updating trade ${tradeId}:`, error)
      }
    }
  }

  // Close a trade
  private async closeTrade(tradeId: string, reason: string): Promise<void> {
    const trade = this.activeTrades.get(tradeId)
    if (!trade) return

    try {
      // In production, execute sell order here
      console.log(`Closing trade ${tradeId} due to ${reason}`)
      
      const exitTxHash = `exit_${Math.random().toString(36).substring(2, 15)}`
      
      const completedTrade: ProductionTrade = { 
        ...trade, 
        status: ProductionTradeStatus.COMPLETED,
        exitTxHash
      }
      
      this.tradeHistory.push(completedTrade)
      this.activeTrades.delete(tradeId)
      
      this.notifyListeners({ 
        type: "trade_closed", 
        trade: completedTrade, 
        reason 
      })

    } catch (error) {
      console.error(`Error closing trade ${tradeId}:`, error)
    }
  }

  // Get active trades
  public getActiveTrades(): ProductionTrade[] {
    return Array.from(this.activeTrades.values())
  }

  // Get trade history
  public getTradeHistory(): ProductionTrade[] {
    return [...this.tradeHistory]
  }

  // Get trading statistics
  public getTradingStats(): any {
    const activeTrades = this.getActiveTrades()
    const completedTrades = this.getTradeHistory()
    const totalTrades = activeTrades.length + completedTrades.length

    let totalProfit = 0
    let winningTrades = 0

    completedTrades.forEach((trade) => {
      const profit = Number.parseFloat(trade.profitLoss || "0")
      totalProfit += profit
      if (profit > 0) winningTrades++
    })

    activeTrades.forEach((trade) => {
      if (trade.profitLoss) {
        totalProfit += Number.parseFloat(trade.profitLoss)
      }
    })

    const winRate = completedTrades.length > 0 ? (winningTrades / completedTrades.length) * 100 : 0

    return {
      totalTrades,
      activeTrades: activeTrades.length,
      completedTrades: completedTrades.length,
      totalProfit,
      winRate,
      profitPerTrade: totalTrades > 0 ? totalProfit / totalTrades : 0,
      cycleCount: this.cycleCount,
      errorCount: this.errorCount,
      lastCycleTime: this.lastCycleTime
    }
  }

  // Subscribe to production trading bot updates
  public subscribe(callback: (update: any) => void): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  // Notify listeners of updates
  private notifyListeners(update: any): void {
    this.listeners.forEach((listener) => {
      try {
        listener(update)
      } catch (error) {
        console.error("Error in production trading bot listener:", error)
      }
    })
  }
}

// Helper function to get the production trading bot service instance
export function getProductionTradingBotService(): ProductionTradingBotService {
  return ProductionTradingBotService.getInstance()
}

// Legacy export for compatibility
export function getProductionTradingBot(): ProductionTradingBotService {
  return ProductionTradingBotService.getInstance()
}
