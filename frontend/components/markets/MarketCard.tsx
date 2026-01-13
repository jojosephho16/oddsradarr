"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Star, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/store/useStore";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Market } from "@/types";

interface MarketCardProps {
  market: Market;
}

export default function MarketCard({ market }: MarketCardProps) {
  const { isInWatchlist, toggleWatchlist } = useStore();
  const inWatchlist = isInWatchlist(market.id);
  const isPositive = market.change_24h >= 0;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 transition-all group">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <Link href={`/market/${market.id}`}>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {market.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge
                variant={market.platform === "polymarket" ? "polymarket" : "kalshi"}
              >
                {market.platform === "polymarket" ? "Polymarket" : "Kalshi"}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {market.category}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.preventDefault();
              toggleWatchlist(market.id);
            }}
          >
            <Star
              className={`h-4 w-4 ${
                inWatchlist
                  ? "fill-accent-highlight text-accent-highlight"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>

        {/* Probability bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Probability</span>
            <span className="text-sm font-medium">
              {(market.probability * 100).toFixed(1)}%
            </span>
          </div>
          <Progress
            value={market.probability * 100}
            className="h-2"
            indicatorClassName={
              market.probability >= 0.5 ? "bg-accent-bullish" : "bg-accent-bearish"
            }
          />
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>No ${market.price_no.toFixed(2)}</span>
            <span>Yes ${market.price_yes.toFixed(2)}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">Open Interest</p>
            <p className="text-sm font-medium text-accent-bullish">
              {formatCurrency(market.open_interest)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">24h Volume</p>
            <p className="text-sm font-medium text-accent-volume">
              {formatCurrency(market.volume_24h)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground">24h Change</p>
            <div
              className={`flex items-center justify-center gap-0.5 ${
                isPositive ? "text-accent-bullish" : "text-accent-bearish"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="text-sm font-medium">
                {formatPercent(market.change_24h)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {market.status === "open" ? "Trading" : market.status}
          </span>
          <Link href={`/market/${market.id}`}>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              Details
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
