from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict, Set
import asyncio
import json
from datetime import datetime

from services.data_aggregator import get_data_aggregator

router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    """Manage WebSocket connections."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.subscriptions: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        # Remove from all subscriptions
        for market_id in list(self.subscriptions.keys()):
            self.subscriptions[market_id].discard(websocket)
            if not self.subscriptions[market_id]:
                del self.subscriptions[market_id]

    def subscribe(self, websocket: WebSocket, market_id: str):
        if market_id not in self.subscriptions:
            self.subscriptions[market_id] = set()
        self.subscriptions[market_id].add(websocket)

    def unsubscribe(self, websocket: WebSocket, market_id: str):
        if market_id in self.subscriptions:
            self.subscriptions[market_id].discard(websocket)

    async def send_personal(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_json(message)
        except Exception:
            pass

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

    async def broadcast_to_market(self, market_id: str, message: dict):
        if market_id in self.subscriptions:
            for connection in self.subscriptions[market_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass


manager = ConnectionManager()


@router.websocket("/ws/markets")
async def websocket_markets(websocket: WebSocket):
    """WebSocket endpoint for real-time market updates."""
    await manager.connect(websocket)

    try:
        # Send initial connection confirmation
        await manager.send_personal(websocket, {
            "type": "connected",
            "message": "Connected to market updates",
            "timestamp": datetime.utcnow().isoformat(),
        })

        # Start background task to send periodic updates
        update_task = asyncio.create_task(
            send_periodic_updates(websocket)
        )

        while True:
            try:
                # Receive messages from client
                data = await websocket.receive_json()
                await handle_client_message(websocket, data)
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await manager.send_personal(websocket, {
                    "type": "error",
                    "message": "Invalid JSON",
                })

    except WebSocketDisconnect:
        pass
    finally:
        update_task.cancel()
        manager.disconnect(websocket)


async def handle_client_message(websocket: WebSocket, data: dict):
    """Handle incoming WebSocket messages."""
    msg_type = data.get("type")

    if msg_type == "subscribe":
        market_id = data.get("market_id")
        if market_id:
            manager.subscribe(websocket, market_id)
            await manager.send_personal(websocket, {
                "type": "subscribed",
                "market_id": market_id,
                "timestamp": datetime.utcnow().isoformat(),
            })

    elif msg_type == "unsubscribe":
        market_id = data.get("market_id")
        if market_id:
            manager.unsubscribe(websocket, market_id)
            await manager.send_personal(websocket, {
                "type": "unsubscribed",
                "market_id": market_id,
                "timestamp": datetime.utcnow().isoformat(),
            })

    elif msg_type == "ping":
        await manager.send_personal(websocket, {
            "type": "pong",
            "timestamp": datetime.utcnow().isoformat(),
        })


async def send_periodic_updates(websocket: WebSocket):
    """Send periodic market updates to connected client."""
    aggregator = get_data_aggregator()

    while True:
        try:
            await asyncio.sleep(30)  # Update every 30 seconds

            # Get fresh stats
            stats = await aggregator.get_global_stats()

            await manager.send_personal(websocket, {
                "type": "stats_update",
                "data": stats,
                "timestamp": datetime.utcnow().isoformat(),
            })

            # Get trending markets
            trending = await aggregator.get_trending_markets(limit=5)

            await manager.send_personal(websocket, {
                "type": "trending_update",
                "data": [
                    {
                        "id": m["id"],
                        "title": m["title"],
                        "probability": m["probability"],
                        "change_24h": m["change_24h"],
                    }
                    for m in trending
                ],
                "timestamp": datetime.utcnow().isoformat(),
            })

        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error in periodic updates: {e}")
            await asyncio.sleep(10)


# Function to broadcast market updates (called by data ingestion)
async def broadcast_market_update(market_id: str, data: dict):
    """Broadcast a market update to all subscribers."""
    message = {
        "type": "market_update",
        "market_id": market_id,
        "data": data,
        "timestamp": datetime.utcnow().isoformat(),
    }

    # Broadcast to market-specific subscribers
    await manager.broadcast_to_market(market_id, message)

    # Also broadcast to general connection for trending/stats updates
    await manager.broadcast(message)
