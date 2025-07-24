import { TokenAnalyzer } from "@/components/token-analyzer"
import { TokenSearch } from "@/components/token-search"
import { AppLayout } from "@/components/app-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AnalyzePage() {
  return (
    <AppLayout>
      <section className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Token Analysis</h1>
        <p className="text-xl text-muted-foreground">Analyze tokens across multiple blockchains with ThirdWeb Nebula</p>
      </section>

      <Tabs defaultValue="address">
        <TabsList className="mb-6">
          <TabsTrigger value="address">Analyze by Address</TabsTrigger>
          <TabsTrigger value="search">Search Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="address">
          <TokenAnalyzer />
        </TabsContent>

        <TabsContent value="search">
          <TokenSearch
            onTokenSelect={(address, chain) => {
              // This would ideally update the TokenAnalyzer component
              // For now, we'll just redirect to the address tab with the values in the URL
              window.location.href = `/analyze?tab=address&token=${address}&chain=${chain}`
            }}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}
