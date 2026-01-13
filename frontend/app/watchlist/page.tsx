"use client";

import { useEffect, useState } from "react";
import { Star, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MarketCard from "@/components/markets/MarketCard";
import { getWatchlist, getMarket } from "@/lib/api";
import { useStore } from "@/store/useStore";
import { Market } from "@/types";
import Link from "next/link";

export default function WatchlistPage() {
  const { watchlist, setWatchlist } = useStore();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWatchlist() {
      setLoading(true);
      try {
        const data = await getWatchlist();
        setWatchlist(data);

        // Fetch market details for each watchlist item
        if (data.market_ids && data.market_ids.length > 0) {
          const marketPromises = data.market_ids.map((id) =>
            getMarket(id).catch(() => null)
          );
          const marketResults = await Promise.all(marketPromises);
          setMarkets(marketResults.filter((m): m is Market => m !== null));
        } else {
          setMarkets([]);
        }
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWatchlist();
  }, [setWatchlist]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6 text-accent-highlight fill-accent-highlight" />
            Watchlist
          </h1>
          <p className="text-muted-foreground">
            Your saved markets for quick access
          </p>
        </div>
        <Link href="/markets">
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            Add Markets
          </Button>
        </Link>
      </div>

      {/* Watchlist content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : markets.length === 0 ? (
        <Card className="bg-card/50">
          <CardContent className="p-12 text-center">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No markets in watchlist</h3>
            <p className="text-muted-foreground mb-4">
              Start adding markets to your watchlist to track them here
            </p>
            <Link href="/markets">
              <Button>Browse Markets</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
