"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/store/useStore";
import { formatPercent, formatCurrency } from "@/lib/utils";
import { MarketSummary } from "@/types";

interface MarketRowProps {
  market: MarketSummary;
  rank: number;
}

function MarketRow({ market, rank }: MarketRowProps) {
  const isPositive = market.change_24h >= 0;

  return (
    <Link href={`/market/${market.id}`}>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
        {/* Rank */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
          {rank}
        </div>

        {/* Market info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {market.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge
              variant={market.platform === "polymarket" ? "polymarket" : "kalshi"}
              className="text-[10px] h-4"
            >
              {market.platform === "polymarket" ? "Poly" : "Kalshi"}
            </Badge>
            <span className="text-xs text-muted-foreground">{market.category}</span>
          </div>
        </div>

        {/* Probability bar */}
        <div className="w-16 hidden sm:block">
          <Progress
            value={market.probability * 100}
            className="h-1.5"
            indicatorClassName={isPositive ? "bg-accent-bullish" : "bg-accent-bearish"}
          />
          <p className="text-[10px] text-muted-foreground text-center mt-0.5">
            {(market.probability * 100).toFixed(0)}%
          </p>
        </div>

        {/* Change */}
        <div
          className={`flex items-center gap-1 ${
            isPositive ? "text-accent-bullish" : "text-accent-bearish"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span className="text-sm font-medium">{formatPercent(market.change_24h)}</span>
        </div>
      </div>
    </Link>
  );
}

function MarketRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="w-6 h-6 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-16 h-4" />
    </div>
  );
}

export default function TrendingPanel() {
  const { trendingMarkets, isLoading } = useStore();

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent-highlight" />
            Trending Markets
          </CardTitle>
          <Link href="/markets?sort=trending">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {isLoading || trendingMarkets.length === 0 ? (
            [1, 2, 3, 4, 5].map((i) => <MarketRowSkeleton key={i} />)
          ) : (
            trendingMarkets.slice(0, 5).map((market, index) => (
              <MarketRow key={market.id} market={market} rank={index + 1} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
