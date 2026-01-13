import httpx
import os
from typing import List, Optional, Dict, Any
from datetime import datetime
import asyncio
from models.schemas import Market, MarketSummary, Platform, MarketStatus
from utils.cache import market_cache, cached

# Kalshi API endpoints
KALSHI_API_BASE = "https://api.elections.kalshi.com/trade-api/v2"
KALSHI_DEMO_API_BASE = "https://demo-api.kalshi.com/trade-api/v2"


class KalshiService:
    """Service for interacting with Kalshi API."""

    def __init__(self):
        # Use demo API if no production credentials
        base_url = os.getenv("KALSHI_API_URL", KALSHI_API_BASE)
        self.client = httpx.AsyncClient(
            base_url=base_url,
            timeout=30.0,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        )

    async def close(self):
        await self.client.aclose()

    async def get_markets(
        self,
        limit: int = 100,
        cursor: Optional[str] = None,
        status: str = "open",
    ) -> Dict[str, Any]:
        """Fetch markets from Kalshi API."""
        try:
            params = {
                "limit": limit,
                "status": status,
            }
            if cursor:
                params["cursor"] = cursor

            response = await self.client.get("/markets", params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching Kalshi markets: {e}")
            return {"markets": [], "cursor": None}

    async def get_market(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Fetch single market details by ticker."""
        try:
            response = await self.client.get(f"/markets/{ticker}")
            response.raise_for_status()
            return response.json().get("market")
        except httpx.HTTPError as e:
            print(f"Error fetching Kalshi market {ticker}: {e}")
            return None

    async def get_market_history(
        self,
        ticker: str,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Fetch market history/candlesticks."""
        try:
            response = await self.client.get(
                f"/markets/{ticker}/history",
                params={"limit": limit},
            )
            response.raise_for_status()
            return response.json().get("history", [])
        except httpx.HTTPError as e:
            print(f"Error fetching Kalshi market history {ticker}: {e}")
            return []

    async def get_market_orderbook(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Get orderbook for a market."""
        try:
            response = await self.client.get(f"/markets/{ticker}/orderbook")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching orderbook for {ticker}: {e}")
            return None

    def parse_market(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """Parse raw Kalshi data into our Market schema."""
        # Determine status
        status_map = {
            "open": MarketStatus.OPEN,
            "closed": MarketStatus.CLOSED,
            "settled": MarketStatus.RESOLVED,
        }
        status = status_map.get(raw.get("status", "open"), MarketStatus.OPEN)

        # Parse prices (Kalshi uses cents, 0-100)
        yes_price = raw.get("yes_ask", 50) / 100 if raw.get("yes_ask") else 0.5
        no_price = raw.get("no_ask", 50) / 100 if raw.get("no_ask") else 0.5

        # If no ask, use last trade price
        if yes_price == 0.5:
            last_price = raw.get("last_price", 50)
            if last_price:
                yes_price = last_price / 100
                no_price = 1 - yes_price

        # Calculate probability from yes_price
        probability = yes_price

        # Parse volume (in contracts)
        volume = raw.get("volume", 0) or 0
        volume_24h = raw.get("volume_24h", 0) or 0

        # Open interest
        open_interest = raw.get("open_interest", 0) or 0

        # Change calculation
        previous_price = raw.get("previous_yes_ask", 0)
        current_price = raw.get("yes_ask", 0)
        change_24h = 0
        if previous_price and current_price:
            change_24h = ((current_price - previous_price) / previous_price * 100) if previous_price else 0

        # Parse end date
        end_date = None
        close_time = raw.get("close_time") or raw.get("expiration_time")
        if close_time:
            try:
                end_date = datetime.fromisoformat(close_time.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                pass

        # Category from event
        category = raw.get("category", "Other")
        if not category:
            event = raw.get("event", {})
            category = event.get("category", "Other") if isinstance(event, dict) else "Other"

        return {
            "id": f"kalshi_{raw.get('ticker', '')}",
            "platform": Platform.KALSHI.value,
            "title": raw.get("title", raw.get("subtitle", "Unknown")),
            "description": raw.get("rules_primary", ""),
            "category": category,
            "status": status.value,
            "probability": probability,
            "open_interest": open_interest,
            "volume_24h": volume_24h,
            "volume_total": volume,
            "price_yes": yes_price,
            "price_no": no_price,
            "end_date": end_date,
            "change_24h": change_24h,
            "image_url": raw.get("image_url"),
            "outcomes": ["Yes", "No"],
            "resolution_source": raw.get("result_source"),
        }

    async def fetch_and_parse_markets(
        self,
        limit: int = 100,
        status: str = "open",
    ) -> List[Dict[str, Any]]:
        """Fetch and parse markets into our format."""
        result = await self.get_markets(limit=limit, status=status)
        raw_markets = result.get("markets", [])
        return [self.parse_market(m) for m in raw_markets]


# Singleton instance
_kalshi_service: Optional[KalshiService] = None


def get_kalshi_service() -> KalshiService:
    global _kalshi_service
    if _kalshi_service is None:
        _kalshi_service = KalshiService()
    return _kalshi_service


async def close_kalshi_service():
    global _kalshi_service
    if _kalshi_service:
        await _kalshi_service.close()
        _kalshi_service = None
