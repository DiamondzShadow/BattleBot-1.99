// Default fallback configuration
export const defaultEngineConfig = {
  profitThresholdUSD: 3,
  tradeIntervalSec: 60,
  riskLevels: {
    cold: { maxRisk: 1, minProfit: 1 },
    warm: { maxRisk: 2, minProfit: 2 },
    hot: { maxRisk: 3, minProfit: 4 },
    steaming: { maxRisk: 4, minProfit: 8 },
    nova: { maxRisk: 5, minProfit: 15 },
  },
}

// Load configuration from ThirdWeb Engine
export async function loadEngineConfig(engineApiUrl: string) {
  try {
    const res = await fetch(`${engineApiUrl}/project`, {
      headers: { Accept: "application/json" },
    })

    const data = await res.json()
    const config = { ...defaultEngineConfig }

    // Update config with values from Engine if available
    if (data.profitThresholdUSD) config.profitThresholdUSD = data.profitThresholdUSD
    if (data.tradeIntervalSec) config.tradeIntervalSec = data.tradeIntervalSec
    if (data.riskLevels) config.riskLevels = { ...config.riskLevels, ...data.riskLevels }

    console.log("🛠️ Engine config loaded:", config)
    return config
  } catch (e) {
    console.warn("⚠️ Engine load failed, using defaults.", e.message)
    return defaultEngineConfig
  }
}

// Helper function to determine risk level based on analysis
export function determineRiskLevel(tokenData: any, config = defaultEngineConfig) {
  // This is a simplified example - in a real app, you'd have more sophisticated logic
  const { marketCapUsd, liquidityUsd, holdersCount } = tokenData

  // Calculate risk factors
  const marketCapFactor =
    marketCapUsd < 100000
      ? 5
      : marketCapUsd < 1000000
        ? 4
        : marketCapUsd < 10000000
          ? 3
          : marketCapUsd < 100000000
            ? 2
            : 1

  const liquidityFactor =
    liquidityUsd < 10000 ? 5 : liquidityUsd < 50000 ? 4 : liquidityUsd < 200000 ? 3 : liquidityUsd < 1000000 ? 2 : 1

  const holdersFactor =
    holdersCount < 100 ? 5 : holdersCount < 500 ? 4 : holdersCount < 2000 ? 3 : holdersCount < 10000 ? 2 : 1

  // Calculate overall risk level (1-5)
  const overallRisk = Math.round((marketCapFactor + liquidityFactor + holdersFactor) / 3)

  // Map to risk level names
  const riskLevelMap = {
    1: "Cold",
    2: "Warm",
    3: "Hot",
    4: "Steaming",
    5: "Nova",
  }

  return {
    level: overallRisk,
    name: riskLevelMap[overallRisk],
    details: {
      marketCapFactor,
      liquidityFactor,
      holdersFactor,
    },
  }
}
