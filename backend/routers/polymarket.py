from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from datetime import datetime

from services.polymarket_service import get_polymarket_service
from models.schemas import Market, MarketSummary, MarketsResponse

router = APIRouter(prefix="/api/polymarket", tags=["Polymarket"])


@router.get("/markets", response_model=MarketsResponse)
async def get_polymarket_markets(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    active_only: bool = Query(True, description="Only show active markets"),
):
    """Get markets from Polymarket."""
    service = get_polymarket_service()

    offset = (page - 1) * per_page
    markets = await service.fetch_and_parse_markets(
        limit=per_page,
        offset=offset,
        active_only=active_only,
    )

    return MarketsResponse(
        markets=[Market(**m) for m in markets],
        total=len(markets),  # This is an approximation
        page=page,
        per_page=per_page,
    )


@router.get("/markets/{market_id}", response_model=Market)
async def get_polymarket_market(market_id: str):
    """Get a specific Polymarket market."""
    service = get_polymarket_service()

    # Remove prefix if present
    original_id = market_id.replace("poly_", "")
    raw = await service.get_market(original_id)

    if not raw:
        raise HTTPException(status_code=404, detail="Market not found")

    market = service.parse_market(raw)
    return Market(**market)


@router.get("/markets/{market_id}/orderbook")
async def get_polymarket_orderbook(market_id: str):
    """Get orderbook for a Polymarket market."""
    service = get_polymarket_service()

    # This would need the token_id, not market_id
    # For now, return a placeholder
    return {
        "market_id": market_id,
        "bids": [],
        "asks": [],
        "message": "Orderbook requires token_id. Use market details to get token info.",
    }
