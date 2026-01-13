"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Star,
  ArrowUpDown,
  Grid3X3,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/store/useStore";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Market } from "@/types";
import MarketCard from "./MarketCard";

interface MarketListProps {
  markets: Market[];
  loading?: boolean;
}

export default function MarketList({ markets, loading = false }: MarketListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"volume" | "oi" | "change">("volume");
  const { isInWatchlist, toggleWatchlist } = useStore();

  const sortedMarkets = [...markets].sort((a, b) => {
    switch (sortBy) {
      case "oi":
        return b.open_interest - a.open_interest;
      case "change":
        return Math.abs(b.change_24h) - Math.abs(a.change_24h);
      default:
        return b.volume_24h - a.volume_24h;
    }
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {markets.length} markets
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={sortBy === "volume" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSortBy("volume")}
            >
              Volume
            </Button>
            <Button
              variant={sortBy === "oi" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSortBy("oi")}
            >
              OI
            </Button>
            <Button
              variant={sortBy === "change" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSortBy("change")}
            >
              Change
            </Button>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Markets */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">
                  Market
                </th>
                <th className="text-center p-3 text-xs font-medium text-muted-foreground">
                  Platform
                </th>
                <th className="text-right p-3 text-xs font-medium text-muted-foreground">
                  Probability
                </th>
                <th className="text-right p-3 text-xs font-medium text-muted-foreground">
                  Open Interest
                </th>
                <th className="text-right p-3 text-xs font-medium text-muted-foreground">
                  Volume 24h
                </th>
                <th className="text-right p-3 text-xs font-medium text-muted-foreground">
                  Change 24h
                </th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {sortedMarkets.map((market) => {
                const isPositive = market.change_24h >= 0;
                const inWatchlist = isInWatchlist(market.id);

                return (
                  <tr
                    key={market.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3">
                      <Link href={`/market/${market.id}`}>
                        <span className="font-medium hover:text-primary transition-colors line-clamp-1">
                          {market.title}
                        </span>
                      </Link>
                    </td>
                    <td className="p-3 text-center">
                      <Badge
                        variant={
                          market.platform === "polymarket"
                            ? "polymarket"
                            : "kalshi"
                        }
                        className="text-[10px]"
                      >
                        {market.platform === "polymarket" ? "Poly" : "Kalshi"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {(market.probability * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 text-right text-accent-bullish">
                      {formatCurrency(market.open_interest)}
                    </td>
                    <td className="p-3 text-right text-accent-volume">
                      {formatCurrency(market.volume_24h)}
                    </td>
                    <td className="p-3 text-right">
                      <div
                        className={`flex items-center justify-end gap-1 ${
                          isPositive
                            ? "text-accent-bullish"
                            : "text-accent-bearish"
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatPercent(market.change_24h)}
                      </div>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleWatchlist(market.id)}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            inWatchlist
                              ? "fill-accent-highlight text-accent-highlight"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {markets.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No markets found
        </div>
      )}
    </div>
  );
}
