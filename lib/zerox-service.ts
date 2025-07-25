// 0x API service for EVM swaps
// This service handles token swaps on EVM chains using the 0x API

// 0x API key
const ZEROX_API_KEY = process.env.ZEROX_API_KEY || ""

// 0x API base URLs for different chains
const ZEROX_API_URLS: Record<number, string> = {
  1: "https://api.0x.org", // Ethereum
  56: "https://bsc.api.0x.org", // BSC
  137: "https://polygon.api.0x.org", // Polygon
  42161: "https://arbitrum.api.0x.org", // Arbitrum
  10: "https://optimism.api.0x.org", // Optimism
  8453: "https://base.api.0x.org", // Base
}

// Native token address (ETH, BNB, MATIC, etc.)
const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

// Interface for swap quote
export interface SwapQuote {
  price: string
  guaranteedPrice: string
  to: string
  data: string
  value: string
  gas: string
  estimatedGas: string
  gasPrice: string
  protocolFee: string
  minimumProtocolFee: string
  buyTokenAddress: string
  sellTokenAddress: string
  buyAmount: string
  sellAmount: string
  sources: any[]
  allowanceTarget: string
}

// 0x service class
export class ZeroXService {
  private static instance: ZeroXService
  private apiKey: string

  private constructor() {
    this.apiKey = ZEROX_API_KEY
  }

  public static getInstance(): ZeroXService {
    if (!ZeroXService.instance) {
      ZeroXService.instance = new ZeroXService()
    }
    return ZeroXService.instance
  }

  // Get API URL for a chain
  private getApiUrl(chainId: number): string {
    const apiUrl = ZEROX_API_URLS[chainId]
    if (!apiUrl) {
      throw new Error(`Unsupported chain ID: ${chainId}`)
    }
    return apiUrl
  }

  // Get swap quote
  public async getSwapQuote(
    chainId: number,
    sellToken: string,
    buyToken: string,
    sellAmount: string,
    takerAddress: string,
  ): Promise<SwapQuote> {
    try {
      const apiUrl = this.getApiUrl(chainId)
      const url = `${apiUrl}/swap/v1/quote?sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${sellAmount}&takerAddress=${takerAddress}`

      // In browser environment, we need to use a proxy to avoid CORS issues
      // This would be a server-side API route in production
      const response = await fetch(`/api/zerox/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chainId,
          sellToken,
          buyToken,
          sellAmount,
          takerAddress,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Failed to get swap quote:`, error)
      throw error
    }
  }

  // Get price for a token pair
  public async getPrice(chainId: number, sellToken: string, buyToken: string, sellAmount: string): Promise<number> {
    try {
      const apiUrl = this.getApiUrl(chainId)
      const url = `${apiUrl}/swap/v1/price?sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${sellAmount}`

      // In browser environment, we need to use a proxy to avoid CORS issues
      // This would be a server-side API route in production
      const response = await fetch(`/api/zerox/price`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chainId,
          sellToken,
          buyToken,
          sellAmount,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return Number.parseFloat(data.price)
    } catch (error) {
      console.error(`Failed to get price:`, error)
      throw error
    }
  }

  // Simulate a round-trip trade (buy and sell) to check profitability
  public async simulateRoundTrip(
    chainId: number,
    tokenAddress: string,
    amount: string,
    takerAddress: string,
  ): Promise<{ profitUSD: number; buyQuote: SwapQuote; sellQuote: SwapQuote }> {
    try {
      // Get quote for buying the token with native token
      const buyQuote = await this.getSwapQuote(chainId, NATIVE_TOKEN, tokenAddress, amount, takerAddress)

      // Get quote for selling the token back to native token
      const sellQuote = await this.getSwapQuote(chainId, tokenAddress, NATIVE_TOKEN, buyQuote.buyAmount, takerAddress)

      // Calculate profit in native token
      const amountIn = Number.parseFloat(amount)
      const amountOut = Number.parseFloat(sellQuote.buyAmount)
      const profitNative = amountOut - amountIn

      // Calculate gas cost in native token
      const gasPrice = Number.parseFloat(buyQuote.gasPrice)
      const buyGas = Number.parseFloat(buyQuote.estimatedGas)
      const sellGas = Number.parseFloat(sellQuote.estimatedGas)
      const gasCostNative = (gasPrice * (buyGas + sellGas)) / 1e18

      // Calculate net profit in native token
      const netProfitNative = profitNative - gasCostNative

      // Convert to USD (simplified, in production you would use a price feed)
      // Assuming 1 ETH = $3000, 1 BNB = $300, 1 MATIC = $1, etc.
      const nativeToUSD: Record<number, number> = {
        1: 3000, // ETH
        56: 300, // BNB
        137: 1, // MATIC
        42161: 3000, // ETH on Arbitrum
        10: 3000, // ETH on Optimism
        8453: 3000, // ETH on Base
      }

      const usdRate = nativeToUSD[chainId] || 1000
      const profitUSD = netProfitNative * usdRate

      return { profitUSD, buyQuote, sellQuote }
    } catch (error) {
      console.error(`Failed to simulate round-trip:`, error)
      throw error
    }
  }
}

// Helper function to get the 0x service instance
export function getZeroXService(): ZeroXService {
  return ZeroXService.getInstance()
}
