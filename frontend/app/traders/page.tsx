"use client";

import { useEffect, useState } from "react";
import { Users, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getSmartTraders, getSmartTradersSummary } from "@/lib/api";
import { SmartTraderSummary } from "@/types";
import { formatCurrency, truncateAddress } from "@/lib/utils";

export default function TradersPage() {
  const [traders, setTraders] = useState<SmartTraderSummary[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [tradersData, summaryData] = await Promise.all([
          getSmartTraders({ limit: 20 }),
          getSmartTradersSummary(),
        ]);
        setTraders(tradersData || []);
        setSummary(summaryData);
      } catch (error) {
        console.error("Error fetching traders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-accent-smart" />
          Smart Traders
        </h1>
        <p className="text-muted-foreground">
          Track the top performing traders across prediction markets
        </p>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Traders</p>
              <p className="text-2xl font-bold mt-1">{summary.total_traders}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold mt-1 text-primary">
                {formatCurrency(summary.total_value)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total PnL</p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  summary.total_pnl >= 0
                    ? "text-accent-bullish"
                    : "text-accent-bearish"
                }`}
              >
                {summary.total_pnl >= 0 ? "+" : ""}
                {formatCurrency(summary.total_pnl)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Avg Win Rate</p>
              <p className="text-2xl font-bold mt-1 text-accent-smart">
                {(summary.average_win_rate * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Traders list */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {traders.map((trader, index) => {
                const isProfitable = trader.pnl >= 0;
                const rank = index + 1;

                return (
                  <div
                    key={trader.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {rank <= 3 ? (
                        <Trophy
                          className={`h-5 w-5 ${
                            rank === 1
                              ? "text-yellow-400"
                              : rank === 2
                              ? "text-gray-400"
                              : "text-amber-700"
                          }`}
                        />
                      ) : (
                        <span className="font-bold">{rank}</span>
                      )}
                    </div>

                    {/* Address */}
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm">
                        {truncateAddress(trader.address, 6)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(trader.total_value)} portfolio
                      </p>
                    </div>

                    {/* Win rate */}
                    <div className="w-24 hidden sm:block">
                      <Progress
                        value={trader.win_rate * 100}
                        className="h-2"
                        indicatorClassName="bg-accent-smart"
                      />
                      <p className="text-xs text-center text-muted-foreground mt-1">
                        {(trader.win_rate * 100).toFixed(0)}% win
                      </p>
                    </div>

                    {/* PnL */}
                    <div
                      className={`text-right ${
                        isProfitable
                          ? "text-accent-bullish"
                          : "text-accent-bearish"
                      }`}
                    >
                      <div className="flex items-center gap-1 justify-end">
                        {isProfitable ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-bold">
                          {isProfitable ? "+" : ""}
                          {formatCurrency(trader.pnl)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">PnL</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
