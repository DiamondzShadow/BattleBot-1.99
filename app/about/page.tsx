import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">About TradingAI</h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>
            TradingAI is an intelligent AI-powered platform that analyzes promising trading opportunities across
            multiple blockchains including BNB Chain, Polygon, Arbitrum, and Optimism.
          </p>

          <h2>Our Technology</h2>
          <p>Our platform leverages ThirdWeb's powerful suite of tools:</p>
          <ul>
            <li>
              <strong>Nebula</strong> - AI-powered blockchain analysis for token evaluation
            </li>
            <li>
              <strong>Insight</strong> - Advanced analytics and monitoring of on-chain activities
            </li>
            <li>
              <strong>Engine</strong> - Automated trading execution based on AI recommendations
            </li>
          </ul>

          <h2>Risk Assessment</h2>
          <p>We categorize tokens into five risk levels:</p>
          <ul>
            <li>
              <strong>Cold</strong> - Minimal risk, established tokens with high market cap and liquidity
            </li>
            <li>
              <strong>Warm</strong> - Low to moderate risk, tokens with decent market presence
            </li>
            <li>
              <strong>Hot</strong> - Moderate risk, newer tokens with growing adoption
            </li>
            <li>
              <strong>Steaming</strong> - High risk, speculative tokens with potential for high returns
            </li>
            <li>
              <strong>Nova</strong> - Extreme risk, highly volatile tokens with moonshot potential
            </li>
          </ul>

          <h2>Conversational AI</h2>
          <p>
            Our platform integrates ELIZA as a conversational interface to help users understand complex blockchain data
            and make informed trading decisions. This allows for a more intuitive interaction with the underlying
            blockchain analytics.
          </p>

          <h2>Disclaimer</h2>
          <p>
            TradingAI is provided for informational purposes only. The platform does not provide financial advice, and
            all trading decisions should be made after conducting your own research. Cryptocurrency trading involves
            significant risk, and you should never invest more than you can afford to lose.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
