import { type NextRequest, NextResponse } from "next/server"
import { getMEVProtectionService } from "@/lib/mev-protection-service"
import { Transaction, VersionedTransaction } from "@solana/web3.js"

export async function POST(request: NextRequest) {
  try {
    const { 
      transactionData, 
      transactionType = "base64",
      analyzeOnly = true 
    } = await request.json()

    if (!transactionData) {
      return NextResponse.json(
        { 
          success: false,
          error: "Transaction data is required",
          example: {
            transactionData: "base64_encoded_transaction_string",
            transactionType: "base64",
            analyzeOnly: true
          }
        }, 
        { status: 400 }
      )
    }

    const mevService = getMEVProtectionService()

    if (analyzeOnly) {
      // For demo purposes, we'll simulate analysis without actual transaction
      const simulatedAnalysis = {
        riskLevel: "medium" as const,
        frontrunRisk: 35,
        sandwichRisk: 45,
        extractableValue: 0.025,
        recommendations: [
          "High sandwich attack risk - use enhanced protection",
          "Consider using MEV protection for swap transactions"
        ],
        shouldProtect: true
      }

      const comparison = {
        analysis: simulatedAnalysis,
        recommendation: "Consider enhanced MEV protection for safety",
        estimatedGasSavings: 0.001,
        estimatedProtectionValue: 0.0125
      }

      return NextResponse.json({
        success: true,
        analysis: simulatedAnalysis,
        comparison,
        protectionRecommendation: simulatedAnalysis.shouldProtect ? "enhanced" : "standard",
        estimatedSavings: {
          mevProtection: comparison.estimatedProtectionValue,
          gasSavings: comparison.estimatedGasSavings,
          totalValue: (comparison.estimatedProtectionValue || 0) + (comparison.estimatedGasSavings || 0)
        },
        source: "mev-protection-service"
      })
    } else {
      // In a real implementation, you would decode and analyze the actual transaction
      return NextResponse.json({
        success: false,
        error: "Full transaction analysis not implemented in demo",
        message: "Use analyzeOnly: true for demonstration"
      }, { status: 501 })
    }
  } catch (error) {
    console.error("Error with MEV protection analysis:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to analyze MEV protection",
        message: error.message 
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const demo = searchParams.get('demo')

    if (demo === 'swap') {
      // Demo analysis for a swap transaction
      return NextResponse.json({
        success: true,
        demo: "Swap Transaction Analysis",
        analysis: {
          riskLevel: "high",
          frontrunRisk: 65,
          sandwichRisk: 70,
          extractableValue: 0.045,
          recommendations: [
            "High sandwich attack risk - use enhanced protection",
            "Significant extractable value detected - use maximum protection"
          ],
          shouldProtect: true
        },
        recommendation: "Strongly recommend maximum MEV protection",
        estimatedSavings: {
          mevProtection: 0.036,
          gasSavings: 0.001,
          totalValue: 0.037
        },
        protectionLevels: {
          standard: {
            cost: 0.0001,
            protection: "Basic frontrun protection"
          },
          enhanced: {
            cost: 0.0002,
            protection: "Advanced sandwich attack protection"
          },
          maximum: {
            cost: 0.0003,
            protection: "Full MEV protection suite"
          }
        }
      })
    } else if (demo === 'transfer') {
      // Demo analysis for a simple transfer
      return NextResponse.json({
        success: true,
        demo: "Simple Transfer Analysis",
        analysis: {
          riskLevel: "low",
          frontrunRisk: 10,
          sandwichRisk: 5,
          extractableValue: 0.001,
          recommendations: [
            "Low MEV risk - standard sending is sufficient"
          ],
          shouldProtect: false
        },
        recommendation: "Use regular transaction sending - MEV protection not needed",
        estimatedSavings: {
          mevProtection: 0,
          gasSavings: 0,
          totalValue: 0
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        message: "QuickNode MEV Protection & Recovery Service",
        features: [
          "MEV risk analysis",
          "Frontrunning protection", 
          "Sandwich attack prevention",
          "Extractable value estimation",
          "Protection level recommendations"
        ],
        endpoints: {
          "POST /": "Analyze transaction for MEV risks",
          "GET /?demo=swap": "Demo swap transaction analysis",
          "GET /?demo=transfer": "Demo transfer transaction analysis"
        },
        usage: {
          "Analyze transaction": {
            method: "POST",
            body: {
              transactionData: "base64_encoded_transaction",
              analyzeOnly: true
            }
          }
        },
        protectionLevels: ["standard", "enhanced", "maximum"]
      })
    }
  } catch (error) {
    console.error("Error with MEV protection API:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process request",
        message: error.message 
      }, 
      { status: 500 }
    )
  }
}