"use client";

import Link from "next/link";
import { Users, Trophy, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/store/useStore";
import { formatCurrency, truncateAddress } from "@/lib/utils";
import { SmartTraderSummary } from "@/types";

interface TraderRowProps {
  trader: SmartTraderSummary;
  rank: number;
}

function TraderRow({ trader, rank }: TraderRowProps) {
  const isProfitable = trader.pnl >= 0;

  return (
    <Link href={`/traders/${trader.id}`}>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
        {/* Rank with trophy for top 3 */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          {rank <= 3 ? (
            <Trophy
              className={`h-4 w-4 ${
                rank === 1
                  ? "text-yellow-400"
                  : rank === 2
                  ? "text-gray-400"
                  : "text-amber-700"
              }`}
            />
          ) : (
            <span className="text-xs font-medium">{rank}</span>
          )}
        </div>

        {/* Trader info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono text-foreground group-hover:text-primary transition-colors">
            {truncateAddress(trader.address)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatCurrency(trader.total_value)}
            </span>
          </div>
        </div>

        {/* Win rate */}
        <div className="w-16 hidden sm:block">
          <Progress
            value={trader.win_rate * 100}
            className="h-1.5"
            indicatorClassName="bg-accent-smart"
          />
          <p className="text-[10px] text-muted-foreground text-center mt-0.5">
            {(trader.win_rate * 100).toFixed(0)}% win
          </p>
        </div>

        {/* PnL */}
        <div
          className={`text-right ${
            isProfitable ? "text-accent-bullish" : "text-accent-bearish"
          }`}
        >
          <p className="text-sm font-medium">
            {isProfitable ? "+" : ""}
            {formatCurrency(trader.pnl)}
          </p>
          <p className="text-[10px] text-muted-foreground">PnL</p>
        </div>
      </div>
    </Link>
  );
}

function TraderRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="w-8 h-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="w-16 h-4" />
    </div>
  );
}

export default function SmartTradersPanel() {
  const { smartTraders, isLoading } = useStore();

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-accent-smart" />
            Smart Traders
          </CardTitle>
          <Link href="/traders">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {isLoading || smartTraders.length === 0 ? (
            [1, 2, 3, 4, 5].map((i) => <TraderRowSkeleton key={i} />)
          ) : (
            smartTraders.slice(0, 5).map((trader, index) => (
              <TraderRow key={trader.id} trader={trader} rank={index + 1} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
