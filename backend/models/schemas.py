from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


class Platform(str, Enum):
    POLYMARKET = "polymarket"
    KALSHI = "kalshi"


class MarketStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    RESOLVED = "resolved"


class NotificationType(str, Enum):
    OI_SPIKE = "oi_spike"
    VOLUME_SPIKE = "volume_spike"
    PROBABILITY_CHANGE = "probability_change"
    PRICE_ALERT = "price_alert"


class PositionSide(str, Enum):
    YES = "yes"
    NO = "no"


# Base Models
class Location(BaseModel):
    lat: float
    lng: float


class Position(BaseModel):
    market_id: str
    side: PositionSide
    size: float
    value: float
    entry_price: float


# Market Models
class MarketBase(BaseModel):
    id: str
    platform: Platform
    title: str
    description: Optional[str] = None
    category: str
    status: MarketStatus = MarketStatus.OPEN


class Market(MarketBase):
    probability: float = Field(ge=0, le=1)
    open_interest: float = 0
    volume_24h: float = 0
    volume_total: float = 0
    price_yes: float = Field(ge=0, le=1)
    price_no: float = Field(ge=0, le=1)
    end_date: Optional[datetime] = None
    location: Optional[Location] = None
    change_24h: float = 0
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class MarketSummary(BaseModel):
    id: str
    platform: Platform
    title: str
    category: str
    probability: float
    open_interest: float
    volume_24h: float
    change_24h: float
    status: MarketStatus


class MarketDetail(Market):
    outcomes: Optional[List[str]] = None
    resolution_source: Optional[str] = None
    created_at: Optional[datetime] = None


# Smart Trader Models
class SmartTrader(BaseModel):
    id: str
    address: str
    total_value: float
    positions: List[Position] = []
    pnl: float = 0
    win_rate: float = Field(ge=0, le=1, default=0)
    trade_count: int = 0


class SmartTraderSummary(BaseModel):
    id: str
    address: str
    total_value: float
    pnl: float
    win_rate: float


# Real-time Data Models
class MarketData(BaseModel):
    market_id: str
    open_interest: float
    volume: float
    probability: float
    price_yes: float
    price_no: float
    timestamp: datetime


class MarketHistoryEntry(BaseModel):
    id: Optional[str] = None
    market_id: str
    timestamp: datetime
    open_interest: float
    volume: float
    price_yes: float
    price_no: float
    probability: float

    class Config:
        from_attributes = True


class SmartTraderPositionHistory(BaseModel):
    id: Optional[str] = None
    smart_trader_id: str
    market_id: str
    timestamp: datetime
    position_size: float
    position_value: float
    side: PositionSide

    class Config:
        from_attributes = True


# Watchlist Models
class WatchlistCreate(BaseModel):
    market_ids: List[str] = []


class Watchlist(BaseModel):
    id: str
    user_id: str
    market_ids: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WatchlistAddMarket(BaseModel):
    market_id: str


# Notification Models
class NotificationCreate(BaseModel):
    market_id: str
    type: NotificationType
    threshold: float


class Notification(BaseModel):
    id: str
    user_id: str
    market_id: str
    type: NotificationType
    threshold: float
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True


# Response Models
class MarketsResponse(BaseModel):
    markets: List[Market]
    total: int
    page: int = 1
    per_page: int = 50


class TrendingMarketsResponse(BaseModel):
    markets: List[MarketSummary]
    updated_at: datetime


class TopMarketsResponse(BaseModel):
    markets: List[MarketSummary]
    metric: Literal["open_interest", "volume"]
    updated_at: datetime


class HistoryResponse(BaseModel):
    market_id: str
    data: List[MarketHistoryEntry]
    timeframe: str


# WebSocket Messages
class WSMessage(BaseModel):
    type: Literal["market_update", "alert", "error"]
    data: dict
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Stats Models
class GlobalStats(BaseModel):
    total_markets: int
    total_open_interest: float
    total_volume_24h: float
    active_markets: int
    polymarket_count: int
    kalshi_count: int
    updated_at: datetime
