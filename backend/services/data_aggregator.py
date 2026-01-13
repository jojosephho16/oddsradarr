import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime

from services.polymarket_service import get_polymarket_service
from services.kalshi_service import get_kalshi_service
from utils.cache import market_cache, stats_cache


class DataAggregator:
    """Aggregates data from multiple prediction market sources."""

    def __init__(self):
        self.polymarket = get_polymarket_service()
        self.kalshi = get_kalshi_service()

    async def fetch_all_markets(
        self,
        limit: int = 50,
        active_only: bool = True,
        platform: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Fetch markets from all sources with optional filtering at source level."""
        # Determine which platforms to fetch based on filter
        fetch_poly = platform is None or platform == "polymarket"
        fetch_kalshi = platform is None or platform == "kalshi"

        tasks = []

        if fetch_poly:
            poly_task = self.polymarket.fetch_and_parse_markets(
                limit=limit,
                active_only=active_only if status is None else status == "open",
            )
            tasks.append(("polymarket", poly_task))

        if fetch_kalshi:
            kalshi_status = "open" if active_only else "all"
            if status:
                kalshi_status = status
            kalshi_task = self.kalshi.fetch_and_parse_markets(
                limit=limit,
                status=kalshi_status,
            )
            tasks.append(("kalshi", kalshi_task))

        # Execute platform fetches concurrently
        results = await asyncio.gather(
            *[task for _, task in tasks],
            return_exceptions=True,
        )

        # Combine results
        all_markets = []
        for i, (platform_name, _) in enumerate(tasks):
            result = results[i]
            if isinstance(result, Exception):
                print(f"Error fetching {platform_name}: {result}")
            else:
                all_markets.extend(result)

        # Apply category filter if specified (needs to be done after fetch since APIs don't support it)
        if category:
            category_lower = category.lower()
            all_markets = [
                m for m in all_markets
                if m.get("category", "").lower() == category_lower
            ]

        # Apply status filter if specified
        if status:
            all_markets = [m for m in all_markets if m["status"] == status]

        # Sort by volume
        all_markets.sort(key=lambda x: x.get("volume_24h", 0), reverse=True)

        return all_markets

    async def get_trending_markets(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get trending markets based on 24h change."""
        cache_key = f"trending_{limit}"
        cached = await market_cache.get(cache_key)
        if cached:
            return cached

        all_markets = await self.fetch_all_markets(limit=100)

        # Sort by absolute change
        trending = sorted(
            all_markets,
            key=lambda x: abs(x.get("change_24h", 0)),
            reverse=True,
        )[:limit]

        await market_cache.set(cache_key, trending)
        return trending

    async def get_top_by_oi(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top markets by open interest."""
        cache_key = f"top_oi_{limit}"
        cached = await market_cache.get(cache_key)
        if cached:
            return cached

        all_markets = await self.fetch_all_markets(limit=100)

        # Sort by open interest
        top_oi = sorted(
            all_markets,
            key=lambda x: x.get("open_interest", 0),
            reverse=True,
        )[:limit]

        await market_cache.set(cache_key, top_oi)
        return top_oi

    async def get_top_by_volume(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top markets by 24h volume."""
        cache_key = f"top_volume_{limit}"
        cached = await market_cache.get(cache_key)
        if cached:
            return cached

        all_markets = await self.fetch_all_markets(limit=100)

        # Sort by volume
        top_volume = sorted(
            all_markets,
            key=lambda x: x.get("volume_24h", 0),
            reverse=True,
        )[:limit]

        await market_cache.set(cache_key, top_volume)
        return top_volume

    async def get_global_stats(self) -> Dict[str, Any]:
        """Calculate global statistics across all platforms."""
        cache_key = "global_stats"
        cached = await stats_cache.get(cache_key)
        if cached:
            return cached

        all_markets = await self.fetch_all_markets(limit=500)

        total_oi = sum(m.get("open_interest", 0) for m in all_markets)
        total_volume = sum(m.get("volume_24h", 0) for m in all_markets)

        poly_count = len([m for m in all_markets if m["platform"] == "polymarket"])
        kalshi_count = len([m for m in all_markets if m["platform"] == "kalshi"])

        stats = {
            "total_markets": len(all_markets),
            "total_open_interest": total_oi,
            "total_volume_24h": total_volume,
            "active_markets": len([m for m in all_markets if m["status"] == "open"]),
            "polymarket_count": poly_count,
            "kalshi_count": kalshi_count,
            "updated_at": datetime.utcnow().isoformat(),
        }

        await stats_cache.set(cache_key, stats)
        return stats

    async def search_markets(
        self,
        query: str,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        """Search markets by title or description."""
        all_markets = await self.fetch_all_markets(limit=200)

        query_lower = query.lower()
        results = [
            m for m in all_markets
            if query_lower in m.get("title", "").lower()
            or query_lower in m.get("description", "").lower()
            or query_lower in m.get("category", "").lower()
        ]

        return results[:limit]

    async def get_market_by_id(self, market_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific market by ID."""
        cache_key = f"market_{market_id}"
        cached = await market_cache.get(cache_key)
        if cached:
            return cached

        # Determine platform from ID prefix
        if market_id.startswith("poly_"):
            original_id = market_id.replace("poly_", "")
            raw = await self.polymarket.get_market(original_id)
            if raw:
                market = self.polymarket.parse_market(raw)
                await market_cache.set(cache_key, market)
                return market
        elif market_id.startswith("kalshi_"):
            ticker = market_id.replace("kalshi_", "")
            raw = await self.kalshi.get_market(ticker)
            if raw:
                market = self.kalshi.parse_market(raw)
                await market_cache.set(cache_key, market)
                return market

        return None

    async def get_markets_by_category(
        self,
        category: str,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Get markets filtered by category."""
        all_markets = await self.fetch_all_markets(limit=200)

        category_lower = category.lower()
        filtered = [
            m for m in all_markets
            if m.get("category", "").lower() == category_lower
        ]

        return filtered[:limit]

    async def get_categories(self) -> List[str]:
        """Get list of all categories."""
        all_markets = await self.fetch_all_markets(limit=500)

        categories = set()
        for m in all_markets:
            cat = m.get("category")
            if cat:
                categories.add(cat)

        return sorted(list(categories))


# Singleton instance
_data_aggregator: Optional[DataAggregator] = None


def get_data_aggregator() -> DataAggregator:
    global _data_aggregator
    if _data_aggregator is None:
        _data_aggregator = DataAggregator()
    return _data_aggregator
