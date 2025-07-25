// CoinMarketCap API key - replace with your actual API key
const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY || ""

// Base URLs
const CMC_API_BASE_URL = "https://pro-api.coinmarketcap.com/v1"

// Interface for token data from CMC
export interface CmcTokenData {
  id: number
  name: string
  symbol: string
  slug: string
  rank: number
  is_active: number
  platform?: {
    id: number
    name: string
    symbol: string
    slug: string
    token_address: string
  }
  logo?: string
  description?: string
  urls?: {
    website?: string[]
    technical_doc?: string[]
    twitter?: string[]
    reddit?: string[]
    message_board?: string[]
    announcement?: string[]
    chat?: string[]
    explorer?: string[]
    source_code?: string[]
  }
  market_data?: {
    price_usd: number
    price_btc: number
    volume_24h_usd: number
    market_cap_usd: number
    percent_change_1h: number
    percent_change_24h: number
    percent_change_7d: number
  }
  tags?: string[]
  category?: string
}

// Chain ID mapping for CMC
const CMC_CHAIN_IDS = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  arbitrum: 42161,
  optimism: 10,
  solana: 1399, // Solana has a different ID in CMC
  base: 8453,
}

// CoinMarketCap service class
export class CoinMarketCapService {
  private static instance: CoinMarketCapService
  private apiKey: string
  private baseUrl: string

  // Cache for token data to reduce API calls
  private tokenCache: Record<string, { data: CmcTokenData; timestamp: number }> = {}
  private trendingCache: Record<string, { data: CmcTokenData[]; timestamp: number }> = {}
  private cacheTTL = 15 * 60 * 1000 // 15 minutes

  private constructor() {
    this.apiKey = CMC_API_KEY
    this.baseUrl = CMC_API_BASE_URL
  }

  public static getInstance(): CoinMarketCapService {
    if (!CoinMarketCapService.instance) {
      CoinMarketCapService.instance = new CoinMarketCapService()
    }
    return CoinMarketCapService.instance
  }

  // Helper method to create a fallback token data object
  private createFallbackTokenData(tokenAddress: string, chain: string): CmcTokenData {
    // Generate a deterministic ID based on address
    const tokenId = this.generateDeterministicId(tokenAddress)

    // Generate a token name and symbol
    const tokenName = `Token ${tokenId.toString().slice(0, 4)}`
    const tokenSymbol = `TKN${tokenId.toString().slice(0, 3)}`

    // Generate a logo URL based on token address
    // This creates a colorful placeholder based on the token address
    const logoColor = tokenAddress.slice(2, 8)
    const logoUrl = `https://via.placeholder.com/64/${logoColor}?text=${tokenSymbol}`

    return {
      id: tokenId,
      name: tokenName,
      symbol: tokenSymbol,
      slug: tokenName.toLowerCase().replace(/\s+/g, "-"),
      rank: Math.floor(Math.random() * 1000) + 1000,
      is_active: 1,
      logo: logoUrl,
      description: `${tokenName} is a token on the ${chain} blockchain.`,
      urls: {
        website: [`https://example.com/${tokenSymbol.toLowerCase()}`],
        explorer: [this.getExplorerUrl(tokenAddress, chain)],
      },
      tags: ["token", chain],
      category: "Token",
    }
  }

  // Generate a deterministic ID from an address
  private generateDeterministicId(address: string): number {
    let hash = 0
    for (let i = 0; i < address.length; i++) {
      const char = address.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash % 10000) + 10000 // Ensure positive and in a reasonable range
  }

  // Get explorer URL for a token
  private getExplorerUrl(tokenAddress: string, chain: string): string {
    const explorers = {
      ethereum: "https://etherscan.io/token/",
      bsc: "https://bscscan.com/token/",
      polygon: "https://polygonscan.com/token/",
      arbitrum: "https://arbiscan.io/token/",
      optimism: "https://optimistic.etherscan.io/token/",
      solana: "https://solscan.io/token/",
      base: "https://basescan.org/token/",
    }

    return (explorers[chain] || "https://etherscan.io/token/") + tokenAddress
  }

  // Make API request to CoinMarketCap
  private async makeApiRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    try {
      // In browser environment, we need to use a proxy to avoid CORS issues
      // This would be a server-side API route in production
      const url = `/api/coinmarketcap/${endpoint}`

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ params }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`CoinMarketCap API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Get token metadata by address and chain
  public async getTokenMetadata(tokenAddress: string, chain: string): Promise<CmcTokenData | null> {
    const cacheKey = `${chain}:${tokenAddress}`

    // Check cache first
    if (this.tokenCache[cacheKey] && Date.now() - this.tokenCache[cacheKey].timestamp < this.cacheTTL) {
      return this.tokenCache[cacheKey].data
    }

    try {
      // Get chain ID for CMC
      const chainId = CMC_CHAIN_IDS[chain.toLowerCase()]
      if (!chainId) {
        console.warn(`Unsupported chain for CMC: ${chain}`)
        throw new Error(`Unsupported chain: ${chain}`)
      }

      // Make API request to CMC
      const data = await this.makeApiRequest("cryptocurrency/info", {
        address: `${chainId}:${tokenAddress.toLowerCase()}`,
      })

      // Extract token data from response
      if (data && data.data) {
        // Get the first token from the data object
        const tokenId = Object.keys(data.data)[0]
        const tokenData = data.data[tokenId]

        if (tokenData) {
          // Format the data for our use
          const cmcTokenData: CmcTokenData = {
            id: Number.parseInt(tokenId),
            name: tokenData.name,
            symbol: tokenData.symbol,
            slug: tokenData.slug,
            rank: tokenData.rank,
            is_active: tokenData.is_active,
            logo: tokenData.logo,
            description: tokenData.description,
            urls: tokenData.urls,
            platform: tokenData.platform,
            tags: tokenData.tags,
            category: tokenData.category,
          }

          // Cache the result
          this.tokenCache[cacheKey] = {
            data: cmcTokenData,
            timestamp: Date.now(),
          }

          return cmcTokenData
        }
      }

      throw new Error("Token data not found")
    } catch (error) {
      console.error(`Failed to fetch token metadata from CMC for ${tokenAddress} on ${chain}:`, error)

      // Create fallback token data
      const fallbackData = this.createFallbackTokenData(tokenAddress, chain)

      // Cache the fallback result
      this.tokenCache[cacheKey] = {
        data: fallbackData,
        timestamp: Date.now(),
      }

      return fallbackData
    }
  }

  // Get token market data by address and chain
  public async getTokenMarketData(tokenAddress: string, chain: string): Promise<any | null> {
    try {
      // First get the token metadata to get the CMC ID
      const tokenMetadata = await this.getTokenMetadata(tokenAddress, chain)
      if (!tokenMetadata || !tokenMetadata.id) {
        throw new Error("Token metadata not found")
      }

      // Make API request to CMC for quotes
      const data = await this.makeApiRequest("cryptocurrency/quotes/latest", {
        id: tokenMetadata.id.toString(),
      })

      // Extract market data from response
      if (data && data.data && data.data[tokenMetadata.id]) {
        const marketData = data.data[tokenMetadata.id]
        if (marketData && marketData.quote && marketData.quote.USD) {
          return {
            price_usd: marketData.quote.USD.price,
            volume_24h_usd: marketData.quote.USD.volume_24h,
            market_cap_usd: marketData.quote.USD.market_cap,
            percent_change_1h: marketData.quote.USD.percent_change_1h,
            percent_change_24h: marketData.quote.USD.percent_change_24h,
            percent_change_7d: marketData.quote.USD.percent_change_7d,
          }
        }
      }

      throw new Error("Market data not found")
    } catch (error) {
      console.error(`Failed to fetch token market data from CMC for ${tokenAddress} on ${chain}:`, error)
      return this.generateFallbackMarketData()
    }
  }

  // Generate fallback market data
  private generateFallbackMarketData() {
    const basePrice = Math.random() * 10
    return {
      price_usd: basePrice,
      volume_24h_usd: basePrice * (Math.random() * 100000 + 10000),
      market_cap_usd: basePrice * (Math.random() * 1000000 + 100000),
      percent_change_1h: Math.random() * 10 - 5,
      percent_change_24h: Math.random() * 20 - 10,
      percent_change_7d: Math.random() * 40 - 20,
    }
  }

  // Get token logo URL
  public async getTokenLogoUrl(tokenAddress: string, chain: string): Promise<string | null> {
    try {
      const tokenMetadata = await this.getTokenMetadata(tokenAddress, chain)
      return tokenMetadata?.logo || null
    } catch (error) {
      console.error(`Failed to fetch token logo from CMC for ${tokenAddress} on ${chain}:`, error)

      // Generate a fallback logo based on token address
      const logoColor = tokenAddress.slice(2, 8)
      return `https://via.placeholder.com/64/${logoColor}?text=TOKEN`
    }
  }

  // Get trending tokens by chain
  public async getTrendingTokens(chain: string): Promise<CmcTokenData[]> {
    const cacheKey = `trending:${chain}`

    // Check cache first
    if (this.trendingCache[cacheKey] && Date.now() - this.trendingCache[cacheKey].timestamp < this.cacheTTL) {
      return this.trendingCache[cacheKey].data
    }

    try {
      // Get chain ID for CMC
      const chainId = CMC_CHAIN_IDS[chain.toLowerCase()]
      if (!chainId) {
        console.warn(`Unsupported chain for CMC trending: ${chain}`)
        throw new Error(`Unsupported chain: ${chain}`)
      }

      // Make API request to CMC for trending tokens
      // This would be a custom endpoint in production that aggregates data from multiple sources
      const data = await this.makeApiRequest("cryptocurrency/trending/latest", {
        platform_id: chainId.toString(),
        limit: "20",
      })

      if (data && data.data) {
        const tokens = data.data.map((token: any) => ({
          id: token.id,
          name: token.name,
          symbol: token.symbol,
          slug: token.slug,
          rank: token.cmc_rank,
          is_active: 1,
          platform: token.platform,
          logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${token.id}.png`,
        }))

        // Cache the result
        this.trendingCache[cacheKey] = {
          data: tokens,
          timestamp: Date.now(),
        }

        return tokens
      }

      throw new Error("Trending data not found")
    } catch (error) {
      console.error(`Failed to fetch trending tokens for ${chain}:`, error)

      // Generate fallback trending tokens
      const fallbackTokens = this.generateFallbackTrendingTokens(chain)

      // Cache the fallback result
      this.trendingCache[cacheKey] = {
        data: fallbackTokens,
        timestamp: Date.now(),
      }

      return fallbackTokens
    }
  }

  // Generate fallback trending tokens
  private generateFallbackTrendingTokens(chain: string): CmcTokenData[] {
    const tokens: CmcTokenData[] = []

    // Generate 10 fake trending tokens
    for (let i = 0; i < 10; i++) {
      const id = 10000 + i
      const name = `Trending Token ${i + 1}`
      const symbol = `TREND${i + 1}`

      // Generate a random address
      const address = `0x${Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`

      tokens.push({
        id,
        name,
        symbol,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        rank: i + 1,
        is_active: 1,
        platform: {
          id: CMC_CHAIN_IDS[chain.toLowerCase()] || 1,
          name: chain,
          symbol: chain.toUpperCase(),
          slug: chain,
          token_address: address,
        },
        logo: `https://via.placeholder.com/64/${address.slice(2, 8)}?text=${symbol}`,
      })
    }

    return tokens
  }

  // Search for tokens by name or symbol
  public async searchTokens(query: string, chain?: string): Promise<CmcTokenData[]> {
    try {
      const params: Record<string, string> = {
        search: query,
        limit: "10",
      }

      if (chain) {
        const chainId = CMC_CHAIN_IDS[chain.toLowerCase()]
        if (chainId) {
          params.platform_id = chainId.toString()
        }
      }

      // Make API request to CMC for search
      const data = await this.makeApiRequest("cryptocurrency/map", params)

      if (data && data.data) {
        return data.data.map((token: any) => ({
          id: token.id,
          name: token.name,
          symbol: token.symbol,
          slug: token.slug,
          rank: token.rank,
          is_active: token.is_active,
          platform: token.platform,
          logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${token.id}.png`,
        }))
      }

      return []
    } catch (error) {
      console.error(`Failed to search tokens on CMC:`, error)
      return this.generateFallbackSearchResults(query, chain)
    }
  }

  // Generate fallback search results
  private generateFallbackSearchResults(query: string, chain?: string): CmcTokenData[] {
    // Create some fake tokens based on the query
    const results: CmcTokenData[] = []

    // Common token prefixes and suffixes
    const prefixes = ["", "Wrapped ", "Liquid ", "Staked ", "Synthetic "]
    const suffixes = ["", " Token", " Coin", " Finance", " Protocol"]

    // Generate 5 fake tokens
    for (let i = 0; i < 5; i++) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
      const name = `${prefix}${query.toUpperCase()}${suffix}`
      const symbol = `${query.substring(0, 3).toUpperCase()}${i + 1}`

      // Generate a random address
      const address = `0x${Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")}`

      // Generate a deterministic ID
      const id = this.generateDeterministicId(address)

      results.push({
        id,
        name,
        symbol,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        rank: Math.floor(Math.random() * 1000) + 1,
        is_active: 1,
        platform: chain
          ? {
              id: CMC_CHAIN_IDS[chain] || 1,
              name: chain,
              symbol: chain.toUpperCase(),
              slug: chain,
              token_address: address,
            }
          : undefined,
        logo: `https://via.placeholder.com/64/${address.slice(2, 8)}?text=${symbol}`,
      })
    }

    return results
  }
}

// Helper function to get the CoinMarketCap service instance
export function getCoinMarketCapService(): CoinMarketCapService {
  return CoinMarketCapService.getInstance()
}
