from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List, Optional
from datetime import datetime

from services.data_aggregator import get_data_aggregator
from models.schemas import (
    Market,
    MarketSummary,
    MarketsResponse,
    TrendingMarketsResponse,
    TopMarketsResponse,
    GlobalStats,
    HistoryResponse,
    MarketHistoryEntry,
)

router = APIRouter(prefix="/api/markets", tags=["Markets"])


@router.get("", response_model=MarketsResponse)
async def get_markets(
    platform: Optional[str] = Query(None, description="Filter by platform (polymarket, kalshi)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status (open, closed, resolved)"),
    search: Optional[str] = Query(None, description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
):
    """Get all markets with optional filters applied at aggregation level."""
    aggregator = get_data_aggregator()

    if search:
        # Search with filters applied
        markets = await aggregator.search_markets(search, limit=per_page * page)
        # Apply additional filters if needed
        if platform:
            markets = [m for m in markets if m["platform"] == platform]
        if category:
            markets = [m for m in markets if m.get("category", "").lower() == category.lower()]
        if status:
            markets = [m for m in markets if m["status"] == status]
    else:
        # Filters are applied at aggregation level to avoid loading all data
        markets = await aggregator.fetch_all_markets(
            limit=per_page * page,
            platform=platform,
            category=category,
            status=status,
        )

    # Paginate the filtered results
    total = len(markets)
    start = (page - 1) * per_page
    end = start + per_page
    paginated = markets[start:end]

    return MarketsResponse(
        markets=[Market(**m) for m in paginated],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/trending", response_model=TrendingMarketsResponse)
async def get_trending_markets(
    limit: int = Query(10, ge=1, le=50, description="Number of markets to return"),
):
    """Get trending markets based on 24h price change."""
    aggregator = get_data_aggregator()
    markets = await aggregator.get_trending_markets(limit=limit)

    return TrendingMarketsResponse(
        markets=[
            MarketSummary(
                id=m["id"],
                platform=m["platform"],
                title=m["title"],
                category=m.get("category", "Other"),
                probability=m["probability"],
                open_interest=m["open_interest"],
                volume_24h=m["volume_24h"],
                change_24h=m["change_24h"],
                status=m["status"],
            )
            for m in markets
        ],
        updated_at=datetime.utcnow(),
    )


@router.get("/top-oi", response_model=TopMarketsResponse)
async def get_top_oi_markets(
    limit: int = Query(10, ge=1, le=50, description="Number of markets to return"),
):
    """Get top markets by open interest."""
    aggregator = get_data_aggregator()
    markets = await aggregator.get_top_by_oi(limit=limit)

    return TopMarketsResponse(
        markets=[
            MarketSummary(
                id=m["id"],
                platform=m["platform"],
                title=m["title"],
                category=m.get("category", "Other"),
                probability=m["probability"],
                open_interest=m["open_interest"],
                volume_24h=m["volume_24h"],
                change_24h=m["change_24h"],
                status=m["status"],
            )
            for m in markets
        ],
        metric="open_interest",
        updated_at=datetime.utcnow(),
    )


@router.get("/top-volume", response_model=TopMarketsResponse)
async def get_top_volume_markets(
    limit: int = Query(10, ge=1, le=50, description="Number of markets to return"),
):
    """Get top markets by 24h volume."""
    aggregator = get_data_aggregator()
    markets = await aggregator.get_top_by_volume(limit=limit)

    return TopMarketsResponse(
        markets=[
            MarketSummary(
                id=m["id"],
                platform=m["platform"],
                title=m["title"],
                category=m.get("category", "Other"),
                probability=m["probability"],
                open_interest=m["open_interest"],
                volume_24h=m["volume_24h"],
                change_24h=m["change_24h"],
                status=m["status"],
            )
            for m in markets
        ],
        metric="volume",
        updated_at=datetime.utcnow(),
    )


@router.get("/categories")
async def get_categories():
    """Get all available categories."""
    aggregator = get_data_aggregator()
    categories = await aggregator.get_categories()
    return {"categories": categories}


@router.get("/stats", response_model=GlobalStats)
async def get_global_stats():
    """Get global market statistics."""
    aggregator = get_data_aggregator()
    stats = await aggregator.get_global_stats()
    return GlobalStats(**stats)


@router.get("/{market_id}", response_model=Market)
async def get_market(market_id: str):
    """Get a specific market by ID."""
    aggregator = get_data_aggregator()
    market = await aggregator.get_market_by_id(market_id)

    if not market:
        raise HTTPException(status_code=404, detail="Market not found")

    return Market(**market)


@router.get("/{market_id}/history")
async def get_market_history(
    market_id: str,
    timeframe: str = Query("24h", description="Timeframe (1h, 24h, 7d, 30d)"),
):
    """Get historical data for a market."""
    # For now, return empty history since we're not persisting yet
    # This will be populated when we add the database ingestion
    return HistoryResponse(
        market_id=market_id,
        data=[],
        timeframe=timeframe,
    )
