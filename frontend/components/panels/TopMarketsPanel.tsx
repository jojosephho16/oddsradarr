"use client";

import Link from "next/link";
import { BarChart3, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/store/useStore";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { MarketSummary } from "@/types";

interface MarketItemProps {
  market: MarketSummary;
  rank: number;
  metric: "oi" | "volume";
}

function MarketItem({ market, rank, metric }: MarketItemProps) {
  const value = metric === "oi" ? market.open_interest : market.volume_24h;
  const color = metric === "oi" ? "text-accent-bullish" : "text-accent-volume";

  return (
    <Link href={`/market/${market.id}`}>
      <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex-shrink-0 w-5 h-5 rounded bg-muted flex items-center justify-center text-[10px] font-medium">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{market.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge
              variant={market.platform === "polymarket" ? "polymarket" : "kalshi"}
              className="text-[10px] h-4 px-1.5"
            >
              {market.platform === "polymarket" ? "P" : "K"}
            </Badge>
            <span className={`text-xs font-medium ${color}`}>
              {formatCurrency(value)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            {(market.probability * 100).toFixed(0)}%
          </p>
          <p
            className={`text-xs ${
              market.change_24h >= 0 ? "text-accent-bullish" : "text-accent-bearish"
            }`}
          >
            {market.change_24h >= 0 ? "+" : ""}
            {market.change_24h.toFixed(2)}%
          </p>
        </div>
      </div>
    </Link>
  );
}

function MarketItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2.5">
      <Skeleton className="w-5 h-5 rounded" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-12 h-8" />
    </div>
  );
}

export default function TopMarketsPanel() {
  const { topOIMarkets, topVolumeMarkets, isLoading } = useStore();

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <Tabs defaultValue="oi">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <TabsList className="h-8">
              <TabsTrigger value="oi" className="text-xs gap-1.5 px-2">
                <TrendingUp className="h-3 w-3" />
                Top OI
              </TabsTrigger>
              <TabsTrigger value="volume" className="text-xs gap-1.5 px-2">
                <BarChart3 className="h-3 w-3" />
                Top Volume
              </TabsTrigger>
            </TabsList>
            <Link href="/markets">
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-2">
          <TabsContent value="oi" className="m-0 space-y-0.5">
            {isLoading || topOIMarkets.length === 0 ? (
              [1, 2, 3, 4, 5].map((i) => <MarketItemSkeleton key={i} />)
            ) : (
              topOIMarkets.slice(0, 5).map((market, index) => (
                <MarketItem
                  key={market.id}
                  market={market}
                  rank={index + 1}
                  metric="oi"
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="volume" className="m-0 space-y-0.5">
            {isLoading || topVolumeMarkets.length === 0 ? (
              [1, 2, 3, 4, 5].map((i) => <MarketItemSkeleton key={i} />)
            ) : (
              topVolumeMarkets.slice(0, 5).map((market, index) => (
                <MarketItem
                  key={market.id}
                  market={market}
                  rank={index + 1}
                  metric="volume"
                />
              ))
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
