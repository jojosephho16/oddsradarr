from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from routers import (
    markets_router,
    polymarket_router,
    kalshi_router,
    users_router,
    smart_traders_router,
    websocket_router,
)
from services.polymarket_service import close_polymarket_service
from services.kalshi_service import close_kalshi_service
from database.connection import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    # Startup
    print("Starting OddsRadar API...")

    # Initialize database (if DATABASE_URL is set)
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        try:
            await init_db()
            print("Database initialized")
        except Exception as e:
            print(f"Database initialization skipped: {e}")

    yield

    # Shutdown
    print("Shutting down...")
    await close_polymarket_service()
    await close_kalshi_service()
    await close_db()


app = FastAPI(
    title="OddsRadar API",
    description="Real-time prediction market data API from Polymarket and Kalshi",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(markets_router)
app.include_router(polymarket_router)
app.include_router(kalshi_router)
app.include_router(users_router)
app.include_router(smart_traders_router)
app.include_router(websocket_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "OddsRadar API",
        "version": "1.0.0",
        "description": "Real-time prediction market data API",
        "endpoints": {
            "markets": "/api/markets",
            "polymarket": "/api/polymarket/markets",
            "kalshi": "/api/kalshi/markets",
            "smart_traders": "/api/smart-traders",
            "websocket": "/ws/markets",
            "docs": "/docs",
        },
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "oddsradar-api",
    }


@app.get("/api")
async def api_info():
    """API information endpoint."""
    return {
        "version": "1.0.0",
        "endpoints": [
            {
                "path": "/api/markets",
                "methods": ["GET"],
                "description": "Get all markets from both platforms",
            },
            {
                "path": "/api/markets/trending",
                "methods": ["GET"],
                "description": "Get trending markets",
            },
            {
                "path": "/api/markets/top-oi",
                "methods": ["GET"],
                "description": "Get top markets by open interest",
            },
            {
                "path": "/api/markets/top-volume",
                "methods": ["GET"],
                "description": "Get top markets by volume",
            },
            {
                "path": "/api/markets/stats",
                "methods": ["GET"],
                "description": "Get global market statistics",
            },
            {
                "path": "/api/markets/{market_id}",
                "methods": ["GET"],
                "description": "Get specific market details",
            },
            {
                "path": "/api/polymarket/markets",
                "methods": ["GET"],
                "description": "Get Polymarket markets only",
            },
            {
                "path": "/api/kalshi/markets",
                "methods": ["GET"],
                "description": "Get Kalshi markets only",
            },
            {
                "path": "/api/smart-traders",
                "methods": ["GET"],
                "description": "Get smart trader data",
            },
            {
                "path": "/api/users/{user_id}/watchlist",
                "methods": ["GET", "POST"],
                "description": "Manage user watchlist",
            },
            {
                "path": "/api/users/{user_id}/notifications",
                "methods": ["GET", "POST"],
                "description": "Manage user notifications",
            },
            {
                "path": "/ws/markets",
                "methods": ["WebSocket"],
                "description": "Real-time market updates",
            },
        ],
    }
