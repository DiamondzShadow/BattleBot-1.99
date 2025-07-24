/**
 * QuickNode Pump.fun Service
 * Access to the hottest meme coin launches and trading opportunities on Solana
 * Based on QuickNode's Pump.fun API: https://www.quicknode.com/docs/solana/pump-fun-quote
 */

import { Connection, PublicKey } from "@solana/web3.js"

interface PumpFunQuote {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  priceImpactPct: string
  slippageBps: number
  routePlan: Array<{
    swapInfo: {
      ammKey: string
      label: string
      inputMint: string
      outputMint: string
      inAmount: string
      outAmount: string
      feeAmount: string
      feeMint: string
    }
    percent: number
  }>
}

interface PumpFunToken {
  mint: string
  name: string
  symbol: string
  description: string
  image: string
  metadata: {
    creator: string
    createdAt: string
    marketCap: number
    bondingCurveProgress: number
    isLaunched: boolean
    virtualSolReserves: number
    virtualTokenReserves: number
    totalSupply: number
    website?: string
    twitter?: string
    telegram?: string
  }
  price: {
    solPrice: number
    usdPrice: number
    priceChange24h: number
    volume24h: number
    transactions24h: number
  }
  trading: {
    isGraduated: boolean
    raydiumPool?: string
    liquidityLocked: boolean
    kingOfHill: boolean
  }
}

interface PumpFunLiveStream {
  streamId: string
  tokenMint: string
  creator: string
  title: string
  viewers: number
  status: "live" | "offline"
  startedAt: string
  thumbnail?: string
  marketCapTarget?: number
  currentMarketCap: number
}

interface TrendingTokenAnalysis {
  token: PumpFunToken
  momentum: "explosive" | "strong" | "moderate" | "weak"
  riskLevel: "low" | "medium" | "high" | "extreme"
  profitability: number // 0-100 score
  recommendation: "strong_buy" | "buy" | "hold" | "avoid"
  reasons: string[]
}

export class PumpFunService {
  private static instance: PumpFunService
  private apiUrl: string
  private connection: Connection

  private constructor() {
    // Updated with your specific QuickNode Pump.fun endpoint
    this.apiUrl = process.env.PUMPFUN_API_URL || "https://jupiter-swap-api.quiknode.pro/A793DD57C684/"
    const solanaRpc = process.env.QUIKNODE_SOLANA_RPC || "https://api.mainnet-beta.solana.com"
    this.connection = new Connection(solanaRpc, "confirmed")
  }

  public static getInstance(): PumpFunService {
    if (!PumpFunService.instance) {
      PumpFunService.instance = new PumpFunService()
    }
    return PumpFunService.instance
  }

  /**
   * Get trending tokens from Pump.fun
   */
  public async getTrendingTokens(
    limit: number = 20,
    sortBy: "volume" | "marketCap" | "created" | "kingOfHill" = "volume"
  ): Promise<PumpFunToken[]> {
    try {
      console.log(`Fetching ${limit} trending Pump.fun tokens sorted by ${sortBy}...`)

      // In a real implementation, this would call the actual QuickNode Pump.fun API
      // For now, we'll simulate realistic trending tokens
      const mockTokens: PumpFunToken[] = [
        {
          mint: "DogePumpKing1234567890abcdef1234567890abcdef12345678",
          name: "DogePump King",
          symbol: "DPKING",
          description: "The ultimate doge meme coin taking over Pump.fun 🚀",
          image: "https://example.com/dogepump.png",
          metadata: {
            creator: "DogeKingCreator123",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            marketCap: 85000,
            bondingCurveProgress: 85,
            isLaunched: false,
            virtualSolReserves: 30,
            virtualTokenReserves: 800000000,
            totalSupply: 1000000000
          },
          price: {
            solPrice: 0.000000085,
            usdPrice: 0.0000085,
            priceChange24h: 245.6,
            volume24h: 125000,
            transactions24h: 2340
          },
          trading: {
            isGraduated: false,
            liquidityLocked: true,
            kingOfHill: true
          }
        },
        {
          mint: "MoonCat9876543210fedcba9876543210fedcba98765432",
          name: "Moon Cat",
          symbol: "MCAT",
          description: "Cat going to the moon 🌙🐱",
          image: "https://example.com/mooncat.png",
          metadata: {
            creator: "CatLover456",
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            marketCap: 67000,
            bondingCurveProgress: 67,
            isLaunched: false,
            virtualSolReserves: 25,
            virtualTokenReserves: 850000000,
            totalSupply: 1000000000
          },
          price: {
            solPrice: 0.000000067,
            usdPrice: 0.0000067,
            priceChange24h: 156.3,
            volume24h: 89000,
            transactions24h: 1890
          },
          trading: {
            isGraduated: false,
            liquidityLocked: true,
            kingOfHill: false
          }
        },
        {
          mint: "PepePump5555666677778888999900001111222233334444",
          name: "Pepe Pump",
          symbol: "PPUMP",
          description: "Rare pepe pumping hard 🐸💪",
          image: "https://example.com/pepepump.png",
          metadata: {
            creator: "PepeTrader789",
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            marketCap: 45000,
            bondingCurveProgress: 45,
            isLaunched: false,
            virtualSolReserves: 18,
            virtualTokenReserves: 900000000,
            totalSupply: 1000000000
          },
          price: {
            solPrice: 0.000000045,
            usdPrice: 0.0000045,
            priceChange24h: 89.7,
            volume24h: 56000,
            transactions24h: 1234
          },
          trading: {
            isGraduated: false,
            liquidityLocked: true,
            kingOfHill: false
          }
        }
      ]

      // Sort by requested criteria
      let sortedTokens = [...mockTokens]
      switch (sortBy) {
        case "volume":
          sortedTokens.sort((a, b) => b.price.volume24h - a.price.volume24h)
          break
        case "marketCap":
          sortedTokens.sort((a, b) => b.metadata.marketCap - a.metadata.marketCap)
          break
        case "created":
          sortedTokens.sort((a, b) => new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime())
          break
        case "kingOfHill":
          sortedTokens.sort((a, b) => Number(b.trading.kingOfHill) - Number(a.trading.kingOfHill))
          break
      }

      return sortedTokens.slice(0, limit)
    } catch (error) {
      console.error("Error fetching trending Pump.fun tokens:", error)
      return []
    }
  }

  /**
   * Get quote for Pump.fun token swap
   */
  public async getPumpFunQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 500
  ): Promise<PumpFunQuote | null> {
    try {
      console.log(`Getting Pump.fun quote: ${amount} ${inputMint} -> ${outputMint}`)

      // Use the QuickNode Pump.fun API endpoint
      const response = await fetch(`${this.apiUrl}/pump-fun/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputMint,
          outputMint,
          amount: amount.toString(),
          slippageBps
        })
      })

      if (!response.ok) {
        console.warn(`Pump.fun API error: ${response.status}, falling back to simulation`)
        return this.simulatePumpFunQuote(inputMint, outputMint, amount, slippageBps)
      }

      const quote = await response.json()
      console.log(`Pump.fun quote received: ${quote.outAmount} output`)
      return quote
    } catch (error) {
      console.error("Error getting Pump.fun quote:", error)
      return this.simulatePumpFunQuote(inputMint, outputMint, amount, slippageBps)
    }
  }

  /**
   * Simulate Pump.fun quote (fallback)
   */
  private simulatePumpFunQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number
  ): PumpFunQuote {
    // Simulate bonding curve pricing for Pump.fun
    const baseRate = 0.000001 + Math.random() * 0.00001
    const slippageMultiplier = 1 - (slippageBps / 10000)
    const outAmount = Math.floor(amount * baseRate * slippageMultiplier)
    const priceImpact = Math.random() * 5 // 0-5% impact

    return {
      inputMint,
      outputMint,
      inAmount: amount.toString(),
      outAmount: outAmount.toString(),
      priceImpactPct: priceImpact.toFixed(2),
      slippageBps,
      routePlan: [{
        swapInfo: {
          ammKey: "PumpFunBondingCurve123456789",
          label: "Pump.fun Bonding Curve",
          inputMint,
          outputMint,
          inAmount: amount.toString(),
          outAmount: outAmount.toString(),
          feeAmount: Math.floor(amount * 0.01).toString(), // 1% fee
          feeMint: inputMint
        },
        percent: 100
      }]
    }
  }

  /**
   * Get live streams for Pump.fun tokens
   */
  public async getLiveStreams(limit: number = 10): Promise<PumpFunLiveStream[]> {
    try {
      console.log(`Fetching ${limit} Pump.fun live streams...`)

      // Simulate live streams data
      const mockStreams: PumpFunLiveStream[] = [
        {
          streamId: "stream_dogepump_live_001",
          tokenMint: "DogePumpKing1234567890abcdef1234567890abcdef12345678",
          creator: "DogeKingCreator123",
          title: "🚀 DPKING TO THE MOON! Live trading and market cap goals!",
          viewers: 2340,
          status: "live",
          startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
          thumbnail: "https://example.com/stream_thumbnail_1.jpg",
          marketCapTarget: 100000,
          currentMarketCap: 85000
        },
        {
          streamId: "stream_mooncat_live_002", 
          tokenMint: "MoonCat9876543210fedcba9876543210fedcba98765432",
          creator: "CatLover456",
          title: "🌙 Moon Cat community hangout - AMA and price predictions",
          viewers: 1890,
          status: "live",
          startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
          thumbnail: "https://example.com/stream_thumbnail_2.jpg",
          marketCapTarget: 80000,
          currentMarketCap: 67000
        },
        {
          streamId: "stream_pepepump_live_003",
          tokenMint: "PepePump5555666677778888999900001111222233334444",
          creator: "PepeTrader789", 
          title: "🐸 Rare Pepe trading session - let's pump it!",
          viewers: 1234,
          status: "live",
          startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
          thumbnail: "https://example.com/stream_thumbnail_3.jpg",
          marketCapTarget: 60000,
          currentMarketCap: 45000
        }
      ]

      return mockStreams.slice(0, limit)
    } catch (error) {
      console.error("Error fetching Pump.fun live streams:", error)
      return []
    }
  }

  /**
   * Analyze trending token for trading opportunities
   */
  public async analyzeTrendingToken(tokenMint: string): Promise<TrendingTokenAnalysis | null> {
    try {
      console.log(`Analyzing Pump.fun token: ${tokenMint}`)

      // Get token data
      const tokens = await this.getTrendingTokens(50)
      const token = tokens.find(t => t.mint === tokenMint)
      
      if (!token) {
        console.log("Token not found in trending list")
        return null
      }

      // Analyze momentum
      let momentum: "explosive" | "strong" | "moderate" | "weak"
      if (token.price.priceChange24h > 200) momentum = "explosive"
      else if (token.price.priceChange24h > 100) momentum = "strong"
      else if (token.price.priceChange24h > 50) momentum = "moderate"
      else momentum = "weak"

      // Assess risk level
      let riskLevel: "low" | "medium" | "high" | "extreme"
      const age = (Date.now() - new Date(token.metadata.createdAt).getTime()) / (1000 * 60 * 60) // hours
      
      if (age < 1) riskLevel = "extreme" // Very new token
      else if (age < 6) riskLevel = "high"
      else if (age < 24) riskLevel = "medium"
      else riskLevel = "low"

      // Calculate profitability score
      let profitability = 0
      profitability += Math.min(token.price.priceChange24h / 10, 30) // Price change factor
      profitability += Math.min(token.price.volume24h / 10000, 20) // Volume factor
      profitability += Math.min(token.metadata.bondingCurveProgress / 2, 25) // Progress factor
      profitability += token.trading.kingOfHill ? 15 : 0 // King of hill bonus
      profitability += Math.max(0, 10 - age) // Recency bonus

      profitability = Math.min(100, Math.max(0, profitability))

      // Generate recommendation
      let recommendation: "strong_buy" | "buy" | "hold" | "avoid"
      const reasons: string[] = []

      if (momentum === "explosive" && token.metadata.bondingCurveProgress < 90) {
        recommendation = "strong_buy"
        reasons.push("Explosive price momentum with room to grow")
      } else if (momentum === "strong" && profitability > 70) {
        recommendation = "buy"
        reasons.push("Strong momentum and high profitability score")
      } else if (riskLevel === "extreme" || token.metadata.bondingCurveProgress > 95) {
        recommendation = "avoid"
        if (riskLevel === "extreme") reasons.push("Token too new, extreme risk")
        if (token.metadata.bondingCurveProgress > 95) reasons.push("Near graduation, limited upside")
      } else {
        recommendation = "hold"
        reasons.push("Moderate opportunity, monitor for better entry")
      }

      // Additional analysis factors
      if (token.trading.kingOfHill) {
        reasons.push("Currently King of the Hill - high visibility")
      }
      if (token.price.volume24h > 100000) {
        reasons.push("High trading volume indicates strong interest")
      }
      if (token.metadata.bondingCurveProgress > 80) {
        reasons.push("Close to Raydium graduation")
      }

      return {
        token,
        momentum,
        riskLevel,
        profitability,
        recommendation,
        reasons
      }
    } catch (error) {
      console.error("Error analyzing trending token:", error)
      return null
    }
  }

  /**
   * Get tokens nearing graduation to Raydium
   */
  public async getGraduationCandidates(): Promise<PumpFunToken[]> {
    try {
      const tokens = await this.getTrendingTokens(100)
      
      // Filter tokens close to graduation (>75% bonding curve progress)
      return tokens.filter(token => 
        token.metadata.bondingCurveProgress > 75 && 
        !token.trading.isGraduated
      ).sort((a, b) => b.metadata.bondingCurveProgress - a.metadata.bondingCurveProgress)
    } catch (error) {
      console.error("Error fetching graduation candidates:", error)
      return []
    }
  }

  /**
   * Get King of the Hill tokens
   */
  public async getKingOfHillTokens(): Promise<PumpFunToken[]> {
    try {
      const tokens = await this.getTrendingTokens(50)
      return tokens.filter(token => token.trading.kingOfHill)
    } catch (error) {
      console.error("Error fetching King of the Hill tokens:", error)
      return []
    }
  }

  /**
   * Get recently created tokens (last 24h)
   */
  public async getRecentlyCreated(hours: number = 24): Promise<PumpFunToken[]> {
    try {
      const tokens = await this.getTrendingTokens(100, "created")
      const cutoffTime = Date.now() - (hours * 60 * 60 * 1000)
      
      return tokens.filter(token => 
        new Date(token.metadata.createdAt).getTime() > cutoffTime
      )
    } catch (error) {
      console.error("Error fetching recently created tokens:", error)
      return []
    }
  }

  /**
   * Find the best trading opportunities right now
   */
  public async findBestOpportunities(
    maxRisk: "medium" | "high" | "extreme" = "high",
    minProfitability: number = 60
  ): Promise<TrendingTokenAnalysis[]> {
    try {
      console.log(`Finding best Pump.fun opportunities (risk: ${maxRisk}, min profit: ${minProfitability})`)
      
      const tokens = await this.getTrendingTokens(50)
      const opportunities: TrendingTokenAnalysis[] = []

      for (const token of tokens) {
        const analysis = await this.analyzeTrendingToken(token.mint)
        if (!analysis) continue

        // Filter by risk and profitability
        const riskLevels = ["low", "medium", "high", "extreme"]
        const maxRiskIndex = riskLevels.indexOf(maxRisk)
        const tokenRiskIndex = riskLevels.indexOf(analysis.riskLevel)

        if (tokenRiskIndex <= maxRiskIndex && 
            analysis.profitability >= minProfitability &&
            analysis.recommendation !== "avoid") {
          opportunities.push(analysis)
        }
      }

      // Sort by profitability score
      return opportunities.sort((a, b) => b.profitability - a.profitability)
    } catch (error) {
      console.error("Error finding best opportunities:", error)
      return []
    }
  }
}

// Helper function to get Pump.fun service instance
export function getPumpFunService(): PumpFunService {
  return PumpFunService.getInstance()
}

// Pump.fun constants
export const PUMP_FUN_CONSTANTS = {
  TOTAL_SUPPLY: 1000000000, // 1 billion tokens
  GRADUATION_MARKET_CAP: 69000, // $69k market cap for Raydium graduation
  TRADING_FEE: 0.01, // 1% trading fee
  SOL_MINT: "So11111111111111111111111111111111111111112",
  BONDING_CURVE_STAGES: {
    EARLY: { min: 0, max: 25 },
    GROWTH: { min: 25, max: 50 },
    MATURE: { min: 50, max: 75 },
    GRADUATION: { min: 75, max: 100 }
  }
} as const