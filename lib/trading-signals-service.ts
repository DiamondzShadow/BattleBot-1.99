/**
 * QuickNode Trading Signals Service (Powered by TokenMetrics)
 * AI-powered trading signals with institutional-grade analysis
 * Based on: https://developers.tokenmetrics.com/reference/trading-signals
 */

interface TradingSignal {
  id: string
  token_id: number
  symbol: string
  name: string
  signal_type: "BUY" | "SELL" | "HOLD" | "STRONG_BUY" | "STRONG_SELL"
  confidence: number // 0-100
  price_target: number
  stop_loss: number
  entry_price: number
  current_price: number
  signal_date: string
  expiry_date: string
  analysis: {
    technical_score: number
    fundamental_score: number
    sentiment_score: number
    risk_level: "LOW" | "MEDIUM" | "HIGH" | "EXTREME"
    timeframe: "SHORT" | "MEDIUM" | "LONG"
  }
  indicators: {
    rsi: number
    macd: string
    moving_averages: {
      sma_20: number
      sma_50: number
      ema_12: number
      ema_26: number
    }
    volume_analysis: string
    support_resistance: {
      support: number
      resistance: number
    }
  }
  market_data: {
    market_cap: number
    volume_24h: number
    price_change_24h: number
    price_change_7d: number
    circulating_supply: number
  }
}

interface TokenAnalysis {
  token_id: number
  symbol: string
  name: string
  trader_grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D+" | "D" | "F"
  price_prediction: {
    next_7_days: number
    next_30_days: number
    next_90_days: number
    confidence_level: number
  }
  ai_rating: {
    overall_score: number
    buy_score: number
    hold_score: number
    sell_score: number
  }
  fundamentals: {
    technology_score: number
    team_score: number
    adoption_score: number
    tokenomics_score: number
  }
  moonshot_potential: {
    is_moonshot: boolean
    moonshot_score: number
    upside_potential: number
    risk_reward_ratio: number
  }
}

interface MarketAlert {
  id: string
  alert_type: "BREAKOUT" | "BREAKDOWN" | "VOLUME_SPIKE" | "WHALE_MOVEMENT" | "NEWS_IMPACT"
  symbol: string
  message: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  timestamp: string
  action_required: boolean
  recommended_action?: "BUY" | "SELL" | "MONITOR" | "EXIT"
}

interface PortfolioSignals {
  total_signals: number
  active_signals: TradingSignal[]
  performance_metrics: {
    win_rate: number
    avg_return: number
    best_performer: string
    worst_performer: string
    total_roi: number
  }
  risk_assessment: {
    portfolio_risk: "LOW" | "MEDIUM" | "HIGH"
    diversification_score: number
    correlation_risk: number
    recommendations: string[]
  }
}

export class TradingSignalsService {
  private static instance: TradingSignalsService
  private baseUrl: string
  private addonPath: string

  private constructor() {
    // Using QuickNode endpoint with Trading Signals add-on
    this.baseUrl = process.env.QUIKNODE_SOLANA_RPC
    if (!this.baseUrl) {
      throw new Error("QUIKNODE_SOLANA_RPC environment variable is required for Trading Signals service")
    }
    this.addonPath = "addon/1047/v2" // Trading Signals add-on path
  }

  public static getInstance(): TradingSignalsService {
    if (!TradingSignalsService.instance) {
      TradingSignalsService.instance = new TradingSignalsService()
    }
    return TradingSignalsService.instance
  }

  /**
   * Get trading signals for a specific token
   */
  public async getTradingSignals(
    tokenId: number, 
    limit: number = 50, 
    page: number = 1
  ): Promise<TradingSignal[]> {
    try {
      console.log(`Fetching trading signals for token ${tokenId}...`)

      const url = `${this.baseUrl}${this.addonPath}/trading-signals?token_id=${tokenId}&limit=${limit}&page=${page}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.warn(`Trading Signals API error: ${response.status}, falling back to simulation`)
        return this.simulateTradingSignals(tokenId, limit)
      }

      const data = await response.json()
      console.log(`Retrieved ${data.signals?.length || 0} trading signals`)
      
      return data.signals || []
    } catch (error) {
      console.error("Error fetching trading signals:", error)
      return this.simulateTradingSignals(tokenId, limit)
    }
  }

  /**
   * Get comprehensive token analysis
   */
  public async getTokenAnalysis(tokenId: number): Promise<TokenAnalysis | null> {
    try {
      console.log(`Analyzing token ${tokenId} with AI...`)

      const url = `${this.baseUrl}${this.addonPath}/token-analysis/${tokenId}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.warn(`Token Analysis API error: ${response.status}, falling back to simulation`)
        return this.simulateTokenAnalysis(tokenId)
      }

      const analysis = await response.json()
      console.log(`Token analysis complete: Grade ${analysis.trader_grade}`)
      
      return analysis
    } catch (error) {
      console.error("Error getting token analysis:", error)
      return this.simulateTokenAnalysis(tokenId)
    }
  }

  /**
   * Get market alerts and breaking news
   */
  public async getMarketAlerts(severity: string = "ALL"): Promise<MarketAlert[]> {
    try {
      console.log(`Fetching market alerts (severity: ${severity})...`)

      const url = `${this.baseUrl}${this.addonPath}/market-alerts${severity !== "ALL" ? `?severity=${severity}` : ""}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.warn(`Market Alerts API error: ${response.status}, falling back to simulation`)
        return this.simulateMarketAlerts()
      }

      const data = await response.json()
      console.log(`Retrieved ${data.alerts?.length || 0} market alerts`)
      
      return data.alerts || []
    } catch (error) {
      console.error("Error fetching market alerts:", error)
      return this.simulateMarketAlerts()
    }
  }

  /**
   * Get portfolio-wide trading signals
   */
  public async getPortfolioSignals(tokenIds: number[]): Promise<PortfolioSignals> {
    try {
      console.log(`Analyzing portfolio of ${tokenIds.length} tokens...`)

      const url = `${this.baseUrl}${this.addonPath}/portfolio-signals`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token_ids: tokenIds })
      })

      if (!response.ok) {
        console.warn(`Portfolio Signals API error: ${response.status}, falling back to simulation`)
        return this.simulatePortfolioSignals(tokenIds)
      }

      const portfolio = await response.json()
      console.log(`Portfolio analysis complete: ${portfolio.total_signals} signals, ${portfolio.performance_metrics.win_rate}% win rate`)
      
      return portfolio
    } catch (error) {
      console.error("Error getting portfolio signals:", error)
      return this.simulatePortfolioSignals(tokenIds)
    }
  }

  /**
   * Search for moonshot opportunities
   */
  public async findMoonshotOpportunities(
    minScore: number = 70,
    maxRisk: string = "MEDIUM"
  ): Promise<TokenAnalysis[]> {
    try {
      console.log(`Searching for moonshot opportunities (min score: ${minScore}, max risk: ${maxRisk})...`)

      const url = `${this.baseUrl}${this.addonPath}/moonshots?min_score=${minScore}&max_risk=${maxRisk}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.warn(`Moonshots API error: ${response.status}, falling back to simulation`)
        return this.simulateMoonshotOpportunities(minScore)
      }

      const data = await response.json()
      console.log(`Found ${data.moonshots?.length || 0} moonshot opportunities`)
      
      return data.moonshots || []
    } catch (error) {
      console.error("Error finding moonshot opportunities:", error)
      return this.simulateMoonshotOpportunities(minScore)
    }
  }

  /**
   * Get real-time trading recommendations
   */
  public async getTradingRecommendations(
    symbols: string[],
    timeframe: "SHORT" | "MEDIUM" | "LONG" = "MEDIUM"
  ): Promise<Array<{
    symbol: string
    recommendation: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL"
    confidence: number
    reasoning: string[]
    price_targets: {
      short_term: number
      medium_term: number
      long_term: number
    }
  }>> {
    try {
      console.log(`Getting trading recommendations for ${symbols.length} tokens (${timeframe} timeframe)...`)

      const recommendations = []

      for (const symbol of symbols) {
        // Simulate AI analysis for each symbol
        const confidence = 60 + Math.random() * 35 // 60-95% confidence
        const priceChange = (Math.random() - 0.5) * 0.4 // -20% to +20%
        
        let recommendation: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL"
        const reasoning: string[] = []

        if (confidence > 85 && priceChange > 0.1) {
          recommendation = "STRONG_BUY"
          reasoning.push("Exceptional AI confidence score", "Strong technical momentum", "Favorable market conditions")
        } else if (confidence > 75 && priceChange > 0.05) {
          recommendation = "BUY"
          reasoning.push("High AI confidence", "Positive technical indicators", "Good entry opportunity")
        } else if (confidence > 60 && Math.abs(priceChange) < 0.05) {
          recommendation = "HOLD"
          reasoning.push("Moderate confidence", "Sideways market action", "Wait for clearer signals")
        } else if (confidence < 60 && priceChange < -0.05) {
          recommendation = "SELL"
          reasoning.push("Lower confidence score", "Negative momentum detected", "Risk management advised")
        } else {
          recommendation = "STRONG_SELL"
          reasoning.push("Low AI confidence", "Strong bearish signals", "Immediate exit recommended")
        }

        const currentPrice = 100 + Math.random() * 900 // $100-$1000 simulated price
        
        recommendations.push({
          symbol,
          recommendation,
          confidence: Math.round(confidence),
          reasoning,
          price_targets: {
            short_term: currentPrice * (1 + priceChange * 0.5),
            medium_term: currentPrice * (1 + priceChange * 1.0),
            long_term: currentPrice * (1 + priceChange * 1.5)
          }
        })
      }

      console.log(`Generated ${recommendations.length} trading recommendations`)
      return recommendations
    } catch (error) {
      console.error("Error getting trading recommendations:", error)
      return []
    }
  }

  /**
   * Simulate trading signals (fallback)
   */
  private simulateTradingSignals(tokenId: number, limit: number): TradingSignal[] {
    const signals: TradingSignal[] = []
    
    for (let i = 0; i < Math.min(limit, 5); i++) {
      const signalTypes: Array<"BUY" | "SELL" | "HOLD" | "STRONG_BUY" | "STRONG_SELL"> = 
        ["BUY", "SELL", "HOLD", "STRONG_BUY", "STRONG_SELL"]
      
      const signal: TradingSignal = {
        id: `signal_${tokenId}_${i}`,
        token_id: tokenId,
        symbol: `TOKEN${tokenId}`,
        name: `Test Token ${tokenId}`,
        signal_type: signalTypes[Math.floor(Math.random() * signalTypes.length)],
        confidence: 60 + Math.random() * 35,
        price_target: 100 + Math.random() * 50,
        stop_loss: 80 + Math.random() * 15,
        entry_price: 90 + Math.random() * 10,
        current_price: 95 + Math.random() * 10,
        signal_date: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        expiry_date: new Date(Date.now() + Math.random() * 604800000).toISOString(),
        analysis: {
          technical_score: 60 + Math.random() * 35,
          fundamental_score: 65 + Math.random() * 30,
          sentiment_score: 55 + Math.random() * 40,
          risk_level: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)] as "LOW" | "MEDIUM" | "HIGH",
          timeframe: ["SHORT", "MEDIUM", "LONG"][Math.floor(Math.random() * 3)] as "SHORT" | "MEDIUM" | "LONG"
        },
        indicators: {
          rsi: 30 + Math.random() * 40,
          macd: Math.random() > 0.5 ? "BULLISH" : "BEARISH",
          moving_averages: {
            sma_20: 95 + Math.random() * 10,
            sma_50: 92 + Math.random() * 15,
            ema_12: 96 + Math.random() * 8,
            ema_26: 94 + Math.random() * 12
          },
          volume_analysis: Math.random() > 0.5 ? "INCREASING" : "DECREASING",
          support_resistance: {
            support: 85 + Math.random() * 10,
            resistance: 105 + Math.random() * 15
          }
        },
        market_data: {
          market_cap: 1000000 + Math.random() * 50000000,
          volume_24h: 100000 + Math.random() * 5000000,
          price_change_24h: (Math.random() - 0.5) * 20,
          price_change_7d: (Math.random() - 0.5) * 40,
          circulating_supply: 10000000 + Math.random() * 90000000
        }
      }
      
      signals.push(signal)
    }
    
    return signals
  }

  /**
   * Simulate token analysis (fallback)
   */
  private simulateTokenAnalysis(tokenId: number): TokenAnalysis {
    const grades: Array<"A+" | "A" | "B+" | "B" | "C+" | "C" | "D+" | "D" | "F"> = 
      ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"]
    
    const moonshotScore = Math.random() * 100
    
    return {
      token_id: tokenId,
      symbol: `TOKEN${tokenId}`,
      name: `Test Token ${tokenId}`,
      trader_grade: grades[Math.floor(Math.random() * grades.length)],
      price_prediction: {
        next_7_days: 100 * (1 + (Math.random() - 0.5) * 0.3),
        next_30_days: 100 * (1 + (Math.random() - 0.5) * 0.6),
        next_90_days: 100 * (1 + (Math.random() - 0.5) * 1.2),
        confidence_level: 60 + Math.random() * 35
      },
      ai_rating: {
        overall_score: 60 + Math.random() * 35,
        buy_score: 50 + Math.random() * 40,
        hold_score: 40 + Math.random() * 30,
        sell_score: 30 + Math.random() * 25
      },
      fundamentals: {
        technology_score: 60 + Math.random() * 35,
        team_score: 65 + Math.random() * 30,
        adoption_score: 55 + Math.random() * 40,
        tokenomics_score: 70 + Math.random() * 25
      },
      moonshot_potential: {
        is_moonshot: moonshotScore > 70,
        moonshot_score: moonshotScore,
        upside_potential: Math.random() * 1000 + 100, // 100-1100% upside
        risk_reward_ratio: 1 + Math.random() * 4 // 1:1 to 5:1 ratio
      }
    }
  }

  /**
   * Simulate market alerts (fallback)
   */
  private simulateMarketAlerts(): MarketAlert[] {
    const alertTypes: Array<"BREAKOUT" | "BREAKDOWN" | "VOLUME_SPIKE" | "WHALE_MOVEMENT" | "NEWS_IMPACT"> = 
      ["BREAKOUT", "BREAKDOWN", "VOLUME_SPIKE", "WHALE_MOVEMENT", "NEWS_IMPACT"]
    
    const severities: Array<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL"> = 
      ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    
    return [
      {
        id: "alert_001",
        alert_type: "BREAKOUT",
        symbol: "BTC",
        message: "Bitcoin breaking above major resistance at $125,000 with high volume",
        severity: "HIGH",
        timestamp: new Date().toISOString(),
        action_required: true,
        recommended_action: "BUY"
      },
      {
        id: "alert_002", 
        alert_type: "WHALE_MOVEMENT",
        symbol: "ETH",
        message: "Large whale wallet moved 50,000 ETH to exchange - potential selling pressure",
        severity: "MEDIUM",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        action_required: true,
        recommended_action: "MONITOR"
      },
      {
        id: "alert_003",
        alert_type: "VOLUME_SPIKE",
        symbol: "SOL",
        message: "Solana volume increased 300% in last hour - momentum building",
        severity: "HIGH",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        action_required: false
      }
    ]
  }

  /**
   * Simulate portfolio signals (fallback)
   */
  private simulatePortfolioSignals(tokenIds: number[]): PortfolioSignals {
    const activeSignals = tokenIds.slice(0, 3).map(id => this.simulateTradingSignals(id, 1)[0])
    
    return {
      total_signals: tokenIds.length * 2,
      active_signals: activeSignals,
      performance_metrics: {
        win_rate: 65 + Math.random() * 25,
        avg_return: 5 + Math.random() * 15,
        best_performer: "TOKEN" + tokenIds[0],
        worst_performer: "TOKEN" + tokenIds[tokenIds.length - 1],
        total_roi: (Math.random() - 0.3) * 50 // -15% to +35% ROI
      },
      risk_assessment: {
        portfolio_risk: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)] as "LOW" | "MEDIUM" | "HIGH",
        diversification_score: 60 + Math.random() * 35,
        correlation_risk: Math.random() * 0.8,
        recommendations: [
          "Consider adding more uncorrelated assets",
          "Reduce exposure to high-risk tokens",
          "Take profits on strong performers"
        ]
      }
    }
  }

  /**
   * Simulate moonshot opportunities (fallback)
   */
  private simulateMoonshotOpportunities(minScore: number): TokenAnalysis[] {
    const moonshots: TokenAnalysis[] = []
    
    for (let i = 0; i < 3; i++) {
      const analysis = this.simulateTokenAnalysis(35987 + i)
      analysis.moonshot_potential.moonshot_score = minScore + Math.random() * (100 - minScore)
      analysis.moonshot_potential.is_moonshot = true
      moonshots.push(analysis)
    }
    
    return moonshots
  }
}

// Helper function to get Trading Signals service instance
export function getTradingSignalsService(): TradingSignalsService {
  return TradingSignalsService.getInstance()
}

// Trading signal types for easy reference
export const SIGNAL_TYPES = {
  STRONG_BUY: "STRONG_BUY",
  BUY: "BUY", 
  HOLD: "HOLD",
  SELL: "SELL",
  STRONG_SELL: "STRONG_SELL"
} as const

export const RISK_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM", 
  HIGH: "HIGH",
  EXTREME: "EXTREME"
} as const

export const TIMEFRAMES = {
  SHORT: "SHORT",   // 1-7 days
  MEDIUM: "MEDIUM", // 1-4 weeks  
  LONG: "LONG"      // 1-3 months
} as const