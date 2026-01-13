"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OIChart from "@/components/charts/OIChart";
import VolumeChart from "@/components/charts/VolumeChart";
import ProbabilityChart from "@/components/charts/ProbabilityChart";
import { getMarket, getMarketHistory } from "@/lib/api";
import { useStore } from "@/store/useStore";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Market } from "@/types";

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const marketId = params.id as string;

  const { isInWatchlist, toggleWatchlist } = useStore();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarket() {
      if (!marketId) return;
      setLoading(true);
      try {
        const data = await getMarket(marketId);
        setMarket(data);
      } catch (err) {
        console.error("Error fetching market:", err);
        setError("Failed to load market");
      } finally {
        setLoading(false);
      }
    }
    fetchMarket();
  }, [marketId]);

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="p-4 lg:p-6">
        <Card className="bg-card/50">
          <CardContent className="p-8 text-center">
            <p className="text-destructive mb-4">{error || "Market not found"}</p>
            <Button onClick={() => router.push("/markets")}>
              Back to Markets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPositive = market.change_24h >= 0;
  const inWatchlist = isInWatchlist(market.id);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{market.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={market.platform === "polymarket" ? "polymarket" : "kalshi"}
                >
                  {market.platform === "polymarket" ? "Polymarket" : "Kalshi"}
                </Badge>
                <Badge variant="outline">{market.category}</Badge>
                <Badge
                  variant={market.status === "open" ? "bullish" : "secondary"}
                >
                  {market.status}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleWatchlist(market.id)}
            >
              <Star
                className={`h-5 w-5 ${
                  inWatchlist
                    ? "fill-accent-highlight text-accent-highlight"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>

          {market.description && (
            <p className="text-muted-foreground mt-4 text-sm">
              {market.description}
            </p>
          )}
        </div>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Probability</p>
            <p className="text-2xl font-bold mt-1">
              {(market.probability * 100).toFixed(1)}%
            </p>
            <Progress
              value={market.probability * 100}
              className="mt-2 h-2"
              indicatorClassName={
                market.probability >= 0.5 ? "bg-accent-bullish" : "bg-accent-bearish"
              }
            />
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Open Interest
            </p>
            <p className="text-2xl font-bold mt-1 text-accent-bullish">
              {formatCurrency(market.open_interest)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              24h Volume
            </p>
            <p className="text-2xl font-bold mt-1 text-accent-volume">
              {formatCurrency(market.volume_24h)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">24h Change</p>
            <div
              className={`flex items-center gap-1 mt-1 ${
                isPositive ? "text-accent-bullish" : "text-accent-bearish"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              <span className="text-2xl font-bold">
                {formatPercent(market.change_24h)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-accent-bullish/10 border-accent-bullish/30">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-accent-bullish">Yes</p>
            <p className="text-3xl font-bold text-accent-bullish mt-1">
              ${market.price_yes.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {(market.price_yes * 100).toFixed(1)}% implied
            </p>
          </CardContent>
        </Card>

        <Card className="bg-accent-bearish/10 border-accent-bearish/30">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-accent-bearish">No</p>
            <p className="text-3xl font-bold text-accent-bearish mt-1">
              ${market.price_no.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {(market.price_no * 100).toFixed(1)}% implied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="probability" className="space-y-4">
        <TabsList>
          <TabsTrigger value="probability">Probability</TabsTrigger>
          <TabsTrigger value="oi">Open Interest</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
        </TabsList>

        <TabsContent value="probability">
          <ProbabilityChart
            data={[]}
            currentProbability={market.probability}
            title="Probability History"
          />
        </TabsContent>

        <TabsContent value="oi">
          <OIChart data={[]} title="Open Interest History" />
        </TabsContent>

        <TabsContent value="volume">
          <VolumeChart data={[]} title="Volume History" />
        </TabsContent>
      </Tabs>

      {/* Market info */}
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Market Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Volume</span>
            <span className="font-medium">
              {formatCurrency(market.volume_total)}
            </span>
          </div>
          {market.end_date && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                End Date
              </span>
              <span className="font-medium">
                {new Date(market.end_date).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Market ID</span>
            <span className="font-mono text-xs">{market.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
