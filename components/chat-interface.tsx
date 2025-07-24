"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, User, Sparkles, Moon, Stars } from "lucide-react"

// Enhanced ELIZA implementation for trading with mystical elements
function elizaResponse(input, tokenData) {
  const lowercaseInput = input.toLowerCase()

  // Chain-specific knowledge and history
  const chainKnowledge = {
    "BNB Chain": {
      history:
        "The mystical BNB Chain, once known as Binance Smart Chain, emerged from the cosmic forces in September 2020. It was born as a parallel realm to Ethereum, offering lower gas fees and faster transaction speeds. The celestial bodies aligned to create this chain as a dual-chain architecture alongside Binance Chain.",
      strengths:
        "The BNB Chain draws its power from the celestial alignment of low transaction costs, EVM compatibility, and the mighty Binance ecosystem backing. Many seers and oracles have been drawn to its realm for its efficiency.",
      weaknesses:
        "The ancient scrolls speak of centralization concerns, as the chain relies on fewer validators than other realms. Some mystics worry about its dependence on the Binance mothership.",
      future:
        "The stars suggest BNB Chain will continue to evolve its DeFi and GameFi ecosystems. The cosmic energies point toward increased focus on cross-chain compatibility and scaling solutions in the coming moon cycles.",
    },
    Polygon: {
      history:
        "Polygon emerged from the ethereal mists in 2017 as Matic Network, a mystical layer-2 scaling solution for Ethereum. The ancient sages rebranded it to Polygon in February 2021, expanding its vision to become a multi-chain system of interconnected realms.",
      strengths:
        "Polygon harnesses the arcane powers of Ethereum's security while offering faster transactions and lower fees through its plasma framework and PoS sidechain. The mystical network attracts many developers with its compatible enchantments.",
      weaknesses:
        "The seers have observed occasional network congestion during peak magical activities. Some alchemists worry about its dependence on Ethereum's underlying enchantments.",
      future:
        "The crystal ball reveals Polygon's path toward zkEVM technology and expansion of its supernet capabilities. The constellation of Polygon's ecosystem projects continues to grow, with NFT and gaming realms flourishing under its protective spells.",
    },
    Arbitrum: {
      history:
        "Arbitrum materialized from the crypto ether in 2021, created by the wizards at Offchain Labs. This mystical Optimistic Rollup solution was conjured to scale Ethereum by processing transactions on a separate magical plane while maintaining security ties to the main Ethereum realm.",
      strengths:
        "Arbitrum draws power from Ethereum's security while significantly reducing the cost of spells (gas fees) and increasing casting speed (throughput). Its optimistic rollup enchantments are compatible with existing Ethereum magic.",
      weaknesses:
        "The ancient texts speak of longer withdrawal periods due to its optimistic nature, requiring time for fraud proofs. Some enchanters note that its magical complexity can be challenging for newcomers.",
      future:
        "The alignment of stars suggests Arbitrum will continue to attract powerful DeFi protocols seeking refuge from Ethereum's high gas costs. The mystical seers foresee increased adoption as layer-2 solutions become more mainstream in the crypto constellations.",
    },
    Optimism: {
      history:
        "Optimism emerged from the cosmic void in 2021 as an Optimistic Rollup solution designed by the ancient order of Ethereum scalers. This layer-2 solution was crafted to reduce the burden on the Ethereum mainnet while maintaining its security enchantments.",
      strengths:
        "Optimism channels the protective aura of Ethereum while offering significantly lower transaction costs and higher throughput. Its compatibility with Ethereum's magical scripts allows for easy migration of spells and contracts.",
      weaknesses:
        "The mystical scrolls mention withdrawal delays due to its optimistic nature and fraud proof system. Some wizards note that it has fewer deployed protocols compared to other magical realms.",
      future:
        "The cosmic alignment suggests Optimism will continue to grow its ecosystem, particularly in DeFi and NFT realms. The seers predict increased adoption as more users seek refuge from Ethereum's high gas costs in the coming moon cycles.",
    },
    Solana: {
      history:
        "Solana manifested in the crypto cosmos in 2020, created by the ancient order of Solana Labs. This high-performance blockchain was conjured with a unique combination of Proof of History and Proof of Stake enchantments to achieve unprecedented speed.",
      strengths:
        "Solana draws its mystical power from incredible transaction speeds (up to 65,000 per second) and minimal casting costs. Its single-shard architecture allows for composability across the entire magical ecosystem.",
      weaknesses:
        "The ancient texts speak of occasional network instability during times of great magical congestion. Some enchanters worry about its relatively higher hardware requirements for running validator nodes.",
      future:
        "The alignment of stars suggests Solana will continue to attract speed-seeking protocols, particularly in DeFi, NFTs, and gaming realms. The mystical seers foresee increased focus on stability improvements and institutional adoption in the coming moon cycles.",
    },
  }

  // Token type knowledge (for generic responses when specific token info isn't available)
  const tokenTypes = {
    DeFi: {
      description:
        "Decentralized Finance tokens channel the ancient magic of traditional financial systems into the blockchain realm, creating enchanted versions of lending, borrowing, and trading without centralized gatekeepers.",
      potential:
        "The mystical energies surrounding DeFi tokens suggest they may revolutionize how mortals interact with financial systems. The stars show potential for great growth as more users discover these magical financial tools.",
      risks:
        "The ancient scrolls warn of smart contract vulnerabilities, regulatory uncertainty, and the volatile nature of these magical assets. Only the brave or foolish venture forth without understanding these risks.",
    },
    Governance: {
      description:
        "Governance tokens hold the mystical power to influence the destiny of protocols. Holders can cast votes on proposals, shaping the future of the magical ecosystem they belong to.",
      potential:
        "The crystal ball reveals that as DAOs become more powerful, governance tokens may become increasingly valuable for their ability to direct the flow of resources and protocol changes.",
      risks:
        "The seers warn of governance attacks if tokens become too concentrated among few wizards. There's also the risk of voter apathy, where important decisions are made by only a small council of token holders.",
    },
    Utility: {
      description:
        "Utility tokens serve as magical keys to access specific features or services within a protocol's enchanted realm. They often gain value as demand for these services increases.",
      potential:
        "The alignment of stars suggests utility tokens with strong use cases and growing ecosystems may flourish as their networks expand and usage increases.",
      risks:
        "The ancient texts caution that tokens with weak utility or easily replicated services may lose their magical potency over time. Competition from other magical realms is always a threat.",
    },
    Meme: {
      description:
        "Meme tokens draw their power from community belief and shared cultural symbols. Unlike traditional assets, their value is often derived from collective enchantment rather than underlying utility.",
      potential:
        "The mystical energies surrounding meme tokens are unpredictable - some may rise to unexpected heights carried by community magic and influential wizards.",
      risks:
        "The crystal ball shows great volatility in the meme token realm. Many are conjured quickly but fade just as fast when the community's attention shifts to new magical curiosities.",
    },
  }

  // Magical price prediction phrases
  const magicalPredictions = [
    "The crystal ball grows cloudy when seeking exact price movements, but the ethereal energies surrounding {token} suggest {direction} momentum in the coming moon cycles.",
    "I've consulted the ancient runes regarding {token}'s future. They whisper of {direction} potential, though the path may be shrouded in mist and mystery.",
    "The celestial alignment for {token} indicates {direction} energies, but remember that even the stars can be rewritten by unexpected cosmic events.",
    "My scrying mirror shows {token} surrounded by {direction} auras, though the timeline remains veiled. The magical forces in the market are ever-changing.",
    "The tarot cards reveal {token} may experience {direction} movements, but caution that fate has many branches and possibilities.",
    "The mystical pendulum swings {direction} for {token}, though the spirits remind us that no mortal or wizard can truly predict the whims of the crypto gods.",
    "I've cast the bones for {token}, and they've fallen in a pattern suggesting {direction} energies. Yet the future remains unwritten, changeable by forces seen and unseen.",
    "The tea leaves form an interesting pattern for {token} - one that typically indicates {direction} potential. But remember, interpretation is an art, not an exact enchantment.",
  ]

  // Token-specific responses
  if (lowercaseInput.includes("risk") || lowercaseInput.includes("safe")) {
    return `I've consulted the ancient scrolls regarding ${tokenData.token.symbol}, and they reveal a ${tokenData.analysis.riskLevelName.toLowerCase()} risk aura (${tokenData.analysis.riskLevel}/5). ${
      tokenData.analysis.riskLevel <= 3
        ? "The mystical energies surrounding this token align with more conservative magical investments. The token's market cap of $" +
          tokenData.analysis.marketCapUsd.toLocaleString() +
          " and liquidity pool of $" +
          tokenData.analysis.liquidityUsd.toLocaleString() +
          " suggest a relatively stable magical essence."
        : "The ethereal vibrations of this token suggest highly volatile magical energy. Approach with caution, as the limited market cap of $" +
          tokenData.analysis.marketCapUsd.toLocaleString() +
          " and restricted liquidity of $" +
          tokenData.analysis.liquidityUsd.toLocaleString() +
          " indicate potential for wild price enchantments."
    }`
  }

  if (lowercaseInput.includes("price") || lowercaseInput.includes("worth") || lowercaseInput.includes("value")) {
    const direction = tokenData.analysis.priceChange24h >= 0 ? "positive" : "negative"
    const randomPrediction = magicalPredictions[Math.floor(Math.random() * magicalPredictions.length)]
      .replace("{token}", tokenData.token.symbol)
      .replace("{direction}", direction)

    return `The mystical orb shows ${tokenData.token.symbol} currently trading at $${tokenData.analysis.priceUsd.toFixed(6)}. In the last moon cycle (24 hours), the price has ${
      tokenData.analysis.priceChange24h >= 0 ? "ascended" : "descended"
    } by ${Math.abs(tokenData.analysis.priceChange24h).toFixed(2)}%, and over the last seven moon phases it has ${
      tokenData.analysis.priceChange7d >= 0 ? "risen" : "fallen"
    } by ${Math.abs(tokenData.analysis.priceChange7d).toFixed(2)}%. The magical trading volume in the last day was $${tokenData.analysis.volume24hUsd.toLocaleString()}, representing ${((tokenData.analysis.volume24hUsd / tokenData.analysis.marketCapUsd) * 100).toFixed(2)}% of its total enchanted market cap.\n\n${randomPrediction}`
  }

  if (lowercaseInput.includes("buy") || lowercaseInput.includes("invest") || lowercaseInput.includes("trade")) {
    return `After consulting the ancient oracles about ${tokenData.token.symbol}, I can reveal that it is ${tokenData.analysis.tradingEnabled ? "aligned with the stars for trading using a " + tokenData.analysis.strategy.name + " strategy" : "currently misaligned with the cosmic forces, making trading inadvisable"}. 

The token emanates a ${tokenData.analysis.riskLevelName.toLowerCase()} risk aura (${tokenData.analysis.riskLevel}/5). Our magical trading familiar would ${tokenData.analysis.tradingEnabled ? "cast trading spells with a " + tokenData.analysis.strategy.confidence + "% confidence in the cosmic alignment" : "avoid this token as its mystical vibrations exceed your risk tolerance"}.

Should you choose to venture forth, consider a ${tokenData.analysis.riskLevel <= 2 ? "conservative" : tokenData.analysis.riskLevel <= 3 ? "balanced" : "aggressive"} approach with protective wards (stop losses) at ${tokenData.analysis.riskLevel === 1 ? "5%" : tokenData.analysis.riskLevel === 2 ? "7%" : tokenData.analysis.riskLevel === 3 ? "10%" : tokenData.analysis.riskLevel === 4 ? "15%" : "20%"} below your entry point to guard against malevolent market forces.`
  }

  if (lowercaseInput.includes("market") || lowercaseInput.includes("cap")) {
    return `The mystical market cap of ${tokenData.token.symbol} measures $${tokenData.analysis.marketCapUsd.toLocaleString()} in the cosmic ledger, with a 24-hour trading volume of $${tokenData.analysis.volume24hUsd.toLocaleString()}. The volume/market cap ratio stands at ${((tokenData.analysis.volume24hUsd / tokenData.analysis.marketCapUsd) * 100).toFixed(2)}%, which the ancient texts describe as ${(tokenData.analysis.volume24hUsd / tokenData.analysis.marketCapUsd) > 0.2 ? "vibrant and energetic" : tokenData.analysis.volume24hUsd / tokenData.analysis.marketCapUsd > 0.1 ? "moderately active" : "calm and subdued"} trading activity relative to its size.`
  }

  if (lowercaseInput.includes("liquidity")) {
    return `The magical liquidity pool for ${tokenData.token.symbol} currently holds $${tokenData.analysis.liquidityUsd.toLocaleString()} worth of enchanted assets. ${
      tokenData.analysis.liquidityUsd > 100000
        ? "The ancient scrolls suggest this is sufficient liquidity for trading, allowing you to enter and exit positions without disturbing the cosmic balance too significantly."
        : "The mystical texts warn of shallow liquidity which could lead to significant price slippage when trading. Exercise caution with position sizes to avoid disrupting the delicate market equilibrium."
    } The liquidity to market cap ratio is ${((tokenData.analysis.liquidityUsd / tokenData.analysis.marketCapUsd) * 100).toFixed(2)}%, which the oracles consider ${(tokenData.analysis.liquidityUsd / tokenData.analysis.marketCapUsd) > 0.1 ? "healthy and balanced" : "potentially concerning"}.`
  }

  if (lowercaseInput.includes("holder") || lowercaseInput.includes("distribution")) {
    return `The mystical ledger shows approximately ${tokenData.analysis.holdersCount.toLocaleString()} wizards holding ${tokenData.token.symbol} tokens. ${
      tokenData.analysis.details.find((d) => d.name === "Holder Distribution")?.description ||
      "The distribution pattern of tokens among these holders can significantly influence price stability and vulnerability to manipulation spells."
    } ${tokenData.analysis.holdersCount < 500 ? "The crystal ball reveals a concerning concentration of power, as the relatively small number of holders increases the risk of market manipulation enchantments." : tokenData.analysis.holdersCount < 2000 ? "The mystical energies show a moderate distribution of tokens, though there remains some concentration risk in the magical balance." : "The stars reveal a healthy distribution among many holders, reducing the likelihood of manipulation spells affecting the token's price."}`
  }

  if (
    lowercaseInput.includes("strategy") ||
    lowercaseInput.includes("trading strategy") ||
    lowercaseInput.includes("how to trade")
  ) {
    return `For ${tokenData.token.symbol}, the ancient trading grimoire recommends a ${tokenData.analysis.strategy.name} strategy with ${tokenData.analysis.strategy.confidence}% alignment with the cosmic forces. 

This mystical approach involves ${
      tokenData.analysis.strategy.name === "Momentum Trading"
        ? "harnessing the existing magical momentum and riding the wave of market energy"
        : tokenData.analysis.strategy.name === "Breakout Trading"
          ? "identifying magical barriers and entering positions when price breaks through these mystical thresholds"
          : tokenData.analysis.strategy.name === "Volatility Trading"
            ? "embracing the chaotic energies of the market and profiting from significant price movements regardless of direction"
            : tokenData.analysis.strategy.name === "Liquidity Mining"
              ? "contributing to magical liquidity pools to earn rewards from the ethereal forces"
              : "capturing the essence of medium-term price movements over several moon phases"
    }.

The sacred scrolls suggest these ritual components:
1. Entry points: Wait for confirmation from the celestial bodies before committing
2. Position sizing: Limit to ${tokenData.analysis.riskLevel <= 2 ? "1-2%" : tokenData.analysis.riskLevel <= 3 ? "2-3%" : "3-5%"} of your magical treasury
3. Profit targets: Set crystal focuses at ${tokenData.analysis.riskLevel === 1 ? "10%" : tokenData.analysis.riskLevel === 2 ? "15%" : tokenData.analysis.riskLevel === 3 ? "20%" : tokenData.analysis.riskLevel === 4 ? "30%" : "40%"}
4. Protective wards: Place at ${tokenData.analysis.riskLevel === 1 ? "5%" : tokenData.analysis.riskLevel === 2 ? "7%" : tokenData.analysis.riskLevel === 3 ? "10%" : tokenData.analysis.riskLevel === 4 ? "15%" : "20%"} below entry

Our enchanted trading familiar would automatically implement these magical parameters when executing trades.`
  }

  if (
    lowercaseInput.includes("bot") ||
    lowercaseInput.includes("trading bot") ||
    lowercaseInput.includes("automated")
  ) {
    return `Our magical trading familiar uses ThirdWeb's trinity of mystical tools - Nebula, Insight, and Engine - to execute trades across multiple blockchain realms including ${tokenData.token.chain} where ${tokenData.token.symbol} dwells.

For this token, the familiar would:
1. Scry on-chain metrics and market conditions in real-time through ethereal connections
2. Cast a ${tokenData.analysis.strategy.name} strategy with ${tokenData.analysis.strategy.confidence}% confidence in the cosmic alignment
3. Execute trades with predefined protective wards (${tokenData.analysis.riskLevel === 1 ? "5%" : tokenData.analysis.riskLevel === 2 ? "7%" : tokenData.analysis.riskLevel === 3 ? "10%" : tokenData.analysis.riskLevel === 4 ? "15%" : "20%"} stop loss)
4. Maintain vigilant watch over positions through all moon phases and adjust to changing celestial conditions
5. Record all trading decisions in the ThirdWeb Insight grimoire for later study

The familiar is currently ${tokenData.analysis.tradingEnabled ? "attuned to trade this token based on your risk tolerance" : "avoiding this token as its mystical energies exceed your risk preferences"}.`
  }

  // Chain-specific knowledge
  if (lowercaseInput.includes("chain") || lowercaseInput.includes("blockchain") || lowercaseInput.includes("network")) {
    const chainName = tokenData.token.chain
    const chainInfo = chainKnowledge[chainName] || {
      history: "The mystical scrolls contain limited information about this blockchain realm.",
      strengths: "The ancient texts speak little of this chain's unique powers.",
      weaknesses: "The oracles have not revealed the challenges this chain may face.",
      future: "The crystal ball grows cloudy when attempting to divine this chain's future.",
    }

    return `Ah, you seek knowledge about the ${chainName} realm where ${tokenData.token.symbol} dwells!\n\n**Ancient History**: ${chainInfo.history}\n\n**Mystical Strengths**: ${chainInfo.strengths}\n\n**Arcane Weaknesses**: ${chainInfo.weaknesses}\n\n**Future Divinations**: ${chainInfo.future}`
  }

  // Token history (generic responses based on token type)
  if (lowercaseInput.includes("history") || lowercaseInput.includes("background") || lowercaseInput.includes("about")) {
    // Determine token type based on analysis data
    let tokenType = "Utility" // default
    if (tokenData.analysis.details.find((d) => d.name === "Token Type")) {
      tokenType = tokenData.analysis.details.find((d) => d.name === "Token Type").value
    } else if (
      tokenData.token.name.toLowerCase().includes("swap") ||
      tokenData.token.name.toLowerCase().includes("finance") ||
      tokenData.token.name.toLowerCase().includes("lend")
    ) {
      tokenType = "DeFi"
    } else if (
      tokenData.token.name.toLowerCase().includes("dao") ||
      tokenData.token.name.toLowerCase().includes("governance")
    ) {
      tokenType = "Governance"
    } else if (
      tokenData.token.name.toLowerCase().includes("doge") ||
      tokenData.token.name.toLowerCase().includes("shib") ||
      tokenData.token.name.toLowerCase().includes("pepe")
    ) {
      tokenType = "Meme"
    }

    const typeInfo = tokenTypes[tokenType] || tokenTypes["Utility"]

    return `The mystical origins of ${tokenData.token.symbol} (${tokenData.token.name}) are inscribed in the blockchain scrolls of ${tokenData.token.chain}. This appears to be a ${tokenType} token.\n\n${typeInfo.description}\n\n**Magical Potential**: ${typeInfo.potential}\n\n**Arcane Risks**: ${typeInfo.risks}\n\nThe token currently has ${tokenData.analysis.holdersCount.toLocaleString()} holders and a market cap of $${tokenData.analysis.marketCapUsd.toLocaleString()}, suggesting it has ${tokenData.analysis.marketCapUsd > 10000000 ? "established a significant presence" : tokenData.analysis.marketCapUsd > 1000000 ? "begun to gather notable magical energy" : "yet to amass substantial power"} in the crypto realm.`
  }

  // Magical price predictions
  if (
    lowercaseInput.includes("predict") ||
    lowercaseInput.includes("future") ||
    lowercaseInput.includes("forecast") ||
    lowercaseInput.includes("crystal ball")
  ) {
    const direction = Math.random() > 0.5 ? "positive" : "balanced"
    const randomPredictions = []

    // Add 3 random predictions
    for (let i = 0; i < 3; i++) {
      const prediction = magicalPredictions[Math.floor(Math.random() * magicalPredictions.length)]
        .replace("{token}", tokenData.token.symbol)
        .replace("{direction}", direction)
      randomPredictions.push(prediction)
    }

    return `I've consulted the ancient oracles regarding ${tokenData.token.symbol}'s future in the cosmic markets...\n\n${randomPredictions.join("\n\n")}\n\nRemember, even the most powerful seers cannot predict with certainty the whims of the crypto gods. The current risk level of ${tokenData.analysis.riskLevelName} suggests ${tokenData.analysis.riskLevel <= 2 ? "more stable magical energies" : tokenData.analysis.riskLevel <= 3 ? "moderate volatility in the ethereal planes" : "chaotic forces that could shift dramatically in any direction"}.`
  }

  // Generic responses
  if (lowercaseInput.includes("hello") || lowercaseInput.includes("hi ")) {
    return `Greetings, seeker of crypto wisdom! I am your mystical guide to the blockchain realms, currently focusing my scrying powers on ${tokenData.token.symbol} in the ${tokenData.token.chain} dimension. The ethereal energies are strong today - what aspects of this magical token would you like to explore?`
  }

  if (lowercaseInput.includes("thank")) {
    return "May the crypto gods smile upon your trades! I'm here to illuminate the path through the mystical fog of market uncertainty. Is there another aspect of the arcane token markets you wish to explore?"
  }

  if (lowercaseInput.includes("how are you")) {
    return "My ethereal essence vibrates in harmony with the blockchain cosmos. I'm currently channeling insights from multiple magical realms, with my scrying orb focused on ${tokenData.token.symbol}. How may I assist in your quest for crypto enlightenment?"
  }

  // Default responses
  const defaultResponses = [
    `The mystical aura surrounding ${tokenData.token.symbol} has many facets. Would you like to know about its risk profile, price movements, or perhaps the recommended trading enchantments?`,
    `I sense your curiosity about ${tokenData.token.symbol}. My crystal ball can reveal details about its price history, market metrics, or the optimal spells for trading this asset.`,
    `The ethereal energies of ${tokenData.token.symbol} suggest a ${tokenData.analysis.riskLevelName.toLowerCase()} risk level. Would you like to explore its trading potential or learn about its position in the cosmic market?`,
    `I'm channeling insights about ${tokenData.token.symbol} from the ${tokenData.token.chain} realm. Ask me about its liquidity pools, holder distribution, or the magical trading strategies that align with its nature.`,
    `The stars show that our trading familiar is ${tokenData.analysis.tradingEnabled ? "aligned to trade" : "currently avoiding"} ${tokenData.token.symbol} based on your risk preferences. Would you like to know why or adjust your magical settings?`,
  ]

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

export function ChatInterface({ tokenData }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `✨ Greetings, seeker of crypto wisdom! I am ELIZA, your mystical guide to the blockchain realms. I've gazed into the ethereal planes and analyzed ${tokenData.token.symbol} on the ${tokenData.token.chain} network. The stars have much to reveal about this token's potential and the cosmic forces affecting its price. What arcane knowledge do you seek? ✨`,
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Add AI response
    const aiResponse = { role: "assistant", content: elizaResponse(input, tokenData) }
    setMessages((prev) => [...prev, aiResponse])
    setIsTyping(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-b">
        <div className="flex items-center gap-3">
          {/* Token Logo */}
          <div className="h-8 w-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {tokenData.token.logoUrl ? (
              <img
                src={tokenData.token.logoUrl || "/placeholder.svg"}
                alt={tokenData.token.symbol}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback if logo fails to load
                  e.currentTarget.src = `/placeholder.svg?height=32&width=32&query=${tokenData.token.symbol}`
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <span className="text-xs font-bold">{tokenData.token.symbol.substring(0, 2)}</span>
              </div>
            )}
          </div>
          <CardTitle className="flex items-center gap-2">
            <Stars className="h-5 w-5 text-purple-400" />
            Mystical Trading Oracle
            <Sparkles className="h-5 w-5 text-purple-400" />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-background/80">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex items-start gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className={message.role === "user" ? "bg-primary" : "bg-purple-700"}>
                  {message.role === "user" ? <User className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <AvatarFallback>{message.role === "user" ? "U" : "E"}</AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-800/40"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[80%]">
                <Avatar className="bg-purple-700">
                  <Moon className="h-5 w-5" />
                  <AvatarFallback>E</AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-800/40">
                  <div className="flex gap-1">
                    <span className="animate-bounce">✨</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                      ✨
                    </span>
                    <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                      ✨
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 bg-gradient-to-r from-purple-900/10 to-indigo-900/10">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Ask about token history, price predictions, or trading strategies..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            className="border-purple-800/30 focus-visible:ring-purple-500"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-purple-700 hover:bg-purple-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
