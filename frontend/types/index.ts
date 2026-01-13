export type Platform = "polymarket" | "kalshi";
export type MarketStatus = "open" | "closed" | "resolved";
export type NotificationType = "oi_spike" | "volume_spike" | "probability_change" | "price_alert";
export type PositionSide = "yes" | "no";
export type DataLayer = "oi" | "volume" | "smart_traders" | "probability";

export interface Location {
  lat: number;
  lng: number;
}

export interface Position {
  market_id: string;
  side: PositionSide;
  size: number;
  value: number;
  entry_price: number;
}

export interface Market {
  id: string;
  platform: Platform;
  title: string;
  description?: string;
  category: string;
  status: MarketStatus;
  probability: number;
  open_interest: number;
  volume_24h: number;
  volume_total: number;
  price_yes: number;
  price_no: number;
  end_date?: string;
  location?: Location;
  change_24h: number;
  image_url?: string;
}

export interface MarketSummary {
  id: string;
  platform: Platform;
  title: string;
  category: string;
  probability: number;
  open_interest: number;
  volume_24h: number;
  change_24h: number;
  status: MarketStatus;
}

export interface SmartTrader {
  id: string;
  address: string;
  total_value: number;
  positions: Position[];
  pnl: number;
  win_rate: number;
  trade_count: number;
}

export interface SmartTraderSummary {
  id: string;
  address: string;
  total_value: number;
  pnl: number;
  win_rate: number;
}

export interface MarketHistoryEntry {
  id?: string;
  market_id: string;
  timestamp: string;
  open_interest: number;
  volume: number;
  price_yes: number;
  price_no: number;
  probability: number;
}

export interface Watchlist {
  id: string;
  user_id: string;
  market_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  market_id: string;
  type: NotificationType;
  threshold: number;
  is_active: boolean;
  created_at: string;
}

export interface GlobalStats {
  total_markets: number;
  total_open_interest: number;
  total_volume_24h: number;
  active_markets: number;
  polymarket_count: number;
  kalshi_count: number;
  updated_at: string;
}

export interface MarketsResponse {
  markets: Market[];
  total: number;
  page: number;
  per_page: number;
}

export interface TrendingMarketsResponse {
  markets: MarketSummary[];
  updated_at: string;
}

export interface TopMarketsResponse {
  markets: MarketSummary[];
  metric: "open_interest" | "volume";
  updated_at: string;
}

// Globe data types
export interface GlobeMarkerData {
  id: string;
  lat: number;
  lng: number;
  value: number;
  color: string;
  title: string;
  platform: Platform;
}

// WebSocket message types
export interface WSMessage {
  type: "market_update" | "stats_update" | "trending_update" | "alert" | "error" | "connected" | "pong";
  data?: any;
  timestamp: string;
}

// Chart data types
export interface ChartDataPoint {
  time: string;
  value: number;
}
