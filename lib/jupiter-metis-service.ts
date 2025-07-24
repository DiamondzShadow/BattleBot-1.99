/**
 * Jupiter Metis Service for QuickNode
 * Implements the official QuickNode Jupiter Metis API for enhanced swap functionality
 * Based on: https://www.quicknode.com/docs/solana/price
 */

import { Connection, PublicKey } from "@solana/web3.js"

interface JupiterMetisQuote {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  priceImpactPct: string
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
    bps: number
  }>
  contextSlot: number
  timeTaken: number
}

interface JupiterMetisSwapData {
  swapTransaction: string
  lastValidBlockHeight: number
}

export class JupiterMetisService {
  private static instance: JupiterMetisService
  private jupiterApiUrl: string
  private connection: Connection

  private constructor() {
    this.jupiterApiUrl = process.env.JUPITER_SWAP_API || "https://jupiter-swap-api.quiknode.pro/7A1B06086CF5/"
    const solanaRpc = process.env.QUIKNODE_SOLANA_RPC || "https://api.mainnet-beta.solana.com"
    this.connection = new Connection(solanaRpc, "confirmed")
  }

  public static getInstance(): JupiterMetisService {
    if (!JupiterMetisService.instance) {
      JupiterMetisService.instance = new JupiterMetisService()
    }
    return JupiterMetisService.instance
  }

  /**
   * Get swap quote using QuickNode Jupiter Metis API
   */
  public async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<JupiterMetisQuote> {
    try {
      const url = `${this.jupiterApiUrl}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`
      
      console.log(`Fetching Jupiter Metis quote: ${amount} ${inputMint} -> ${outputMint}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Jupiter Metis API error: ${response.status} ${response.statusText}`)
      }

      const quote = await response.json()
      
      // Validate required fields
      if (!quote.outAmount || !quote.routePlan) {
        throw new Error('Invalid quote response from Jupiter Metis API')
      }

      console.log(`Jupiter Metis quote: ${amount} -> ${quote.outAmount} (${quote.priceImpactPct}% impact)`)
      
      return quote
    } catch (error) {
      console.error('Error fetching Jupiter Metis quote:', error)
      throw error
    }
  }

  /**
   * Get swap transaction using QuickNode Jupiter Metis API
   */
  public async getSwapTransaction(
    quote: JupiterMetisQuote,
    userPublicKey: string,
    wrapUnwrapSOL: boolean = true
  ): Promise<JupiterMetisSwapData> {
    try {
      const response = await fetch(`${this.jupiterApiUrl}/swap`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey,
          wrapAndUnwrapSol: wrapUnwrapSOL,
        }),
      })

      if (!response.ok) {
        throw new Error(`Jupiter Metis swap API error: ${response.status} ${response.statusText}`)
      }

      const swapData = await response.json()
      
      return {
        swapTransaction: swapData.swapTransaction,
        lastValidBlockHeight: swapData.lastValidBlockHeight || 0
      }
    } catch (error) {
      console.error('Error getting Jupiter Metis swap transaction:', error)
      throw error
    }
  }

  /**
   * Get price for a token pair
   */
  public async getPrice(
    inputMint: string,
    outputMint: string,
    amount: number = 1000000 // 1 token in smallest units
  ): Promise<{
    price: number
    priceImpact: number
    route: string[]
  }> {
    try {
      const quote = await this.getQuote(inputMint, outputMint, amount)
      
      const price = parseInt(quote.outAmount) / amount
      const priceImpact = parseFloat(quote.priceImpactPct)
      const route = quote.routePlan.map(step => step.swapInfo.label)

      return {
        price,
        priceImpact,
        route
      }
    } catch (error) {
      console.error('Error getting Jupiter Metis price:', error)
      throw error
    }
  }

  /**
   * Simulate a round trip trade for profitability analysis
   */
  public async simulateRoundTrip(
    tokenMint: string,
    solAmount: number,
    solMint: string = "So11111111111111111111111111111111111111112"
  ): Promise<{
    profitable: boolean
    profitLoss: number
    profitPercentage: number
    buyQuote: JupiterMetisQuote
    sellQuote: JupiterMetisQuote
  }> {
    try {
      // Get buy quote (SOL -> Token)
      const buyQuote = await this.getQuote(solMint, tokenMint, solAmount)
      const tokenAmount = parseInt(buyQuote.outAmount)
      
      // Get sell quote (Token -> SOL)
      const sellQuote = await this.getQuote(tokenMint, solMint, tokenAmount)
      const finalSolAmount = parseInt(sellQuote.outAmount)
      
      const profitLoss = finalSolAmount - solAmount
      const profitPercentage = (profitLoss / solAmount) * 100
      const profitable = profitLoss > 0

      console.log(`Round trip simulation: ${solAmount} SOL -> ${tokenAmount} tokens -> ${finalSolAmount} SOL (${profitPercentage.toFixed(2)}% ${profitable ? 'profit' : 'loss'})`)

      return {
        profitable,
        profitLoss,
        profitPercentage,
        buyQuote,
        sellQuote
      }
    } catch (error) {
      console.error('Error simulating round trip:', error)
      throw error
    }
  }

  /**
   * Get supported tokens from Jupiter Metis
   */
  public async getSupportedTokens(): Promise<Array<{
    address: string
    symbol: string
    name: string
    decimals: number
    logoURI?: string
    tags?: string[]
  }>> {
    try {
      const response = await fetch(`${this.jupiterApiUrl}/tokens`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Jupiter Metis tokens API error: ${response.status}`)
      }

      const tokens = await response.json()
      return tokens
    } catch (error) {
      console.error('Error fetching supported tokens:', error)
      return []
    }
  }

  /**
   * Enhanced profitability analysis with multiple factors
   */
  public async analyzeTokenProfitability(
    tokenMint: string,
    investmentAmount: number = 10000000, // 0.01 SOL in lamports
    options: {
      maxSlippage?: number
      minProfitThreshold?: number
      checkLiquidity?: boolean
    } = {}
  ): Promise<{
    profitable: boolean
    confidence: number
    profitPotential: number
    liquidityScore: number
    riskLevel: number
    recommendation: string
  }> {
    try {
      const {
        maxSlippage = 5,
        minProfitThreshold = 2,
        checkLiquidity = true
      } = options

      // Simulate round trip
      const roundTrip = await this.simulateRoundTrip(tokenMint, investmentAmount)
      
      // Calculate liquidity score based on price impact
      const avgPriceImpact = (parseFloat(roundTrip.buyQuote.priceImpactPct) + parseFloat(roundTrip.sellQuote.priceImpactPct)) / 2
      const liquidityScore = Math.max(0, 100 - (avgPriceImpact * 20)) // Higher is better
      
      // Calculate confidence based on multiple factors
      let confidence = 50 // Base confidence
      
      // Adjust based on price impact
      if (avgPriceImpact < 1) confidence += 20
      else if (avgPriceImpact < 3) confidence += 10
      else if (avgPriceImpact > 10) confidence -= 30
      
      // Adjust based on profit potential
      if (roundTrip.profitPercentage > minProfitThreshold) confidence += 15
      if (roundTrip.profitPercentage > minProfitThreshold * 2) confidence += 15
      
      // Risk level calculation (1-5, lower is better)
      let riskLevel = 3 // Medium risk by default
      if (avgPriceImpact > 10) riskLevel = 5
      else if (avgPriceImpact > 5) riskLevel = 4
      else if (avgPriceImpact < 2) riskLevel = 2
      else if (avgPriceImpact < 1) riskLevel = 1
      
      // Generate recommendation
      let recommendation = "HOLD"
      if (roundTrip.profitable && roundTrip.profitPercentage > minProfitThreshold && avgPriceImpact < maxSlippage) {
        recommendation = confidence > 70 ? "STRONG_BUY" : "BUY"
      } else if (!roundTrip.profitable || avgPriceImpact > maxSlippage) {
        recommendation = "AVOID"
      }

      return {
        profitable: roundTrip.profitable && roundTrip.profitPercentage > minProfitThreshold,
        confidence: Math.min(100, Math.max(0, confidence)),
        profitPotential: roundTrip.profitPercentage,
        liquidityScore,
        riskLevel,
        recommendation
      }
    } catch (error) {
      console.error('Error analyzing token profitability:', error)
      return {
        profitable: false,
        confidence: 0,
        profitPotential: 0,
        liquidityScore: 0,
        riskLevel: 5,
        recommendation: "ERROR"
      }
    }
  }
}

// Helper function to get Jupiter Metis service instance
export function getJupiterMetisService(): JupiterMetisService {
  return JupiterMetisService.getInstance()
}

// Common token addresses for easy reference
export const COMMON_TOKENS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  RAY: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  SRM: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt"
} as const

export type TokenSymbol = keyof typeof COMMON_TOKENS