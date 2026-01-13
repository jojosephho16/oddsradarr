import {
  Market,
  MarketSummary,
  MarketsResponse,
  TrendingMarketsResponse,
  TopMarketsResponse,
  GlobalStats,
  SmartTrader,
  SmartTraderSummary,
  Watchlist,
  Notification,
  MarketHistoryEntry,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Markets API
export async function getMarkets(params?: {
  platform?: string;
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<MarketsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.platform) searchParams.set("platform", params.platform);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.per_page) searchParams.set("per_page", params.per_page.toString());

  const query = searchParams.toString();
  return fetchApi<MarketsResponse>(`/api/markets${query ? `?${query}` : ""}`);
}

export async function getMarket(marketId: string): Promise<Market> {
  return fetchApi<Market>(`/api/markets/${marketId}`);
}

export async function getTrendingMarkets(limit = 10): Promise<TrendingMarketsResponse> {
  return fetchApi<TrendingMarketsResponse>(`/api/markets/trending?limit=${limit}`);
}

export async function getTopOIMarkets(limit = 10): Promise<TopMarketsResponse> {
  return fetchApi<TopMarketsResponse>(`/api/markets/top-oi?limit=${limit}`);
}

export async function getTopVolumeMarkets(limit = 10): Promise<TopMarketsResponse> {
  return fetchApi<TopMarketsResponse>(`/api/markets/top-volume?limit=${limit}`);
}

export async function getGlobalStats(): Promise<GlobalStats> {
  return fetchApi<GlobalStats>("/api/markets/stats");
}

export async function getCategories(): Promise<{ categories: string[] }> {
  return fetchApi<{ categories: string[] }>("/api/markets/categories");
}

export async function getMarketHistory(
  marketId: string,
  timeframe = "24h"
): Promise<{ market_id: string; data: MarketHistoryEntry[]; timeframe: string }> {
  return fetchApi(`/api/markets/${marketId}/history?timeframe=${timeframe}`);
}

// Smart Traders API
export async function getSmartTraders(params?: {
  skip?: number;
  limit?: number;
  sort_by?: string;
}): Promise<SmartTraderSummary[]> {
  const searchParams = new URLSearchParams();
  if (params?.skip) searchParams.set("skip", params.skip.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.sort_by) searchParams.set("sort_by", params.sort_by);

  const query = searchParams.toString();
  return fetchApi<SmartTraderSummary[]>(`/api/smart-traders${query ? `?${query}` : ""}`);
}

export async function getSmartTrader(traderId: string): Promise<SmartTrader> {
  return fetchApi<SmartTrader>(`/api/smart-traders/${traderId}`);
}

export async function getSmartTradersSummary(): Promise<any> {
  return fetchApi("/api/smart-traders/stats/summary");
}

// User API (Watchlist & Notifications)
const DEFAULT_USER_ID = "user_default";

export async function getWatchlist(userId = DEFAULT_USER_ID): Promise<Watchlist> {
  return fetchApi<Watchlist>(`/api/users/${userId}/watchlist`);
}

export async function addToWatchlist(marketId: string, userId = DEFAULT_USER_ID): Promise<Watchlist> {
  return fetchApi<Watchlist>(`/api/users/${userId}/watchlist/add`, {
    method: "POST",
    body: JSON.stringify({ market_id: marketId }),
  });
}

export async function removeFromWatchlist(marketId: string, userId = DEFAULT_USER_ID): Promise<Watchlist> {
  return fetchApi<Watchlist>(`/api/users/${userId}/watchlist/${marketId}`, {
    method: "DELETE",
  });
}

export async function getNotifications(userId = DEFAULT_USER_ID): Promise<Notification[]> {
  return fetchApi<Notification[]>(`/api/users/${userId}/notifications`);
}

export async function createNotification(
  data: { market_id: string; type: string; threshold: number },
  userId = DEFAULT_USER_ID
): Promise<Notification> {
  return fetchApi<Notification>(`/api/users/${userId}/notifications`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// WebSocket connection
export function createWebSocket(onMessage: (data: any) => void): WebSocket | null {
  if (typeof window === "undefined") return null;

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/markets";
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error("WebSocket message parse error:", e);
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("WebSocket disconnected");
  };

  return ws;
}
