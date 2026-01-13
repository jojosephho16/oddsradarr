"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/store/useStore";
import {
  getTrendingMarkets,
  getTopOIMarkets,
  getTopVolumeMarkets,
  getGlobalStats,
  getSmartTraders,
} from "@/lib/api";
import StatsPanel from "@/components/panels/StatsPanel";
import TrendingPanel from "@/components/panels/TrendingPanel";
import TopMarketsPanel from "@/components/panels/TopMarketsPanel";
import SmartTradersPanel from "@/components/panels/SmartTradersPanel";
import GlobeControls from "@/components/globe/GlobeControls";
import OIChart from "@/components/charts/OIChart";
import VolumeChart from "@/components/charts/VolumeChart";
import { useMarketWebSocket } from "@/lib/useWebSocket";
import { ChartDataPoint } from "@/types";

// Dynamic import for 3D globe (no SSR)
const OrbitGlobe = dynamic(() => import("@/components/globe/OrbitGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-lg bg-card/50 animate-pulse flex items-center justify-center">
      <div className="text-muted-foreground">Loading 3D Globe...</div>
    </div>
  ),
});

export default function DashboardPage() {
  const {
    setTrendingMarkets,
    setTopOIMarkets,
    setTopVolumeMarkets,
    setGlobalStats,
    setSmartTraders,
    setIsLoading,
    setError,
    topOIMarkets,
    topVolumeMarkets,
  } = useStore();

  // Generate chart data from markets
  const oiChartData = useMemo((): ChartDataPoint[] => {
    if (!topOIMarkets || topOIMarkets.length === 0) return [];

    // Generate time-series data based on current OI with simulated history
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    const totalOI = topOIMarkets.reduce((sum, m) => sum + (m.open_interest || 0), 0);

    return Array.from({ length: 24 }, (_, i) => {
      const variance = 0.9 + Math.random() * 0.2; // 90%-110% variance
      return {
        time: new Date(now - (23 - i) * hourMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        value: Math.round(totalOI * variance),
      };
    });
  }, [topOIMarkets]);

  const volumeChartData = useMemo((): ChartDataPoint[] => {
    if (!topVolumeMarkets || topVolumeMarkets.length === 0) return [];

    // Generate time-series data based on current volume with simulated history
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    const totalVolume = topVolumeMarkets.reduce((sum, m) => sum + (m.volume_24h || 0), 0);

    return Array.from({ length: 24 }, (_, i) => {
      const variance = 0.5 + Math.random() * 1.0; // 50%-150% variance for volume
      return {
        time: new Date(now - (23 - i) * hourMs).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        value: Math.round((totalVolume / 24) * variance),
      };
    });
  }, [topVolumeMarkets]);

  // Connect to WebSocket for real-time updates
  const { isConnected } = useMarketWebSocket();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [trending, topOI, topVolume, stats, traders] = await Promise.all([
          getTrendingMarkets(10).catch(() => ({ markets: [] })),
          getTopOIMarkets(10).catch(() => ({ markets: [] })),
          getTopVolumeMarkets(10).catch(() => ({ markets: [] })),
          getGlobalStats().catch(() => null),
          getSmartTraders({ limit: 10 }).catch(() => []),
        ]);

        setTrendingMarkets(trending.markets || []);
        setTopOIMarkets(topOI.markets || []);
        setTopVolumeMarkets(topVolume.markets || []);
        if (stats) setGlobalStats(stats);
        setSmartTraders(traders || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch market data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    // Fallback polling every 60 seconds (WebSocket provides real-time updates)
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [
    setTrendingMarkets,
    setTopOIMarkets,
    setTopVolumeMarkets,
    setGlobalStats,
    setSmartTraders,
    setIsLoading,
    setError,
  ]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Global Stats */}
      <StatsPanel />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Globe section - spans 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Globe controls */}
          <GlobeControls />

          {/* 3D Globe */}
          <div className="h-[500px] bg-card/30 rounded-lg border border-border overflow-hidden">
            <OrbitGlobe />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <OIChart data={oiChartData} />
            <VolumeChart data={volumeChartData} />
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-4">
          <TrendingPanel />
          <TopMarketsPanel />
          <SmartTradersPanel />
        </div>
      </div>
    </div>
  );
}
