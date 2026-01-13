from sqlalchemy import Column, String, Float, DateTime, Boolean, Integer, Enum, JSON, ForeignKey, Index
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from database.connection import Base


def generate_uuid():
    return str(uuid.uuid4())


class MarketDB(Base):
    __tablename__ = "markets"

    id = Column(String, primary_key=True)
    platform = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    category = Column(String, index=True)
    status = Column(String, default="open", index=True)
    probability = Column(Float, default=0.5)
    open_interest = Column(Float, default=0)
    volume_24h = Column(Float, default=0)
    volume_total = Column(Float, default=0)
    price_yes = Column(Float, default=0.5)
    price_no = Column(Float, default=0.5)
    end_date = Column(DateTime)
    location_lat = Column(Float)
    location_lng = Column(Float)
    change_24h = Column(Float, default=0)
    image_url = Column(String)
    outcomes = Column(JSON)
    resolution_source = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    history = relationship("MarketHistoryDB", back_populates="market", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_markets_platform_status", "platform", "status"),
        Index("ix_markets_open_interest", "open_interest"),
        Index("ix_markets_volume_24h", "volume_24h"),
    )


class MarketHistoryDB(Base):
    __tablename__ = "market_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    market_id = Column(String, ForeignKey("markets.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    open_interest = Column(Float, default=0)
    volume = Column(Float, default=0)
    price_yes = Column(Float, default=0.5)
    price_no = Column(Float, default=0.5)
    probability = Column(Float, default=0.5)

    # Relationships
    market = relationship("MarketDB", back_populates="history")

    __table_args__ = (
        Index("ix_market_history_market_timestamp", "market_id", "timestamp"),
    )


class SmartTraderDB(Base):
    __tablename__ = "smart_traders"

    id = Column(String, primary_key=True, default=generate_uuid)
    address = Column(String, unique=True, nullable=False, index=True)
    total_value = Column(Float, default=0)
    pnl = Column(Float, default=0)
    win_rate = Column(Float, default=0)
    trade_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    positions = relationship("SmartTraderPositionDB", back_populates="trader", cascade="all, delete-orphan")
    position_history = relationship("SmartTraderPositionHistoryDB", back_populates="trader", cascade="all, delete-orphan")


class SmartTraderPositionDB(Base):
    __tablename__ = "smart_trader_positions"

    id = Column(String, primary_key=True, default=generate_uuid)
    trader_id = Column(String, ForeignKey("smart_traders.id"), nullable=False, index=True)
    market_id = Column(String, ForeignKey("markets.id"), nullable=False, index=True)
    side = Column(String, nullable=False)
    size = Column(Float, default=0)
    value = Column(Float, default=0)
    entry_price = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    trader = relationship("SmartTraderDB", back_populates="positions")


class SmartTraderPositionHistoryDB(Base):
    __tablename__ = "smart_trader_position_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    smart_trader_id = Column(String, ForeignKey("smart_traders.id"), nullable=False, index=True)
    market_id = Column(String, ForeignKey("markets.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    position_size = Column(Float, default=0)
    position_value = Column(Float, default=0)
    side = Column(String, nullable=False)

    # Relationships
    trader = relationship("SmartTraderDB", back_populates="position_history")

    __table_args__ = (
        Index("ix_position_history_trader_timestamp", "smart_trader_id", "timestamp"),
    )


class WatchlistDB(Base):
    __tablename__ = "watchlists"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False, index=True)
    market_ids = Column(ARRAY(String), default=[])
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("ix_watchlists_user_id", "user_id"),
    )


class NotificationDB(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False, index=True)
    market_id = Column(String, ForeignKey("markets.id"), nullable=False, index=True)
    type = Column(String, nullable=False)
    threshold = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_notifications_user_active", "user_id", "is_active"),
    )
