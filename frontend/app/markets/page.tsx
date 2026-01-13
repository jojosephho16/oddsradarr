"use client";

import { useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MarketList from "@/components/markets/MarketList";
import { getMarkets, getCategories } from "@/lib/api";
import { Market } from "@/types";
import { useStore } from "@/store/useStore";

export default function MarketsPage() {
  const { selectedPlatform, setSelectedPlatform } = useStore();

  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch markets
  useEffect(() => {
    async function fetchMarkets() {
      setLoading(true);
      try {
        const data = await getMarkets({
          platform: selectedPlatform || undefined,
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
          page,
          per_page: 24,
        });
        setMarkets(data.markets || []);
        setTotal(data.total);
      } catch (error) {
        console.error("Error fetching markets:", error);
        setMarkets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMarkets();
  }, [selectedPlatform, selectedCategory, searchQuery, page]);

  const clearFilters = () => {
    setSelectedPlatform(null);
    setSelectedCategory(null);
    setSearchQuery("");
    setPage(1);
  };

  const hasFilters = selectedPlatform || selectedCategory || searchQuery;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Markets</h1>
          <p className="text-muted-foreground">
            Browse all prediction markets from Polymarket and Kalshi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {total.toLocaleString()} markets
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card/50">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Platform filter */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedPlatform === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedPlatform(null);
                  setPage(1);
                }}
              >
                All Platforms
              </Badge>
              <Badge
                variant={selectedPlatform === "polymarket" ? "polymarket" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedPlatform("polymarket");
                  setPage(1);
                }}
              >
                Polymarket
              </Badge>
              <Badge
                variant={selectedPlatform === "kalshi" ? "kalshi" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedPlatform("kalshi");
                  setPage(1);
                }}
              >
                Kalshi
              </Badge>
            </div>

            {/* Clear filters */}
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === null ? "secondary" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => {
                    setSelectedCategory(null);
                    setPage(1);
                  }}
                >
                  All
                </Badge>
                {categories.slice(0, 10).map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "secondary" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => {
                      setSelectedCategory(category);
                      setPage(1);
                    }}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market list */}
      <MarketList markets={markets} loading={loading} />

      {/* Pagination */}
      {total > 24 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / 24)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(total / 24)}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
