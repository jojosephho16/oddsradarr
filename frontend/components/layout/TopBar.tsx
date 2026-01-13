"use client";

import { useState, useEffect } from "react";
import { Search, Globe, Activity, Bell, Settings, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import { formatNumber, formatCurrency } from "@/lib/utils";

export default function TopBar() {
  const {
    globalStats,
    searchQuery,
    setSearchQuery,
    sidebarOpen,
    setSidebarOpen,
  } = useStore();
  const [isConnected, setIsConnected] = useState(true);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Menu toggle for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary animate-pulse" />
          <span className="hidden font-bold text-lg sm:inline-block">
            OddsRadar
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search markets..."
              className="pl-8 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Live stats */}
        <div className="hidden md:flex items-center gap-4">
          {globalStats && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Total OI:</span>
                <span className="font-semibold text-accent-bullish">
                  {formatCurrency(globalStats.total_open_interest)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">24h Vol:</span>
                <span className="font-semibold text-accent-volume">
                  {formatCurrency(globalStats.total_volume_24h)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Markets:</span>
                <span className="font-semibold">
                  {globalStats.active_markets}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Status and actions */}
        <div className="flex items-center gap-2">
          {/* Connection status */}
          <Badge
            variant={isConnected ? "bullish" : "bearish"}
            className="hidden sm:flex items-center gap-1"
          >
            <Activity className="h-3 w-3" />
            {isConnected ? "Live" : "Offline"}
          </Badge>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent-bearish" />
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
