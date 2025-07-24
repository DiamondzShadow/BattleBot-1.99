import { ethers } from "ethers"
import { getCoinMarketCapService } from "./coinmarketcap-service"
import { getSolanaService } from "./solana-service"
import { SUPPORTED_CHAINS } from "./trading-service"

// Configuration for the trading bot
interface TradingBotConfig {
  profitThresholdUSD: number
  tradeIntervalSec: number
  maxConcurrentTrades: number
  riskLevels: {
    [key: string]: {
      maxRisk: number
      minProfit: number
    }
  }
}

// Trade status enum
export enum TradeStatus {
  PENDING = "pending",
  EXECUTING = "executing",
  ACTIVE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
}

// Trade interface
export interface Trade {
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
  status: TradeStatus
  riskLevel: number
  timestamp: string
  txHash?: string
  strategy: {
    name: string
    description: string
    confidence: number
  }
}

// Trading bot service
export class TradingBotService {
  private static instance: TradingBotService
  private config: TradingBotConfig
  private activeTrades: Map<string, Trade> = new Map()
  private tradeHistory: Trade[] = []
  private listeners: Set<(update: any) => void> = new Set()
  private isRunning = false
  private interval: NodeJS.Timeout | null = null

  private constructor() {
    // Default configuration - optimized for multi-chain trading
    this.config = {
      profitThresholdUSD: 3,
      tradeIntervalSec: 45, // Faster with premium QuickNode endpoints
      maxConcurrentTrades: 15, // More trades across multiple chains
      riskLevels: {
        cold: { maxRisk: 1, minProfit: 1 },
        warm: { maxRisk: 2, minProfit: 2 },
        hot: { maxRisk: 3, minProfit: 4 },
        steaming: { maxRisk: 4, minProfit: 8 },
        nova: { maxRisk: 5, minProfit: 15 },
      },
    }
  }

  public static getInstance(): TradingBotService {
    if (!TradingBotService.instance) {
      TradingBotService.instance = new TradingBotService()
    }
    return TradingBotService.instance
  }

  // Start the trading bot
  public start(): void {
    if (this.isRunning) {
      console.log("Trading bot is already running")
      return
    }

    this.isRunning = true
    console.log("Starting trading bot...")
    console.log(`Interval: ${this.config.tradeIntervalSec}s, Max trades: ${this.config.maxConcurrentTrades}`)
    
    // Start the trading cycle immediately
    this.runTradingCycle()
    
    // Set up the interval for subsequent cycles
    this.interval = setInterval(() => {
      this.runTradingCycle()
    }, this.config.tradeIntervalSec * 1000)

    console.log("Trading bot started")
    this.notifyListeners({ type: "bot_status", status: "started" })
  }

  // Stop the trading bot
  public stop(): void {
    if (!this.isRunning) {
      console.log("Trading bot is not running")
      return
    }

    this.isRunning = false
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    console.log("Trading bot stopped")
    this.notifyListeners({ type: "bot_status", status: "stopped" })
  }

  // Update the trading bot configuration
  public updateConfig(config: Partial<TradingBotConfig>): void {
    this.config = { ...this.config, ...config }
    console.log("Trading bot configuration updated:", this.config)
    this.notifyListeners({ type: "config_update", config: this.config })

    // Restart the bot if it's running and interval changed
    if (this.isRunning && config.tradeIntervalSec) {
      console.log("Restarting bot with new interval...")
      this.stop()
      setTimeout(() => this.start(), 1000)
    }
  }

  // Get the current trading bot configuration
  public getConfig(): TradingBotConfig {
    return { ...this.config }
  }

  // Get the trading bot status
  public getStatus(): { isRunning: boolean; activeTrades: number; completedTrades: number } {
    return {
      isRunning: this.isRunning,
      activeTrades: this.activeTrades.size,
      completedTrades: this.tradeHistory.length,
    }
  }

  // Run a trading cycle
  private async runTradingCycle(): Promise<void> {
    console.log("Running trading cycle...")
    this.notifyListeners({ type: "cycle_start" })

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
        // Get trending tokens for each chain
        await this.analyzeTrendingTokens()
      }

      this.notifyListeners({ type: "cycle_complete" })
    } catch (error) {
      console.error("Error in trading cycle:", error)
      this.notifyListeners({ type: "cycle_error", error: error.message })
      
      // Don't stop the bot on individual cycle errors, just log and continue
    }
  }

  // Analyze trending tokens for trading opportunities
  private async analyzeTrendingTokens(): Promise<void> {
    // Process EVM chains
    for (const [chainKey, chainInfo] of Object.entries(SUPPORTED_CHAINS)) {
      if (chainKey === "solana") continue // Skip Solana, will handle separately

      try {
        console.log(`Analyzing trending tokens for ${chainInfo.name}...`)
        const cmcService = getCoinMarketCapService()
        const trendingTokens = await cmcService.getTrendingTokens(chainKey)

        for (const token of trendingTokens) {
          // Skip if we already have an active trade for this token
          const tokenAddress = token.platform?.token_address || ""
          if (!tokenAddress || this.hasActiveTradeForToken(tokenAddress, chainKey)) {
            continue
          }

          // Simulate a trade to check profitability
          const simulation = await this.simulateTradeEVM(chainKey, tokenAddress)
          if (simulation && simulation.profitUSD > this.config.profitThresholdUSD) {
            console.log(`Found profitable trade opportunity for ${token.symbol} on ${chainInfo.name}`)
            await this.executeTrade(tokenAddress, token.symbol, chainKey, chainInfo.id, simulation)
          }
        }
      } catch (error) {
        console.error(`Error analyzing trending tokens for ${chainInfo.name}:`, error)
      }
    }

    // Process Solana
    try {
      console.log("Analyzing trending tokens for Solana...")
      const solanaService = getSolanaService()
      const trendingTokens = await solanaService.getTrendingTokens()

      for (const token of trendingTokens) {
        // Skip if we already have an active trade for this token
        if (this.hasActiveTradeForToken(token.address, "solana")) {
          continue
        }

        // Simulate a trade to check profitability
        const simulation = await this.simulateTradeSolana(token.address)
        if (simulation && simulation.profitUSD > this.config.profitThresholdUSD) {
          console.log(`Found profitable trade opportunity for ${token.symbol} on Solana`)
          await this.executeTrade(token.address, token.symbol, "solana", 0, simulation)
        }
      }
    } catch (error) {
      console.error("Error analyzing trending tokens for Solana:", error)
    }
  }

  // Check if we already have an active trade for a token
  private hasActiveTradeForToken(tokenAddress: string, chain: string): boolean {
    for (const trade of this.activeTrades.values()) {
      if (trade.tokenAddress.toLowerCase() === tokenAddress.toLowerCase() && trade.chain === chain) {
        return true
      }
    }
    return false
  }

  // Simulate a trade on an EVM chain
  private async simulateTradeEVM(
    chain: string,
    tokenAddress: string,
  ): Promise<{ profitUSD: number; buyQuote: any } | null> {
    try {
      // In production, this would call the 0x API to get swap quotes
      // For now, we'll simulate a profitable trade
      const profitUSD = Math.random() * 10 // Random profit between 0 and 10 USD

      // Simulate a buy quote
      const buyQuote = {
        price: Math.random() * 100,
        guaranteedPrice: Math.random() * 90,
        estimatedGas: 150000,
        to: "0x...",
        data: "0x...",
        value: ethers.utils.parseEther("0.01").toString(),
      }

      return { profitUSD, buyQuote }
    } catch (error) {
      console.error(`Error simulating EVM trade for ${tokenAddress} on ${chain}:`, error)
      return null
    }
  }

  // Simulate a trade on Solana
  private async simulateTradeSolana(tokenAddress: string): Promise<{ profitUSD: number; buyQuote: any } | null> {
    try {
      // In production, this would call the QuickNode Solana API to get swap quotes
      // For now, we'll simulate a profitable trade
      const profitUSD = Math.random() * 10 // Random profit between 0 and 10 USD

      // Simulate a buy quote
      const buyQuote = {
        inAmount: 10000000, // 0.01 SOL in lamports
        outAmount: Math.floor(Math.random() * 1000000000),
        estimatedGas: 5000,
        swapTransaction: "base64...",
      }

      return { profitUSD, buyQuote }
    } catch (error) {
      console.error(`Error simulating Solana trade for ${tokenAddress}:`, error)
      return null
    }
  }

  // Execute a trade
  private async executeTrade(
    tokenAddress: string,
    tokenSymbol: string,
    chain: string,
    chainId: number,
    simulation: { profitUSD: number; buyQuote: any },
  ): Promise<void> {
    // Generate a unique trade ID
    const tradeId = `trade-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create a new trade object
    const trade: Trade = {
      id: tradeId,
      tokenAddress,
      tokenSymbol,
      chain,
      chainId,
      amount: "0.01", // Fixed amount for now
      entryPrice: simulation.buyQuote.price?.toString() || "0",
      status: TradeStatus.EXECUTING,
      riskLevel: Math.floor(Math.random() * 5) + 1, // Random risk level for now
      timestamp: new Date().toISOString(),
      strategy: {
        name: ["Momentum", "Breakout", "Volatility", "Swing", "Liquidity"][Math.floor(Math.random() * 5)],
        description: "AI-detected trading opportunity based on market conditions",
        confidence: Math.floor(Math.random() * 30) + 70,
      },
    }

    // Add the trade to active trades
    this.activeTrades.set(tradeId, trade)
    this.notifyListeners({ type: "new_trade", trade })

    try {
      // In production, this would execute the actual trade
      // For now, we'll simulate a successful trade execution
      console.log(`Executing trade for ${tokenSymbol} on ${chain}...`)

      // Simulate transaction hash
      const txHash = `0x${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`

      // Update the trade with the transaction hash
      const updatedTrade = { ...trade, txHash, status: TradeStatus.ACTIVE }
      this.activeTrades.set(tradeId, updatedTrade)
      this.notifyListeners({ type: "trade_update", trade: updatedTrade })

      console.log(`Trade executed successfully: ${txHash}`)
    } catch (error) {
      console.error(`Error executing trade for ${tokenSymbol} on ${chain}:`, error)

      // Update the trade status to failed
      const failedTrade = { ...trade, status: TradeStatus.FAILED }
      this.activeTrades.set(tradeId, failedTrade)
      this.notifyListeners({ type: "trade_update", trade: failedTrade })
    }
  }

  // Update active trades
  private async updateActiveTrades(): Promise<void> {
    for (const [tradeId, trade] of this.activeTrades.entries()) {
      if (trade.status !== TradeStatus.ACTIVE) continue

      try {
        // In production, this would fetch the current price from an API
        // For now, we'll simulate price changes
        const priceChange = (Math.random() * 10 - 5) / 100 // -5% to +5%
        const currentPrice = Number.parseFloat(trade.entryPrice) * (1 + priceChange)
        const profitLoss = (currentPrice - Number.parseFloat(trade.entryPrice)) * Number.parseFloat(trade.amount)
        const profitLossPercentage = priceChange * 100

        // Update the trade with the new price and profit/loss
        const updatedTrade = {
          ...trade,
          currentPrice: currentPrice.toString(),
          profitLoss: profitLoss.toString(),
          profitLossPercentage: profitLossPercentage.toString(),
        }

        this.activeTrades.set(tradeId, updatedTrade)
        this.notifyListeners({ type: "trade_update", trade: updatedTrade })

        // Randomly close some trades
        if (Math.random() > 0.9) {
          this.closeTrade(tradeId)
        }
      } catch (error) {
        console.error(`Error updating trade ${tradeId}:`, error)
      }
    }
  }

  // Close a trade
  private closeTrade(tradeId: string): void {
    const trade = this.activeTrades.get(tradeId)
    if (!trade) return

    // Update the trade status to completed
    const completedTrade = { ...trade, status: TradeStatus.COMPLETED }
    this.tradeHistory.push(completedTrade)
    this.activeTrades.delete(tradeId)
    this.notifyListeners({ type: "trade_closed", trade: completedTrade })

    console.log(`Trade ${tradeId} closed`)
  }

  // Get active trades
  public getActiveTrades(): Trade[] {
    return Array.from(this.activeTrades.values())
  }

  // Get trade history
  public getTradeHistory(): Trade[] {
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
    }
  }

  // Subscribe to trading bot updates
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
        console.error("Error in trading bot listener:", error)
      }
    })
  }
}

// Helper function to get the trading bot service instance
export function getTradingBotService(): TradingBotService {
  return TradingBotService.getInstance()
}
