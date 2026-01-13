"use client";

import { TrendingUp, BarChart3, Activity, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/store/useStore";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: typeof TrendingUp;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg bg-muted ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatsPanel() {
  const { globalStats, isLoading } = useStore();

  if (isLoading || !globalStats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Open Interest"
        value={formatCurrency(globalStats.total_open_interest)}
        icon={TrendingUp}
        color="text-accent-bullish"
        subtitle="Across all markets"
      />
      <StatCard
        title="24h Volume"
        value={formatCurrency(globalStats.total_volume_24h)}
        icon={BarChart3}
        color="text-accent-volume"
        subtitle="Total traded"
      />
      <StatCard
        title="Active Markets"
        value={globalStats.active_markets.toLocaleString()}
        icon={Activity}
        color="text-primary"
        subtitle={`of ${globalStats.total_markets} total`}
      />
      <StatCard
        title="Platforms"
        value={`${globalStats.polymarket_count + globalStats.kalshi_count}`}
        icon={Layers}
        color="text-accent-highlight"
        subtitle={`Poly: ${globalStats.polymarket_count} | Kalshi: ${globalStats.kalshi_count}`}
      />
    </div>
  );
}
