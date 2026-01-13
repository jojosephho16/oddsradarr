from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from datetime import datetime

from services.kalshi_service import get_kalshi_service
from models.schemas import Market, MarketSummary, MarketsResponse

router = APIRouter(prefix="/api/kalshi", tags=["Kalshi"])


@router.get("/markets", response_model=MarketsResponse)
async def get_kalshi_markets(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    status: str = Query("open", description="Market status (open, closed, settled)"),
):
    """Get markets from Kalshi."""
    service = get_kalshi_service()

    markets = await service.fetch_and_parse_markets(
        limit=per_page,
        status=status,
    )

    return MarketsResponse(
        markets=[Market(**m) for m in markets],
        total=len(markets),
        page=page,
        per_page=per_page,
    )


@router.get("/markets/{ticker}", response_model=Market)
async def get_kalshi_market(ticker: str):
    """Get a specific Kalshi market by ticker."""
    service = get_kalshi_service()

    # Remove prefix if present
    original_ticker = ticker.replace("kalshi_", "")
    raw = await service.get_market(original_ticker)

    if not raw:
        raise HTTPException(status_code=404, detail="Market not found")

    market = service.parse_market(raw)
    return Market(**market)


@router.get("/markets/{ticker}/history")
async def get_kalshi_market_history(
    ticker: str,
    limit: int = Query(100, ge=1, le=500, description="Number of history entries"),
):
    """Get historical data for a Kalshi market."""
    service = get_kalshi_service()

    original_ticker = ticker.replace("kalshi_", "")
    history = await service.get_market_history(original_ticker, limit=limit)

    return {
        "ticker": ticker,
        "history": history,
        "count": len(history),
    }


@router.get("/markets/{ticker}/orderbook")
async def get_kalshi_orderbook(ticker: str):
    """Get orderbook for a Kalshi market."""
    service = get_kalshi_service()

    original_ticker = ticker.replace("kalshi_", "")
    orderbook = await service.get_market_orderbook(original_ticker)

    if not orderbook:
        return {
            "ticker": ticker,
            "bids": [],
            "asks": [],
        }

    return orderbook
