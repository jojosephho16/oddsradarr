from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database import crud
from models.schemas import SmartTrader, SmartTraderSummary

router = APIRouter(prefix="/api/smart-traders", tags=["Smart Traders"])


# Mock smart trader data for demonstration
# In production, this would come from on-chain analysis
MOCK_SMART_TRADERS = [
    {
        "id": "st_001",
        "address": "0x7a16ff8270133f063aab6c9977183d9e72835428",
        "total_value": 2450000,
        "pnl": 185000,
        "win_rate": 0.72,
        "trade_count": 156,
        "positions": [
            {"market_id": "poly_election2024", "side": "yes", "size": 50000, "value": 85000, "entry_price": 0.58},
            {"market_id": "kalshi_fed_rate", "side": "no", "size": 25000, "value": 32000, "entry_price": 0.78},
        ],
    },
    {
        "id": "st_002",
        "address": "0x2b591e99afe9f32eaa6214f7b7629768c40eeb39",
        "total_value": 1850000,
        "pnl": 320000,
        "win_rate": 0.68,
        "trade_count": 234,
        "positions": [
            {"market_id": "poly_btc_100k", "side": "yes", "size": 75000, "value": 95000, "entry_price": 0.45},
        ],
    },
    {
        "id": "st_003",
        "address": "0x9bf4001d307dfd62b26a2f1307ee0c0307632d59",
        "total_value": 980000,
        "pnl": -45000,
        "win_rate": 0.51,
        "trade_count": 89,
        "positions": [],
    },
    {
        "id": "st_004",
        "address": "0xb8901acb165ed027e32754e0ffe830802919727f",
        "total_value": 3200000,
        "pnl": 890000,
        "win_rate": 0.81,
        "trade_count": 412,
        "positions": [
            {"market_id": "poly_ai_regulation", "side": "no", "size": 100000, "value": 145000, "entry_price": 0.32},
            {"market_id": "kalshi_inflation", "side": "yes", "size": 80000, "value": 92000, "entry_price": 0.65},
        ],
    },
    {
        "id": "st_005",
        "address": "0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c",
        "total_value": 750000,
        "pnl": 125000,
        "win_rate": 0.65,
        "trade_count": 178,
        "positions": [
            {"market_id": "poly_superbowl", "side": "yes", "size": 30000, "value": 42000, "entry_price": 0.55},
        ],
    },
]


@router.get("", response_model=List[SmartTraderSummary])
async def get_smart_traders(
    skip: int = Query(0, ge=0, description="Number of traders to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of traders to return"),
    sort_by: str = Query("total_value", description="Sort by field (total_value, pnl, win_rate)"),
):
    """Get list of smart traders."""
    traders = MOCK_SMART_TRADERS.copy()

    # Sort
    if sort_by == "pnl":
        traders.sort(key=lambda x: x["pnl"], reverse=True)
    elif sort_by == "win_rate":
        traders.sort(key=lambda x: x["win_rate"], reverse=True)
    else:
        traders.sort(key=lambda x: x["total_value"], reverse=True)

    # Paginate
    paginated = traders[skip : skip + limit]

    return [
        SmartTraderSummary(
            id=t["id"],
            address=t["address"],
            total_value=t["total_value"],
            pnl=t["pnl"],
            win_rate=t["win_rate"],
        )
        for t in paginated
    ]


@router.get("/{trader_id}", response_model=SmartTrader)
async def get_smart_trader(trader_id: str):
    """Get a specific smart trader's details."""
    trader = next((t for t in MOCK_SMART_TRADERS if t["id"] == trader_id), None)

    if not trader:
        raise HTTPException(status_code=404, detail="Smart trader not found")

    return SmartTrader(**trader)


@router.get("/{trader_id}/positions")
async def get_smart_trader_positions(trader_id: str):
    """Get a smart trader's current positions."""
    trader = next((t for t in MOCK_SMART_TRADERS if t["id"] == trader_id), None)

    if not trader:
        raise HTTPException(status_code=404, detail="Smart trader not found")

    return {
        "trader_id": trader_id,
        "positions": trader["positions"],
        "total_position_value": sum(p["value"] for p in trader["positions"]),
    }


@router.get("/market/{market_id}/holders")
async def get_market_smart_holders(market_id: str):
    """Get smart traders holding positions in a specific market."""
    holders = []

    for trader in MOCK_SMART_TRADERS:
        for position in trader["positions"]:
            if position["market_id"] == market_id:
                holders.append({
                    "trader_id": trader["id"],
                    "address": trader["address"],
                    "position": position,
                    "win_rate": trader["win_rate"],
                })

    return {
        "market_id": market_id,
        "smart_holders": holders,
        "total_smart_value": sum(h["position"]["value"] for h in holders),
    }


@router.get("/stats/summary")
async def get_smart_traders_summary():
    """Get overall smart trader statistics."""
    total_value = sum(t["total_value"] for t in MOCK_SMART_TRADERS)
    total_pnl = sum(t["pnl"] for t in MOCK_SMART_TRADERS)
    avg_win_rate = sum(t["win_rate"] for t in MOCK_SMART_TRADERS) / len(MOCK_SMART_TRADERS)

    return {
        "total_traders": len(MOCK_SMART_TRADERS),
        "total_value": total_value,
        "total_pnl": total_pnl,
        "average_win_rate": avg_win_rate,
        "top_performer": max(MOCK_SMART_TRADERS, key=lambda x: x["pnl"])["id"],
        "updated_at": datetime.utcnow().isoformat(),
    }
