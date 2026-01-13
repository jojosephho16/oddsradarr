from routers.markets import router as markets_router
from routers.polymarket import router as polymarket_router
from routers.kalshi import router as kalshi_router
from routers.users import router as users_router
from routers.smart_traders import router as smart_traders_router
from routers.websocket import router as websocket_router

__all__ = [
    "markets_router",
    "polymarket_router",
    "kalshi_router",
    "users_router",
    "smart_traders_router",
    "websocket_router",
]
