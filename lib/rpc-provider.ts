// RPC Provider Service
// Manages blockchain RPC connections with fallback and rotation capabilities

import { ethers } from "ethers"

// Define supported chains
export const SUPPORTED_CHAINS = {
  polygon: {
    id: 137,
    name: "Polygon",
    currency: "MATIC",
    explorer: "https://polygonscan.com",
    slug: "polygon-mainnet",
  },
  arbitrum: {
    id: 42161,
    name: "Arbitrum",
    currency: "ETH",
    explorer: "https://arbiscan.io",
    slug: "arbitrum-mainnet",
  },
  optimism: {
    id: 10,
    name: "Optimism",
    currency: "ETH",
    explorer: "https://optimistic.etherscan.io",
    slug: "optimism-mainnet",
  },
  bsc: {
    id: 56,
    name: "BNB Chain",
    currency: "BNB",
    explorer: "https://bscscan.com",
    slug: "bsc-mainnet",
  },
  solana: {
    id: 0, // Not an EVM chain
    name: "Solana",
    currency: "SOL",
    explorer: "https://solscan.io",
    slug: "solana-mainnet",
  },
}

// RPC endpoints configuration
interface RpcConfig {
  primary: string
  fallbacks: string[]
  lastUsed?: number
  failCount?: number
}

// Class to manage RPC connections
export class RpcProvider {
  private static instance: RpcProvider
  private rpcConfigs: Record<string, RpcConfig> = {}
  private providers: Record<string, ethers.JsonRpcProvider> = {}
  private rotationThreshold = 50 // Number of requests before rotating
  private requestCounts: Record<string, number> = {}
  private failureThreshold = 3 // Number of failures before switching to fallback

  private constructor() {
    this.initializeRpcConfigs()
  }

  public static getInstance(): RpcProvider {
    if (!RpcProvider.instance) {
      RpcProvider.instance = new RpcProvider()
    }
    return RpcProvider.instance
  }

  private initializeRpcConfigs() {
    // BSC Configuration
    this.rpcConfigs.bsc = {
      primary:
        process.env.QUIKNODE_BSC_RPC ||
        "https://warmhearted-lively-sound.bsc.quiknode.pro/2dd387d7cfdd038305166de2d284f0f6f9c2a325/",
      fallbacks: [
        `https://bsc-mainnet.nodereal.io/v1/${process.env.NODEREAL_API_KEY || "nodereal-api-key"}`,
        `https://bsc-dataseed.binance.org/`,
        `https://bsc-dataseed1.defibit.io/`,
      ],
      lastUsed: Date.now(),
      failCount: 0,
    }

    // Polygon Configuration
    this.rpcConfigs.polygon = {
      primary:
        process.env.QUIKNODE_POLYGON_RPC ||
        "https://aged-blissful-seed.matic.quiknode.pro/6fa9a74b8b4bff34399ca7b29da7bf8686b69821",
      fallbacks: [
        `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY || "36db7db7f76140d680587b5e3535771d"}`,
        `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || "3g7LKkKWyUVcOndx1ZOUt6VLjFOhCPUg"}`,
        `https://polygon-rpc.com`,
      ],
      lastUsed: Date.now(),
      failCount: 0,
    }

    // Arbitrum Configuration
    this.rpcConfigs.arbitrum = {
      primary: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY || "36db7db7f76140d680587b5e3535771d"}`,
      fallbacks: [
        `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || "3g7LKkKWyUVcOndx1ZOUt6VLjFOhCPUg"}`,
        `https://arb1.arbitrum.io/rpc`,
      ],
      lastUsed: Date.now(),
      failCount: 0,
    }

    // Optimism Configuration
    this.rpcConfigs.optimism = {
      primary: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY || "36db7db7f76140d680587b5e3535771d"}`,
      fallbacks: [
        `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || "3g7LKkKWyUVcOndx1ZOUt6VLjFOhCPUg"}`,
        `https://mainnet.optimism.io`,
      ],
      lastUsed: Date.now(),
      failCount: 0,
    }

    // Solana Configuration
    this.rpcConfigs.solana = {
      primary:
        process.env.QUIKNODE_SOLANA_RPC ||
        "https://necessary-few-silence.solana-mainnet.quiknode.pro/9ae3907978824e583cfbf6c3a3c227dd54daaf93",
      fallbacks: [`https://api.mainnet-beta.solana.com`, `https://solana-api.projectserum.com`],
      lastUsed: Date.now(),
      failCount: 0,
    }

    // Initialize request counts
    Object.keys(this.rpcConfigs).forEach((chain) => {
      this.requestCounts[chain] = 0
    })
  }

  // Get provider for a specific chain
  public async getProvider(chain: string): Promise<ethers.JsonRpcProvider> {
    if (!this.rpcConfigs[chain]) {
      throw new Error(`Unsupported chain: ${chain}`)
    }

    // Check if we need to rotate the RPC endpoint
    this.requestCounts[chain]++
    if (this.requestCounts[chain] >= this.rotationThreshold) {
      this.rotateRpcEndpoint(chain)
      this.requestCounts[chain] = 0
    }

    // If we already have a provider, return it
    if (this.providers[chain]) {
      return this.providers[chain]
    }

    // Create a new provider
    try {
      const rpcUrl = this.getCurrentRpcUrl(chain)
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      await provider.getBlockNumber() // Test the connection
      this.providers[chain] = provider
      this.rpcConfigs[chain].failCount = 0
      return provider
    } catch (error) {
      console.error(`Failed to connect to ${chain} RPC:`, error)
      this.rpcConfigs[chain].failCount = (this.rpcConfigs[chain].failCount || 0) + 1

      // If we've failed too many times, try a fallback
      if (this.rpcConfigs[chain].failCount >= this.failureThreshold) {
        return this.switchToFallback(chain)
      }

      throw error
    }
  }

  // Get the current RPC URL for a chain
  private getCurrentRpcUrl(chain: string): string {
    return this.rpcConfigs[chain].primary
  }

  // Rotate to the next RPC endpoint
  private rotateRpcEndpoint(chain: string): void {
    const config = this.rpcConfigs[chain]
    const currentPrimary = config.primary

    // Move the current primary to the end of fallbacks
    config.fallbacks.push(currentPrimary)

    // Take the first fallback as the new primary
    config.primary = config.fallbacks.shift() || currentPrimary

    // Reset the provider so it will be recreated with the new endpoint
    delete this.providers[chain]

    console.log(`Rotated ${chain} RPC endpoint to: ${config.primary}`)
  }

  // Switch to a fallback RPC endpoint after failures
  private async switchToFallback(chain: string): Promise<ethers.JsonRpcProvider> {
    this.rotateRpcEndpoint(chain)
    this.rpcConfigs[chain].failCount = 0

    try {
      const rpcUrl = this.getCurrentRpcUrl(chain)
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      await provider.getBlockNumber() // Test the connection
      this.providers[chain] = provider
      return provider
    } catch (error) {
      console.error(`Failed to connect to ${chain} fallback RPC:`, error)
      // If we've tried all fallbacks, throw an error
      if (this.rpcConfigs[chain].fallbacks.length === 0) {
        throw new Error(`Failed to connect to any ${chain} RPC endpoint`)
      }
      // Try the next fallback
      return this.switchToFallback(chain)
    }
  }

  // Get the RPC URL for a specific chain (for non-ethers usage)
  public getRpcUrl(chain: string): string {
    if (!this.rpcConfigs[chain]) {
      throw new Error(`Unsupported chain: ${chain}`)
    }

    return this.getCurrentRpcUrl(chain)
  }
}

// Helper function to get the RPC provider instance
export function getRpcProvider(): RpcProvider {
  return RpcProvider.getInstance()
}
