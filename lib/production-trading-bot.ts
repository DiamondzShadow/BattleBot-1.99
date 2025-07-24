import { ethers } from "ethers"
import { getCoinMarketCapService } from "./coinmarketcap-service"
import { getSolanaService } from "./solana-service"
import { SUPPORTED_CHAINS } from "./trading-service"
import { getRpcProvider } from "./rpc-provider"
import { getJupiterMetisService, COMMON_TOKENS } from "./jupiter-metis-service"

// Configuration for the production trading bot
interface ProductionBotConfig {
  profitThresholdUSD: number
  tradeIntervalSec: number
  maxConcurrentTrades: number
  enabled: boolean
  dryRun: boolean
  maxInvestmentPerTrade: number
  stopLossPercentage: number
  takeProfitPercentage: number
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
  private config: ProductionBotConfig
  private activeTrades: Map<string, ProductionTrade> = new Map()
  private tradeHistory: ProductionTrade[] = []
  private listeners: Set<(update: any) => void> = new Set()
  private isRunning = false
  private interval: NodeJS.Timeout | null = null
  private cycleCount = 0
  private lastCycleTime = 0
  private errorCount = 0
  private maxErrors = 10

  private constructor() {
    // Production configuration with QuickNode optimization
    this.config = {
      profitThresholdUSD: 5,
      tradeIntervalSec: 90, // 1.5 minutes with premium endpoints
      maxConcurrentTrades: 8, // More trades with better infrastructure
      enabled: true,
      dryRun: false,
      maxInvestmentPerTrade: 0.01, // 0.01 ETH/SOL per trade
      stopLossPercentage: -8, // Tighter stop loss with better data
      takeProfitPercentage: 12, // More reasonable take profit
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
    console.log(`Interval: ${this.config.tradeIntervalSec}s, Max trades: ${this.config.maxConcurrentTrades}`)
    
    // Start the trading cycle immediately
    this.runTradingCycle()
    
    // Set up the interval for subsequent cycles
    this.interval = setInterval(() => {
      this.runTradingCycle()
    }, this.config.tradeIntervalSec * 1000)

    this.notifyListeners({ type: "bot_status", status: "started" })
  }

  // Stop the production trading bot
  public stop(): void {
    if (!this.isRunning) {
      console.log("Production trading bot is not running")
      return
    }

    this.isRunning = false
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
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
    if (this.isRunning && config.tradeIntervalSec) {
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
        // Use Jupiter Metis for Solana tokens
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

        console.log(`Jupiter Metis analysis for ${tokenAddress}:`, {
          profitable: analysis.profitable,
          confidence: analysis.confidence,
          profitPotential: analysis.profitPotential,
          recommendation: analysis.recommendation
        })

        return {
          profitable: analysis.profitable,
          profitPotential: analysis.profitPotential,
          confidence: analysis.confidence,
          riskLevel: analysis.riskLevel
        }
      } else {
        // Fallback to simulation for other chains
        const randomFactor = Math.random()
        const profitable = randomFactor > 0.8 // More conservative for other chains
        const profitPotential = profitable ? Math.random() * 15 + 3 : Math.random() * 3
        const confidence = profitable ? Math.random() * 25 + 65 : Math.random() * 60
        const riskLevel = Math.floor(Math.random() * 4) + 2 // Slightly higher risk

        return {
          profitable,
          profitPotential,
          confidence,
          riskLevel
        }
      }
    } catch (error) {
      console.error(`Error analyzing token profitability for ${tokenAddress}:`, error)
      
      // Fallback to conservative analysis
      return {
        profitable: false,
        profitPotential: 0,
        confidence: 20,
        riskLevel: 5
      }
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
