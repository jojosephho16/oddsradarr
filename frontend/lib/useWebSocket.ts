"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useStore } from "@/store/useStore";
import { WSMessage } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/markets";

export function useMarketWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { setGlobalStats, setTrendingMarkets } = useStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("[WebSocket] Connected to market updates");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);

          switch (message.type) {
            case "connected":
              console.log("[WebSocket] Server confirmed connection");
              break;

            case "stats_update":
              if (message.data) {
                setGlobalStats(message.data);
              }
              break;

            case "trending_update":
              if (message.data && Array.isArray(message.data)) {
                setTrendingMarkets(message.data);
              }
              break;

            case "market_update":
              // Individual market updates can be handled here
              console.log("[WebSocket] Market update:", message.data?.id);
              break;

            case "pong":
              // Keep-alive response
              break;

            default:
              console.log("[WebSocket] Unknown message type:", message.type);
          }
        } catch (err) {
          console.error("[WebSocket] Failed to parse message:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
      };

      ws.onclose = (event) => {
        console.log("[WebSocket] Disconnected, code:", event.code);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect after 5 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connect();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("[WebSocket] Connection failed:", err);
    }
  }, [setGlobalStats, setTrendingMarkets]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const sendPing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "ping" }));
    }
  }, []);

  const subscribeToMarket = useCallback((marketId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "subscribe", market_id: marketId }));
    }
  }, []);

  const unsubscribeFromMarket = useCallback((marketId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "unsubscribe", market_id: marketId }));
    }
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    // Set up keep-alive ping every 25 seconds
    const pingInterval = setInterval(sendPing, 25000);

    return () => {
      clearInterval(pingInterval);
      disconnect();
    };
  }, [connect, disconnect, sendPing]);

  return {
    isConnected,
    subscribeToMarket,
    unsubscribeFromMarket,
    reconnect: connect,
  };
}
