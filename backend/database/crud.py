from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, timedelta

from database.models import (
    MarketDB,
    MarketHistoryDB,
    SmartTraderDB,
    SmartTraderPositionDB,
    SmartTraderPositionHistoryDB,
    WatchlistDB,
    NotificationDB,
)
from models.schemas import (
    Market,
    MarketSummary,
    MarketHistoryEntry,
    SmartTrader,
    SmartTraderPositionHistory,
    Watchlist,
    Notification,
    Platform,
    MarketStatus,
)


# Market CRUD
async def get_market(db: AsyncSession, market_id: str) -> Optional[MarketDB]:
    result = await db.execute(select(MarketDB).where(MarketDB.id == market_id))
    return result.scalar_one_or_none()


async def get_markets(
    db: AsyncSession,
    platform: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> List[MarketDB]:
    query = select(MarketDB)

    if platform:
        query = query.where(MarketDB.platform == platform)
    if category:
        query = query.where(MarketDB.category == category)
    if status:
        query = query.where(MarketDB.status == status)

    query = query.offset(skip).limit(limit).order_by(desc(MarketDB.volume_24h))
    result = await db.execute(query)
    return result.scalars().all()


async def get_markets_count(
    db: AsyncSession,
    platform: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
) -> int:
    query = select(func.count(MarketDB.id))

    if platform:
        query = query.where(MarketDB.platform == platform)
    if category:
        query = query.where(MarketDB.category == category)
    if status:
        query = query.where(MarketDB.status == status)

    result = await db.execute(query)
    return result.scalar()


async def get_top_markets_by_oi(db: AsyncSession, limit: int = 10) -> List[MarketDB]:
    query = (
        select(MarketDB)
        .where(MarketDB.status == "open")
        .order_by(desc(MarketDB.open_interest))
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


async def get_top_markets_by_volume(db: AsyncSession, limit: int = 10) -> List[MarketDB]:
    query = (
        select(MarketDB)
        .where(MarketDB.status == "open")
        .order_by(desc(MarketDB.volume_24h))
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


async def get_trending_markets(db: AsyncSession, limit: int = 10) -> List[MarketDB]:
    query = (
        select(MarketDB)
        .where(MarketDB.status == "open")
        .order_by(desc(MarketDB.change_24h))
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


async def upsert_market(db: AsyncSession, market_data: dict) -> MarketDB:
    existing = await get_market(db, market_data["id"])

    if existing:
        for key, value in market_data.items():
            if hasattr(existing, key) and value is not None:
                setattr(existing, key, value)
        existing.updated_at = datetime.utcnow()
    else:
        existing = MarketDB(**market_data)
        db.add(existing)

    await db.commit()
    await db.refresh(existing)
    return existing


async def search_markets(db: AsyncSession, query: str, limit: int = 20) -> List[MarketDB]:
    search_query = (
        select(MarketDB)
        .where(
            or_(
                MarketDB.title.ilike(f"%{query}%"),
                MarketDB.description.ilike(f"%{query}%"),
                MarketDB.category.ilike(f"%{query}%"),
            )
        )
        .limit(limit)
    )
    result = await db.execute(search_query)
    return result.scalars().all()


# Market History CRUD
async def add_market_history(db: AsyncSession, history_data: dict) -> MarketHistoryDB:
    history = MarketHistoryDB(**history_data)
    db.add(history)
    await db.commit()
    await db.refresh(history)
    return history


async def get_market_history(
    db: AsyncSession,
    market_id: str,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 100,
) -> List[MarketHistoryDB]:
    query = select(MarketHistoryDB).where(MarketHistoryDB.market_id == market_id)

    if start_time:
        query = query.where(MarketHistoryDB.timestamp >= start_time)
    if end_time:
        query = query.where(MarketHistoryDB.timestamp <= end_time)

    query = query.order_by(desc(MarketHistoryDB.timestamp)).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


# Smart Trader CRUD
async def get_smart_trader(db: AsyncSession, trader_id: str) -> Optional[SmartTraderDB]:
    result = await db.execute(
        select(SmartTraderDB)
        .options(selectinload(SmartTraderDB.positions))
        .where(SmartTraderDB.id == trader_id)
    )
    return result.scalar_one_or_none()


async def get_smart_traders(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
) -> List[SmartTraderDB]:
    query = (
        select(SmartTraderDB)
        .options(selectinload(SmartTraderDB.positions))
        .order_by(desc(SmartTraderDB.total_value))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


async def upsert_smart_trader(db: AsyncSession, trader_data: dict) -> SmartTraderDB:
    result = await db.execute(
        select(SmartTraderDB).where(SmartTraderDB.address == trader_data.get("address"))
    )
    existing = result.scalar_one_or_none()

    if existing:
        for key, value in trader_data.items():
            if hasattr(existing, key) and value is not None:
                setattr(existing, key, value)
        existing.updated_at = datetime.utcnow()
    else:
        existing = SmartTraderDB(**trader_data)
        db.add(existing)

    await db.commit()
    await db.refresh(existing)
    return existing


# Watchlist CRUD
async def get_watchlist(db: AsyncSession, user_id: str) -> Optional[WatchlistDB]:
    result = await db.execute(
        select(WatchlistDB).where(WatchlistDB.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def create_or_update_watchlist(
    db: AsyncSession,
    user_id: str,
    market_ids: List[str],
) -> WatchlistDB:
    watchlist = await get_watchlist(db, user_id)

    if watchlist:
        watchlist.market_ids = market_ids
        watchlist.updated_at = datetime.utcnow()
    else:
        watchlist = WatchlistDB(user_id=user_id, market_ids=market_ids)
        db.add(watchlist)

    await db.commit()
    await db.refresh(watchlist)
    return watchlist


async def add_to_watchlist(db: AsyncSession, user_id: str, market_id: str) -> WatchlistDB:
    watchlist = await get_watchlist(db, user_id)

    if watchlist:
        if market_id not in watchlist.market_ids:
            watchlist.market_ids = watchlist.market_ids + [market_id]
            watchlist.updated_at = datetime.utcnow()
    else:
        watchlist = WatchlistDB(user_id=user_id, market_ids=[market_id])
        db.add(watchlist)

    await db.commit()
    await db.refresh(watchlist)
    return watchlist


async def remove_from_watchlist(db: AsyncSession, user_id: str, market_id: str) -> Optional[WatchlistDB]:
    watchlist = await get_watchlist(db, user_id)

    if watchlist and market_id in watchlist.market_ids:
        watchlist.market_ids = [m for m in watchlist.market_ids if m != market_id]
        watchlist.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(watchlist)

    return watchlist


# Notification CRUD
async def get_notifications(
    db: AsyncSession,
    user_id: str,
    active_only: bool = True,
) -> List[NotificationDB]:
    query = select(NotificationDB).where(NotificationDB.user_id == user_id)

    if active_only:
        query = query.where(NotificationDB.is_active == True)

    result = await db.execute(query)
    return result.scalars().all()


async def create_notification(
    db: AsyncSession,
    user_id: str,
    market_id: str,
    notification_type: str,
    threshold: float,
) -> NotificationDB:
    notification = NotificationDB(
        user_id=user_id,
        market_id=market_id,
        type=notification_type,
        threshold=threshold,
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


async def update_notification_status(
    db: AsyncSession,
    notification_id: str,
    is_active: bool,
) -> Optional[NotificationDB]:
    result = await db.execute(
        select(NotificationDB).where(NotificationDB.id == notification_id)
    )
    notification = result.scalar_one_or_none()

    if notification:
        notification.is_active = is_active
        await db.commit()
        await db.refresh(notification)

    return notification


async def delete_notification(db: AsyncSession, notification_id: str) -> bool:
    result = await db.execute(
        select(NotificationDB).where(NotificationDB.id == notification_id)
    )
    notification = result.scalar_one_or_none()

    if notification:
        await db.delete(notification)
        await db.commit()
        return True

    return False


# Global Stats
async def get_global_stats(db: AsyncSession) -> dict:
    # Get counts
    total_markets = await db.execute(select(func.count(MarketDB.id)))
    active_markets = await db.execute(
        select(func.count(MarketDB.id)).where(MarketDB.status == "open")
    )
    polymarket_count = await db.execute(
        select(func.count(MarketDB.id)).where(MarketDB.platform == "polymarket")
    )
    kalshi_count = await db.execute(
        select(func.count(MarketDB.id)).where(MarketDB.platform == "kalshi")
    )

    # Get totals
    total_oi = await db.execute(select(func.sum(MarketDB.open_interest)))
    total_volume = await db.execute(select(func.sum(MarketDB.volume_24h)))

    return {
        "total_markets": total_markets.scalar() or 0,
        "active_markets": active_markets.scalar() or 0,
        "polymarket_count": polymarket_count.scalar() or 0,
        "kalshi_count": kalshi_count.scalar() or 0,
        "total_open_interest": total_oi.scalar() or 0,
        "total_volume_24h": total_volume.scalar() or 0,
        "updated_at": datetime.utcnow(),
    }
