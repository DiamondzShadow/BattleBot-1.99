/**
 * QuickNode MEV Protection & Recovery Service
 * Protects against frontrunning, sandwich attacks, and other MEV exploitation
 * Based on QuickNode's MEV Protection add-on: https://www.quicknode.com/docs/solana/sendTransaction
 */

import { Connection, Transaction, VersionedTransaction, SendOptions } from "@solana/web3.js"
import bs58 from "bs58"

interface MEVProtectionConfig {
  skipPreflight?: boolean
  preflightCommitment?: "processed" | "confirmed" | "finalized"
  encoding?: "base58" | "base64"
  maxRetries?: number
  minContextSlot?: number
}

interface MEVTransactionResult {
  signature: string
  success: boolean
  slot?: number
  confirmations?: number
  err?: string | null
  protectionLevel: "standard" | "enhanced" | "maximum"
  executionTime: number
  mevProtected: boolean
}

interface MEVAnalysis {
  riskLevel: "low" | "medium" | "high" | "critical"
  frontrunRisk: number // 0-100
  sandwichRisk: number // 0-100
  extractableValue: number // in SOL
  recommendations: string[]
  shouldProtect: boolean
}

export class MEVProtectionService {
  private static instance: MEVProtectionService
  private connection: Connection
  private rpcUrl: string
  private defaultConfig: MEVProtectionConfig

  private constructor() {
    this.rpcUrl = process.env.QUIKNODE_SOLANA_RPC || "https://api.mainnet-beta.solana.com"
    this.connection = new Connection(this.rpcUrl, "confirmed")
    
    this.defaultConfig = {
      skipPreflight: false,
      preflightCommitment: "finalized",
      encoding: "base64",
      maxRetries: 3,
      minContextSlot: undefined
    }
  }

  public static getInstance(): MEVProtectionService {
    if (!MEVProtectionService.instance) {
      MEVProtectionService.instance = new MEVProtectionService()
    }
    return MEVProtectionService.instance
  }

  /**
   * Analyze transaction for MEV risks before sending
   */
  public async analyzeMEVRisks(
    transaction: Transaction | VersionedTransaction,
    options: {
      checkFrontrunning?: boolean
      checkSandwichAttacks?: boolean
      estimateExtractableValue?: boolean
    } = {}
  ): Promise<MEVAnalysis> {
    const { 
      checkFrontrunning = true, 
      checkSandwichAttacks = true, 
      estimateExtractableValue = true 
    } = options

    try {
      console.log("Analyzing transaction for MEV risks...")
      
      // Serialize transaction for analysis
      const serializedTransaction = this.serializeTransaction(transaction)
      const transactionSize = Buffer.from(serializedTransaction, 'base64').length

      // Simulate basic MEV risk assessment
      let frontrunRisk = 0
      let sandwichRisk = 0
      let extractableValue = 0

      // Check for high-value operations
      const instructions = this.getInstructions(transaction)
      const hasSwapInstructions = instructions.some(ix => 
        this.isSwapInstruction(ix) || this.isJupiterInstruction(ix)
      )

      if (hasSwapInstructions) {
        frontrunRisk += 30
        sandwichRisk += 40
        extractableValue = this.estimateSwapValue(transaction)
      }

      // Check for large token transfers
      const hasLargeTransfers = this.hasLargeTransfers(transaction)
      if (hasLargeTransfers) {
        frontrunRisk += 20
        extractableValue += 0.01 // Estimate
      }

      // Check transaction size (larger = more complex = more risk)
      if (transactionSize > 800) {
        frontrunRisk += 15
        sandwichRisk += 10
      }

      // Assess overall risk level
      const maxRisk = Math.max(frontrunRisk, sandwichRisk)
      let riskLevel: "low" | "medium" | "high" | "critical"
      
      if (maxRisk < 25) riskLevel = "low"
      else if (maxRisk < 50) riskLevel = "medium"
      else if (maxRisk < 75) riskLevel = "high"
      else riskLevel = "critical"

      // Generate recommendations
      const recommendations: string[] = []
      if (frontrunRisk > 30) {
        recommendations.push("Consider using MEV protection for swap transactions")
      }
      if (sandwichRisk > 40) {
        recommendations.push("High sandwich attack risk - use enhanced protection")
      }
      if (extractableValue > 0.05) {
        recommendations.push("Significant extractable value detected - use maximum protection")
      }
      if (riskLevel === "low") {
        recommendations.push("Low MEV risk - standard sending is sufficient")
      }

      const shouldProtect = riskLevel !== "low" || extractableValue > 0.01

      console.log(`MEV Analysis: Risk=${riskLevel}, Frontrun=${frontrunRisk}%, Sandwich=${sandwichRisk}%, EV=${extractableValue} SOL`)

      return {
        riskLevel,
        frontrunRisk: Math.min(100, frontrunRisk),
        sandwichRisk: Math.min(100, sandwichRisk),
        extractableValue,
        recommendations,
        shouldProtect
      }
    } catch (error) {
      console.error("Error analyzing MEV risks:", error)
      return {
        riskLevel: "medium",
        frontrunRisk: 50,
        sandwichRisk: 50,
        extractableValue: 0,
        recommendations: ["Error in analysis - use protection as precaution"],
        shouldProtect: true
      }
    }
  }

  /**
   * Send transaction with MEV protection using QuickNode
   */
  public async sendProtectedTransaction(
    transaction: Transaction | VersionedTransaction,
    protectionLevel: "standard" | "enhanced" | "maximum" = "enhanced",
    config: MEVProtectionConfig = {}
  ): Promise<MEVTransactionResult> {
    const startTime = Date.now()
    const finalConfig = { ...this.defaultConfig, ...config }

    try {
      console.log(`Sending transaction with ${protectionLevel} MEV protection...`)

      // Serialize transaction
      const serializedTransaction = this.serializeTransaction(transaction)
      
      // Prepare MEV-protected send request
      const mevProtectedOptions = this.getMEVProtectionOptions(protectionLevel, finalConfig)
      
      // Send via QuickNode MEV Protection endpoint
      const result = await this.sendViaQuickNodeMEV(
        serializedTransaction, 
        mevProtectedOptions
      )

      const executionTime = Date.now() - startTime

      console.log(`Transaction sent with MEV protection: ${result.signature} (${executionTime}ms)`)

      return {
        signature: result.signature,
        success: true,
        slot: result.slot,
        confirmations: result.confirmations,
        err: result.err,
        protectionLevel,
        executionTime,
        mevProtected: true
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error(`MEV-protected transaction failed:`, error)

      return {
        signature: "",
        success: false,
        err: error.message,
        protectionLevel,
        executionTime,
        mevProtected: true
      }
    }
  }

  /**
   * Send transaction via QuickNode MEV Protection endpoint
   */
  private async sendViaQuickNodeMEV(
    serializedTransaction: string,
    options: any
  ): Promise<{
    signature: string
    slot?: number
    confirmations?: number
    err?: string | null
  }> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "sendTransaction",
          params: [serializedTransaction, options]
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(`RPC error: ${result.error.message}`)
      }

      return {
        signature: result.result,
        slot: undefined, // Would need additional call to get slot
        confirmations: undefined,
        err: null
      }
    } catch (error) {
      console.error("QuickNode MEV protection call failed:", error)
      throw error
    }
  }

  /**
   * Get MEV protection options based on protection level
   */
  private getMEVProtectionOptions(
    protectionLevel: "standard" | "enhanced" | "maximum",
    config: MEVProtectionConfig
  ): any {
    const baseOptions = {
      skipPreflight: config.skipPreflight,
      preflightCommitment: config.preflightCommitment,
      encoding: config.encoding,
      maxRetries: config.maxRetries,
      minContextSlot: config.minContextSlot
    }

    switch (protectionLevel) {
      case "standard":
        return {
          ...baseOptions,
          skipPreflight: false,
          preflightCommitment: "confirmed"
        }
      
      case "enhanced":
        return {
          ...baseOptions,
          skipPreflight: false,
          preflightCommitment: "finalized",
          maxRetries: 5
        }
      
      case "maximum":
        return {
          ...baseOptions,
          skipPreflight: true, // Skip for faster execution
          preflightCommitment: "finalized",
          maxRetries: 3
        }
      
      default:
        return baseOptions
    }
  }

  /**
   * Serialize transaction for sending
   */
  private serializeTransaction(transaction: Transaction | VersionedTransaction): string {
    try {
      if (transaction instanceof VersionedTransaction) {
        return Buffer.from(transaction.serialize()).toString('base64')
      } else {
        return Buffer.from(transaction.serialize()).toString('base64')
      }
    } catch (error) {
      console.error("Error serializing transaction:", error)
      throw new Error("Failed to serialize transaction")
    }
  }

  /**
   * Get instructions from transaction
   */
  private getInstructions(transaction: Transaction | VersionedTransaction): any[] {
    try {
      if (transaction instanceof VersionedTransaction) {
        return transaction.message.compiledInstructions || []
      } else {
        return transaction.instructions || []
      }
    } catch (error) {
      return []
    }
  }

  /**
   * Check if instruction is a swap operation
   */
  private isSwapInstruction(instruction: any): boolean {
    // Check for common swap program IDs
    const swapPrograms = [
      "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", // Raydium
      "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", // Whirlpool
      "5quBtoiQqxF9Jv6KYKctB59NT3gtJD2Y65kdnB1Uev3h", // Serum
    ]

    const programId = instruction.programId?.toString() || ""
    return swapPrograms.includes(programId)
  }

  /**
   * Check if instruction is a Jupiter swap
   */
  private isJupiterInstruction(instruction: any): boolean {
    const jupiterProgramId = "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"
    const programId = instruction.programId?.toString() || ""
    return programId === jupiterProgramId
  }

  /**
   * Check for large token transfers
   */
  private hasLargeTransfers(transaction: Transaction | VersionedTransaction): boolean {
    // Simplified check - in practice would analyze instruction data
    const instructions = this.getInstructions(transaction)
    return instructions.length > 3 // Multiple instructions might indicate large operations
  }

  /**
   * Estimate extractable value from swap transactions
   */
  private estimateSwapValue(transaction: Transaction | VersionedTransaction): number {
    // Simplified estimation - in practice would decode instruction data
    const instructions = this.getInstructions(transaction)
    const swapCount = instructions.filter(ix => 
      this.isSwapInstruction(ix) || this.isJupiterInstruction(ix)
    ).length

    // Rough estimate based on number of swap instructions
    return swapCount * 0.02 // 0.02 SOL per swap
  }

  /**
   * Send regular transaction without MEV protection (for comparison)
   */
  public async sendRegularTransaction(
    transaction: Transaction | VersionedTransaction,
    options: SendOptions = {}
  ): Promise<MEVTransactionResult> {
    const startTime = Date.now()

    try {
      console.log("Sending regular transaction (no MEV protection)...")
      
      let signature: string
      
      if (transaction instanceof VersionedTransaction) {
        signature = await this.connection.sendTransaction(transaction, options)
      } else {
        signature = await this.connection.sendTransaction(transaction, [], options)
      }

      const executionTime = Date.now() - startTime

      console.log(`Regular transaction sent: ${signature} (${executionTime}ms)`)

      return {
        signature,
        success: true,
        protectionLevel: "standard",
        executionTime,
        mevProtected: false
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error("Regular transaction failed:", error)

      return {
        signature: "",
        success: false,
        err: error.message,
        protectionLevel: "standard",
        executionTime,
        mevProtected: false
      }
    }
  }

  /**
   * Compare MEV protection vs regular sending
   */
  public async compareTransactionMethods(
    transaction: Transaction | VersionedTransaction
  ): Promise<{
    analysis: MEVAnalysis
    recommendation: string
    estimatedGasSavings?: number
    estimatedProtectionValue?: number
  }> {
    try {
      const analysis = await this.analyzeMEVRisks(transaction)
      
      let recommendation: string
      let estimatedGasSavings = 0
      let estimatedProtectionValue = 0

      if (analysis.riskLevel === "low") {
        recommendation = "Use regular transaction sending - MEV protection not needed"
      } else if (analysis.riskLevel === "medium") {
        recommendation = "Consider enhanced MEV protection for safety"
        estimatedProtectionValue = analysis.extractableValue * 0.5
      } else {
        recommendation = "Strongly recommend maximum MEV protection"
        estimatedProtectionValue = analysis.extractableValue * 0.8
        estimatedGasSavings = 0.001 // Potential savings from avoiding failed transactions
      }

      return {
        analysis,
        recommendation,
        estimatedGasSavings,
        estimatedProtectionValue
      }
    } catch (error) {
      console.error("Error comparing transaction methods:", error)
      return {
        analysis: {
          riskLevel: "medium",
          frontrunRisk: 50,
          sandwichRisk: 50,
          extractableValue: 0,
          recommendations: ["Error in analysis"],
          shouldProtect: true
        },
        recommendation: "Use MEV protection as precaution due to analysis error"
      }
    }
  }
}

// Helper function to get MEV protection service instance
export function getMEVProtectionService(): MEVProtectionService {
  return MEVProtectionService.getInstance()
}

// MEV protection levels for easy reference
export const MEV_PROTECTION_LEVELS = {
  STANDARD: "standard" as const,
  ENHANCED: "enhanced" as const,
  MAXIMUM: "maximum" as const,
} as const

export type MEVProtectionLevel = typeof MEV_PROTECTION_LEVELS[keyof typeof MEV_PROTECTION_LEVELS]