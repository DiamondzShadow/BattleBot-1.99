"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Coins,
  Cpu,
  Flame,
  Home,
  LineChart,
  Settings,
  Snowflake,
  ThermometerSun,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"
import { Badge } from "@/components/ui/badge"

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Cpu className="h-6 w-6 text-primary" />
          <div className="font-bold text-xl">TradingAI</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/analyze"}>
                  <Link href="/analyze">
                    <LineChart className="h-4 w-4" />
                    <span>Token Analysis</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/trades"}>
                  <Link href="/trades">
                    <TrendingUp className="h-4 w-4" />
                    <span>Active Trades</span>
                  </Link>
                </SidebarMenuButton>
                <Badge className="absolute right-1 top-1.5 min-w-5 h-5 flex items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-primary-foreground bg-primary">
                  5
                </Badge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/production-bot"}>
                  <Link href="/production-bot">
                    <Zap className="h-4 w-4" />
                    <span>Production Bot</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/portfolio"}>
                  <Link href="/portfolio">
                    <Wallet className="h-4 w-4" />
                    <span>Portfolio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/performance"}>
                  <Link href="/performance">
                    <BarChart3 className="h-4 w-4" />
                    <span>Performance</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Risk Levels</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/risk/cold">
                    <Snowflake className="h-4 w-4 text-blue-500" />
                    <span>Cold</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/risk/warm">
                    <ThermometerSun className="h-4 w-4 text-yellow-500" />
                    <span>Warm</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/risk/hot">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>Hot</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/risk/steaming">
                    <Flame className="h-4 w-4 text-red-500" />
                    <span>Steaming</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/risk/nova">
                    <Flame className="h-4 w-4 text-purple-500" />
                    <span>Nova</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Blockchains</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/chains/polygon">
                    <Coins className="h-4 w-4 text-purple-500" />
                    <span>Polygon</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/chains/bnb">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span>BNB Chain</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/chains/arbitrum">
                    <Coins className="h-4 w-4 text-blue-500" />
                    <span>Arbitrum</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/chains/optimism">
                    <Coins className="h-4 w-4 text-red-500" />
                    <span>Optimism</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/chains/base">
                    <Coins className="h-4 w-4 text-green-500" />
                    <span>Base</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="p-4">
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
