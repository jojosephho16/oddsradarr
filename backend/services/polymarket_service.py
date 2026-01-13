import httpx
import os
from typing import List, Optional, Dict, Any
from datetime import datetime
import asyncio
from models.schemas import Market, MarketSummary, Platform, MarketStatus
from utils.cache import market_cache, cached

# Polymarket API endpoints
POLYMARKET_API_BASE = "https://clob.polymarket.com"
GAMMA_API_BASE = "https://gamma-api.polymarket.com"


class PolymarketService:
    """Service for interacting with Polymarket APIs."""

    def __init__(self):
        self.clob_client = httpx.AsyncClient(
            base_url=POLYMARKET_API_BASE,
            timeout=30.0,
            headers={"Accept": "application/json"},
        )
        self.gamma_client = httpx.AsyncClient(
            base_url=GAMMA_API_BASE,
            timeout=30.0,
            headers={"Accept": "application/json"},
        )

    async def close(self):
        await self.clob_client.aclose()
        await self.gamma_client.aclose()

    async def get_markets(
        self,
        limit: int = 100,
        offset: int = 0,
        active_only: bool = True,
    ) -> List[Dict[str, Any]]:
        """Fetch markets from Polymarket Gamma API."""
        try:
            params = {
                "limit": limit,
                "offset": offset,
                "closed": "false" if active_only else None,
            }
            params = {k: v for k, v in params.items() if v is not None}

            response = await self.gamma_client.get("/markets", params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching Polymarket markets: {e}")
            return []

    async def get_market(self, market_id: str) -> Optional[Dict[str, Any]]:
        """Fetch single market details."""
        try:
            response = await self.gamma_client.get(f"/markets/{market_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching Polymarket market {market_id}: {e}")
            return None

    async def get_market_prices(self, token_id: str) -> Optional[Dict[str, Any]]:
        """Get current prices from CLOB API."""
        try:
            response = await self.clob_client.get(f"/price", params={"token_id": token_id})
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching prices for {token_id}: {e}")
            return None

    async def get_orderbook(self, token_id: str) -> Optional[Dict[str, Any]]:
        """Get orderbook for a token."""
        try:
            response = await self.clob_client.get(f"/book", params={"token_id": token_id})
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching orderbook for {token_id}: {e}")
            return None

    def parse_market(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """Parse raw Polymarket data into our Market schema."""
        # Extract outcomes and probabilities
        outcomes = raw.get("outcomes", [])
        outcome_prices = raw.get("outcomePrices", [])

        price_yes = 0.5
        price_no = 0.5
        if outcome_prices and len(outcome_prices) >= 2:
            try:
                price_yes = float(outcome_prices[0])
                price_no = float(outcome_prices[1])
            except (ValueError, IndexError):
                pass

        # Determine status
        status = MarketStatus.OPEN
        if raw.get("closed", False):
            status = MarketStatus.CLOSED
        if raw.get("resolved", False):
            status = MarketStatus.RESOLVED

        # Parse volume
        volume = 0
        try:
            volume = float(raw.get("volume", 0) or 0)
        except (ValueError, TypeError):
            pass

        volume_24h = 0
        try:
            volume_24h = float(raw.get("volume24hr", 0) or 0)
        except (ValueError, TypeError):
            pass

        # Parse liquidity as proxy for open interest
        liquidity = 0
        try:
            liquidity = float(raw.get("liquidity", 0) or 0)
        except (ValueError, TypeError):
            pass

        # Calculate 24h change
        change_24h = 0
        try:
            spread = float(raw.get("spread", 0) or 0)
            change_24h = spread * 100 if spread else 0
        except (ValueError, TypeError):
            pass

        # Parse end date
        end_date = None
        if raw.get("endDate"):
            try:
                end_date = datetime.fromisoformat(raw["endDate"].replace("Z", "+00:00"))
            except (ValueError, TypeError):
                pass

        return {
            "id": f"poly_{raw.get('id', '')}",
            "platform": Platform.POLYMARKET.value,
            "title": raw.get("question", raw.get("title", "Unknown")),
            "description": raw.get("description", ""),
            "category": raw.get("category", "Other"),
            "status": status.value,
            "probability": price_yes,
            "open_interest": liquidity,
            "volume_24h": volume_24h,
            "volume_total": volume,
            "price_yes": price_yes,
            "price_no": price_no,
            "end_date": end_date,
            "change_24h": change_24h,
            "image_url": raw.get("image"),
            "outcomes": outcomes,
            "resolution_source": raw.get("resolutionSource"),
        }

    async def fetch_and_parse_markets(
        self,
        limit: int = 100,
        offset: int = 0,
        active_only: bool = True,
    ) -> List[Dict[str, Any]]:
        """Fetch and parse markets into our format."""
        raw_markets = await self.get_markets(limit, offset, active_only)
        return [self.parse_market(m) for m in raw_markets]


# Singleton instance
_polymarket_service: Optional[PolymarketService] = None


def get_polymarket_service() -> PolymarketService:
    global _polymarket_service
    if _polymarket_service is None:
        _polymarket_service = PolymarketService()
    return _polymarket_service


async def close_polymarket_service():
    global _polymarket_service
    if _polymarket_service:
        await _polymarket_service.close()
        _polymarket_service = None
