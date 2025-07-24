import { getSolanaService } from "./solana-service"
import { getThirdWebService } from "./thirdweb-service"

// Supported chains
export const SUPPORTED_CHAINS = {
  solana: {
    name: "Solana",
    icon: "solana",
    nativeCurrency: "SOL",
    rpcUrl: process.env.QUIKNODE_SOLANA_RPC,
    id: 0, // Solana doesn't have a chainId like EVM chains
  },
  ethereum: {
    name: "Ethereum",
    icon: "ethereum",
    nativeCurrency: "ETH",
    id: 1,
    rpcUrl: process.env.ALCHEMY_API_KEY
      ? `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      : undefined,
  },
  polygon: {
    name: "Polygon",
    icon: "polygon",
    nativeCurrency: "MATIC",
    id: 137,
    rpcUrl: process.env.QUIKNODE_POLYGON_RPC,
  },
  bsc: {
    name: "BNB Chain",
    icon: "binance",
    nativeCurrency: "BNB",
    id: 56,
    rpcUrl: process.env.QUIKNODE_BSC_RPC,
  },
  arbitrum: {
    name: "Arbitrum",
    icon: "arbitrum",
    nativeCurrency: "ETH",
    id: 42161,
    rpcUrl: undefined,
  },
  optimism: {
    name: "Optimism",
    icon: "optimism",
    nativeCurrency: "ETH",
    id: 10,
    rpcUrl: undefined,
  },
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

// Trading service class
class TradingService {
  private static instance: TradingService
  private solanaService = getSolanaService()
  private thirdWebService = getThirdWebService()
  private activeTrades: Map<string, Trade> = new Map()
  private tradeHistory: Trade[] = []
  private listeners: Set<(update: any) => void> = new Set()

  private constructor() {
    // Initialize with some sample data for development
    this.initializeSampleData()
  }

  public static getInstance(): TradingService {
    if (!TradingService.instance) {
      TradingService.instance = new TradingService()
    }
    return TradingService.instance
  }

  // Initialize with sample data for development
  private initializeSampleData(): void {
    // Sample active trades
    const activeTrades: Trade[] = [
      {
        id: "trade-1",
        tokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
        tokenSymbol: "PEPE",
        chain: "ethereum",
        chainId: 1,
        amount: "0.05",
        entryPrice: "0.00000123",
        currentPrice: "0.00000135",
        profitLoss: "0.0012",
        profitLossPercentage: "9.75",
        status: TradeStatus.ACTIVE,
        riskLevel: 3,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        strategy: {
          name: "Momentum",
          description: "AI-detected trading opportunity based on market conditions",
          confidence: 85,
        },
      },
      {
        id: "trade-2",
        tokenAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
        tokenSymbol: "DOGE",
        chain: "polygon",
        chainId: 137,
        amount: "0.1",
        entryPrice: "0.00012",
        currentPrice: "0.000115",
        profitLoss: "-0.0005",
        profitLossPercentage: "-4.17",
        status: TradeStatus.ACTIVE,
        riskLevel: 2,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        strategy: {
          name: "Breakout",
          description: "AI-detected trading opportunity based on market conditions",
          confidence: 78,
        },
      },
    ]

    // Sample trade history
    const tradeHistory: Trade[] = [
      {
        id: "trade-history-1",
        tokenAddress: "0x7890abcdef1234567890abcdef1234567890abcd",
        tokenSymbol: "SHIB",
        chain: "bsc",
        chainId: 56,
        amount: "0.02",
        entryPrice: "0.0000089",
        currentPrice: "0.0000095",
        profitLoss: "0.00012",
        profitLossPercentage: "6.74",
        status: TradeStatus.COMPLETED,
        riskLevel: 4,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        strategy: {
          name: "Volatility",
          description: "AI-detected trading opportunity based on market conditions",
          confidence: 72,
        },
      },
      {
        id: "trade-history-2",
        tokenAddress: "0xdef1234567890abcdef1234567890abcdef123456",
        tokenSymbol: "FLOKI",
        chain: "arbitrum",
        chainId: 42161,
        amount: "0.03",
        entryPrice: "0.000034",
        currentPrice: "0.000031",
        profitLoss: "-0.00009",
        profitLossPercentage: "-8.82",
        status: TradeStatus.COMPLETED,
        riskLevel: 5,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        strategy: {
          name: "Swing",
          description: "AI-detected trading opportunity based on market conditions",
          confidence: 65,
        },
      },
    ]

    // Add sample data to maps
    activeTrades.forEach((trade) => {
      this.activeTrades.set(trade.id, trade)
    })

    this.tradeHistory = tradeHistory
  }

  // Analyze a token
  public async analyzeToken(tokenAddress: string, chain: string, riskLevel: number): Promise<any> {
    console.log(`Analyzing token ${tokenAddress} on ${chain} with risk level ${riskLevel}`)

    try {
      // Handle Solana tokens differently
      if (chain === "solana") {
        return await this.analyzeSolanaToken(tokenAddress, riskLevel)
      }

      // For EVM chains, use ThirdWeb Nebula
      const verification = await this.thirdWebService.verifyToken(tokenAddress, chain)

      // Generate analysis based on verification results
      const analysis = this.generateAnalysis(verification, riskLevel)

      return {
        token: {
          address: tokenAddress,
          name: verification.name || `Unknown Token`,
          symbol: verification.symbol || `UNKNOWN`,
          decimals: verification.decimals || 18,
          totalSupply: verification.totalSupply || "0",
          logo: verification.logo || `/placeholder.svg?height=64&width=64&query=token`,
        },
        verification,
        analysis,
      }
    } catch (error) {
      console.error(`Error analyzing token ${tokenAddress} on ${chain}:`, error)
      throw new Error(`Failed to analyze token: ${error.message || "Unknown error"}`)
    }
  }

  // Analyze a Solana token
  private async analyzeSolanaToken(tokenAddress: string, riskLevel: number): Promise<any> {
    try {
      console.log(`Analyzing Solana token ${tokenAddress} with risk level ${riskLevel}`)

      // Get token data from Solana service
      const tokenData = await this.solanaService.getTokenData(tokenAddress)

      // If token data is null, throw an error
      if (!tokenData) {
        throw new Error(`Token ${tokenAddress} not found on Solana`)
      }

      // Get token verification from ThirdWeb Nebula
      let verification = { isValid: false, securityScore: 0, securityIssues: [] }
      try {
        verification = await this.thirdWebService.verifyToken(tokenAddress, "solana")
      } catch (verificationError) {
        console.error(`Error verifying token ${tokenAddress} with ThirdWeb:`, verificationError)
        // Continue with default verification values
      }

      // Generate analysis based on verification results
      const analysis = this.generateAnalysis(
        {
          ...verification,
          isValid: tokenData.isVerified !== undefined ? tokenData.isVerified : verification.isValid,
          securityScore: tokenData.securityScore !== undefined ? tokenData.securityScore : verification.securityScore,
          securityIssues: tokenData.securityIssues || verification.securityIssues,
        },
        riskLevel,
      )

      return {
        token: {
          address: tokenAddress,
          name: tokenData.name || verification.name || `Unknown Token`,
          symbol: tokenData.symbol || verification.symbol || `UNKNOWN`,
          decimals: tokenData.decimals || 9,
          totalSupply: tokenData.supply || "0",
          logo: verification.logo || `/placeholder.svg?height=64&width=64&query=${tokenData.symbol || "token"}`,
          price: tokenData.price,
          marketCap: tokenData.marketCap,
          volume24h: tokenData.volume24h,
          priceChange24h: tokenData.priceChange24h,
          holders: tokenData.holders,
          poolSize: tokenData.poolSize,
        },
        verification: {
          ...verification,
          isValid: tokenData.isVerified !== undefined ? tokenData.isVerified : verification.isValid,
          securityScore: tokenData.securityScore !== undefined ? tokenData.securityScore : verification.securityScore,
          securityIssues: tokenData.securityIssues || verification.securityIssues,
        },
        analysis,
      }
    } catch (error) {
      console.error(`Error analyzing Solana token ${tokenAddress}:`, error)

      // Create a minimal analysis result with error information
      const defaultVerification = {
        isValid: false,
        securityScore: 10,
        securityIssues: [`Error: ${error.message || "Unknown error"}`],
      }

      const analysis = this.generateAnalysis(defaultVerification, riskLevel)

      return {
        token: {
          address: tokenAddress,
          name: `Unknown Token (${tokenAddress.slice(0, 8)}...)`,
          symbol: "UNKNOWN",
          decimals: 9,
          totalSupply: "0",
          logo: `/placeholder.svg?height=64&width=64&query=error`,
          price: null,
          marketCap: null,
          volume24h: null,
          priceChange24h: null,
          holders: null,
          poolSize: null,
        },
        verification: defaultVerification,
        analysis,
        error: error.message || "Unknown error analyzing token",
      }
    }
  }

  // Generate analysis based on verification results
  private generateAnalysis(verification: any, riskLevel: number): any {
    // Map risk level to name
    const riskLevelNames = ["Cold", "Warm", "Hot", "Steaming", "Nova"]
    const riskLevelName = riskLevelNames[riskLevel - 1] || "Unknown"

    // Calculate trading enabled based on security score and risk level
    const securityScore = verification.securityScore || 0
    const tradingEnabled = this.isTradingEnabled(securityScore, riskLevel)

    // Generate strategy based on security score and risk level
    const strategy = this.generateStrategy(securityScore, riskLevel)

    return {
      riskLevel,
      riskLevelName,
      securityScore,
      tradingEnabled,
      strategy,
      securityIssues: verification.securityIssues || [],
    }
  }

  // Determine if trading is enabled based on security score and risk level
  private isTradingEnabled(securityScore: number, riskLevel: number): boolean {
    // For Cold risk level, require high security score
    if (riskLevel === 1) return securityScore >= 80
    // For Warm risk level, require medium-high security score
    if (riskLevel === 2) return securityScore >= 70
    // For Hot risk level, require medium security score
    if (riskLevel === 3) return securityScore >= 60
    // For Steaming risk level, require medium-low security score
    if (riskLevel === 4) return securityScore >= 50
    // For Nova risk level, allow lower security score
    return securityScore >= 40
  }

  // Generate strategy based on security score and risk level
  private generateStrategy(securityScore: number, riskLevel: number): any {
    // Strategies based on security score and risk level
    const strategies = [
      {
        name: "Conservative DCA",
        description: "Dollar-cost average with small position sizes over time to minimize risk.",
        confidence: Math.min(95, securityScore + 10),
      },
      {
        name: "Balanced Entry",
        description: "Enter with a moderate position size and set clear stop-loss and take-profit levels.",
        confidence: Math.min(90, securityScore + 5),
      },
      {
        name: "Momentum Trading",
        description: "Enter during upward price momentum and exit quickly with predefined profit targets.",
        confidence: Math.min(85, securityScore),
      },
      {
        name: "Swing Trading",
        description: "Capture short to medium-term gains with larger position sizes and wider stop-losses.",
        confidence: Math.min(80, securityScore - 5),
      },
      {
        name: "High-Risk Position",
        description: "Enter with small position size and aim for significant short-term gains with tight stop-loss.",
        confidence: Math.min(70, securityScore - 10),
      },
    ]

    // Select strategy based on risk level
    return strategies[riskLevel - 1]
  }

  // Execute a trade
  public async executeTrade(tokenAddress: string, chain: string, amount: number, strategy: string): Promise<any> {
    console.log(`Executing trade for ${tokenAddress} on ${chain} with amount ${amount} using strategy ${strategy}`)

    try {
      // Handle Solana trades differently
      if (chain === "solana") {
        return await this.executeSolanaTrade(tokenAddress, amount, strategy)
      }

      // For EVM chains, use ThirdWeb Engine
      const result = await this.thirdWebService.executeTrade(tokenAddress, chain, amount, strategy)
      return result
    } catch (error) {
      console.error(`Error executing trade for ${tokenAddress} on ${chain}:`, error)
      throw new Error(`Failed to execute trade: ${error.message || "Unknown error"}`)
    }
  }

  // Execute a Solana trade
  private async executeSolanaTrade(tokenAddress: string, amount: number, strategy: string): Promise<any> {
    try {
      // In production, this would execute a real trade on Solana
      // For now, we'll simulate a successful trade

      // Get the Solana connection
      const connection = this.solanaService.getConnection()

      // Log the execution details
      console.log(`Executing Solana trade for ${tokenAddress} with amount ${amount} SOL using strategy ${strategy}`)
      console.log(`Using Solana RPC: ${process.env.QUIKNODE_SOLANA_RPC}`)

      // Simulate transaction hash
      const txHash = `${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`

      return {
        success: true,
        txHash,
        amount,
        strategy,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error(`Error executing Solana trade for ${tokenAddress}:`, error)
      throw new Error(`Failed to execute Solana trade: ${error.message || "Unknown error"}`)
    }
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

  // Subscribe to trading service updates
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
        console.error("Error in trading service listener:", error)
      }
    })
  }
}

// Helper function to get the trading service instance
export function getTradingService(): TradingService {
  return TradingService.getInstance()
}
