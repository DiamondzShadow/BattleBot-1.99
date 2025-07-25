import { ethers } from "ethers"
import { Keypair, Connection } from "@solana/web3.js"
import bs58 from "bs58"

// Supported chains configuration
const CHAIN_CONFIGS = {
  ethereum: {
    chainId: 1,
    rpcUrl: process.env.QUIKNODE_ETHEREUM_RPC || process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com",
    privateKeyEnv: "ETHEREUM_PRIVATE_KEY"
  },
  polygon: {
    chainId: 137,
    rpcUrl: process.env.QUIKNODE_POLYGON_RPC || process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    privateKeyEnv: "POLYGON_PRIVATE_KEY"
  },
  bsc: {
    chainId: 56,
    rpcUrl: process.env.QUIKNODE_BSC_RPC || process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org",
    privateKeyEnv: "BSC_PRIVATE_KEY"
  },
  arbitrum: {
    chainId: 42161,
    rpcUrl: process.env.QUIKNODE_ARBITRUM_RPC || "https://arb1.arbitrum.io/rpc",
    privateKeyEnv: "ARBITRUM_PRIVATE_KEY"
  },
  optimism: {
    chainId: 10,
    rpcUrl: process.env.QUIKNODE_OPTIMISM_RPC || "https://mainnet.optimism.io",
    privateKeyEnv: "OPTIMISM_PRIVATE_KEY"
  },
  base: {
    chainId: 8453,
    rpcUrl: process.env.BASE_RPC_URL || "https://mainnet.base.org",
    privateKeyEnv: "BASE_PRIVATE_KEY"
  }
}

export class WalletService {
  private static instance: WalletService
  private evmWallets: Map<string, ethers.Wallet> = new Map()
  private solanaKeypair: Keypair | null = null
  private providers: Map<string, ethers.providers.JsonRpcProvider> = new Map()

  private constructor() {
    this.initializeWallets()
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  private initializeWallets(): void {
    console.log("Initializing wallets...")

    // Initialize EVM wallets
    for (const [chainName, config] of Object.entries(CHAIN_CONFIGS)) {
      try {
        const privateKey = process.env[config.privateKeyEnv]
        
        if (privateKey) {
          // Create provider
          const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl)
          this.providers.set(chainName, provider)

          // Create wallet
          const wallet = new ethers.Wallet(privateKey, provider)
          this.evmWallets.set(chainName, wallet)
          
          console.log(`✅ ${chainName} wallet initialized: ${wallet.address}`)
        } else {
          console.log(`⚠️  ${chainName} private key not found in environment variables (${config.privateKeyEnv})`)
        }
      } catch (error) {
        console.error(`❌ Failed to initialize ${chainName} wallet:`, error.message)
      }
    }

    // Initialize Solana wallet
    try {
      const solanaPrivateKey = process.env.SOLANA_PRIVATE_KEY
      
      if (solanaPrivateKey) {
        // Support both base58 and array formats
        let secretKey: Uint8Array
        
        if (solanaPrivateKey.startsWith('[') && solanaPrivateKey.endsWith(']')) {
          // Array format: [1,2,3,...]
          secretKey = new Uint8Array(JSON.parse(solanaPrivateKey))
        } else {
          // Base58 format
          secretKey = bs58.decode(solanaPrivateKey)
        }
        
        this.solanaKeypair = Keypair.fromSecretKey(secretKey)
        console.log(`✅ Solana wallet initialized: ${this.solanaKeypair.publicKey.toString()}`)
      } else {
        console.log("⚠️  Solana private key not found in environment variables (SOLANA_PRIVATE_KEY)")
      }
    } catch (error) {
      console.error("❌ Failed to initialize Solana wallet:", error.message)
    }

    // Summary
    const evmCount = this.evmWallets.size
    const solanaCount = this.solanaKeypair ? 1 : 0
    console.log(`🎯 Wallet initialization complete: ${evmCount} EVM chains, ${solanaCount} Solana`)
  }

  // Get EVM wallet for a specific chain
  public getEvmWallet(chain: string): ethers.Wallet | null {
    return this.evmWallets.get(chain.toLowerCase()) || null
  }

  // Get Solana keypair
  public getSolanaKeypair(): Keypair | null {
    return this.solanaKeypair
  }

  // Get provider for a specific chain
  public getProvider(chain: string): ethers.providers.JsonRpcProvider | null {
    return this.providers.get(chain.toLowerCase()) || null
  }

  // Get wallet address for a specific chain
  public getWalletAddress(chain: string): string | null {
    if (chain.toLowerCase() === 'solana') {
      return this.solanaKeypair?.publicKey.toString() || null
    }
    
    const wallet = this.getEvmWallet(chain)
    return wallet?.address || null
  }

  // Get all wallet addresses
  public getAllWalletAddresses(): Record<string, string> {
    const addresses: Record<string, string> = {}

    // EVM addresses
    for (const [chain, wallet] of this.evmWallets.entries()) {
      addresses[chain] = wallet.address
    }

    // Solana address
    if (this.solanaKeypair) {
      addresses.solana = this.solanaKeypair.publicKey.toString()
    }

    return addresses
  }

  // Check if wallet is available for a chain
  public hasWallet(chain: string): boolean {
    if (chain.toLowerCase() === 'solana') {
      return this.solanaKeypair !== null
    }
    return this.evmWallets.has(chain.toLowerCase())
  }

  // Get wallet balance for a specific chain
  public async getWalletBalance(chain: string): Promise<string | null> {
    try {
      if (chain.toLowerCase() === 'solana') {
        if (!this.solanaKeypair) return null
        
        const connection = new Connection(
          process.env.QUIKNODE_SOLANA_RPC || "https://api.mainnet-beta.solana.com"
        )
        const balance = await connection.getBalance(this.solanaKeypair.publicKey)
        return (balance / 1e9).toString() // Convert lamports to SOL
      }

      const wallet = this.getEvmWallet(chain)
      if (!wallet) return null

      const balance = await wallet.getBalance()
      return ethers.utils.formatEther(balance)
    } catch (error) {
      console.error(`Failed to get balance for ${chain}:`, error)
      return null
    }
  }

  // Sign transaction for EVM chains
  public async signEvmTransaction(chain: string, transaction: any): Promise<string | null> {
    try {
      const wallet = this.getEvmWallet(chain)
      if (!wallet) {
        console.error(`No wallet available for ${chain}`)
        return null
      }

      const signedTx = await wallet.signTransaction(transaction)
      return signedTx
    } catch (error) {
      console.error(`Failed to sign transaction for ${chain}:`, error)
      return null
    }
  }

  // Send transaction for EVM chains
  public async sendEvmTransaction(chain: string, transaction: any): Promise<string | null> {
    try {
      const wallet = this.getEvmWallet(chain)
      if (!wallet) {
        console.error(`No wallet available for ${chain}`)
        return null
      }

      const tx = await wallet.sendTransaction(transaction)
      return tx.hash
    } catch (error) {
      console.error(`Failed to send transaction for ${chain}:`, error)
      return null
    }
  }

  // Get wallet status summary
  public getWalletStatus(): Record<string, any> {
    const status: Record<string, any> = {}

    // EVM wallets
    for (const [chain, wallet] of this.evmWallets.entries()) {
      status[chain] = {
        available: true,
        address: wallet.address,
        provider: this.providers.get(chain)?.connection.url || 'Unknown'
      }
    }

    // Solana wallet
    status.solana = {
      available: this.solanaKeypair !== null,
      address: this.solanaKeypair?.publicKey.toString() || null,
      provider: process.env.QUIKNODE_SOLANA_RPC || "https://api.mainnet-beta.solana.com"
    }

    return status
  }
}

// Helper function to get the wallet service instance
export function getWalletService(): WalletService {
  return WalletService.getInstance()
}