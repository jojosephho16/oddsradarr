from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database import crud
from models.schemas import (
    Watchlist,
    WatchlistCreate,
    WatchlistAddMarket,
    Notification,
    NotificationCreate,
)

router = APIRouter(prefix="/api/users", tags=["Users"])


# For simplicity, we'll use a placeholder user_id
# In production, this would come from authentication
DEFAULT_USER_ID = "user_default"


@router.get("/{user_id}/watchlist", response_model=Watchlist)
async def get_user_watchlist(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get user's watchlist."""
    watchlist = await crud.get_watchlist(db, user_id)

    if not watchlist:
        # Return empty watchlist
        return Watchlist(
            id="",
            user_id=user_id,
            market_ids=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

    return Watchlist(
        id=watchlist.id,
        user_id=watchlist.user_id,
        market_ids=watchlist.market_ids or [],
        created_at=watchlist.created_at,
        updated_at=watchlist.updated_at,
    )


@router.post("/{user_id}/watchlist", response_model=Watchlist)
async def update_user_watchlist(
    user_id: str,
    data: WatchlistCreate,
    db: AsyncSession = Depends(get_db),
):
    """Update user's entire watchlist."""
    watchlist = await crud.create_or_update_watchlist(db, user_id, data.market_ids)

    return Watchlist(
        id=watchlist.id,
        user_id=watchlist.user_id,
        market_ids=watchlist.market_ids or [],
        created_at=watchlist.created_at,
        updated_at=watchlist.updated_at,
    )


@router.post("/{user_id}/watchlist/add", response_model=Watchlist)
async def add_to_watchlist(
    user_id: str,
    data: WatchlistAddMarket,
    db: AsyncSession = Depends(get_db),
):
    """Add a market to user's watchlist."""
    watchlist = await crud.add_to_watchlist(db, user_id, data.market_id)

    return Watchlist(
        id=watchlist.id,
        user_id=watchlist.user_id,
        market_ids=watchlist.market_ids or [],
        created_at=watchlist.created_at,
        updated_at=watchlist.updated_at,
    )


@router.delete("/{user_id}/watchlist/{market_id}", response_model=Watchlist)
async def remove_from_watchlist(
    user_id: str,
    market_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Remove a market from user's watchlist."""
    watchlist = await crud.remove_from_watchlist(db, user_id, market_id)

    if not watchlist:
        return Watchlist(
            id="",
            user_id=user_id,
            market_ids=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

    return Watchlist(
        id=watchlist.id,
        user_id=watchlist.user_id,
        market_ids=watchlist.market_ids or [],
        created_at=watchlist.created_at,
        updated_at=watchlist.updated_at,
    )


@router.get("/{user_id}/notifications", response_model=List[Notification])
async def get_user_notifications(
    user_id: str,
    active_only: bool = Query(True, description="Only return active notifications"),
    db: AsyncSession = Depends(get_db),
):
    """Get user's notifications."""
    notifications = await crud.get_notifications(db, user_id, active_only=active_only)

    return [
        Notification(
            id=n.id,
            user_id=n.user_id,
            market_id=n.market_id,
            type=n.type,
            threshold=n.threshold,
            is_active=n.is_active,
            created_at=n.created_at,
        )
        for n in notifications
    ]


@router.post("/{user_id}/notifications", response_model=Notification)
async def create_notification(
    user_id: str,
    data: NotificationCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new notification."""
    notification = await crud.create_notification(
        db,
        user_id=user_id,
        market_id=data.market_id,
        notification_type=data.type.value,
        threshold=data.threshold,
    )

    return Notification(
        id=notification.id,
        user_id=notification.user_id,
        market_id=notification.market_id,
        type=notification.type,
        threshold=notification.threshold,
        is_active=notification.is_active,
        created_at=notification.created_at,
    )


@router.patch("/{user_id}/notifications/{notification_id}")
async def toggle_notification(
    user_id: str,
    notification_id: str,
    is_active: bool = Query(..., description="Enable or disable notification"),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable a notification."""
    notification = await crud.update_notification_status(db, notification_id, is_active)

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    return Notification(
        id=notification.id,
        user_id=notification.user_id,
        market_id=notification.market_id,
        type=notification.type,
        threshold=notification.threshold,
        is_active=notification.is_active,
        created_at=notification.created_at,
    )


@router.delete("/{user_id}/notifications/{notification_id}")
async def delete_notification(
    user_id: str,
    notification_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a notification."""
    success = await crud.delete_notification(db, notification_id)

    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"success": True, "message": "Notification deleted"}
