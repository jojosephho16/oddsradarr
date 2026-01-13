import { create } from "zustand";
import {
  Market,
  MarketSummary,
  GlobalStats,
  SmartTraderSummary,
  DataLayer,
  Watchlist,
} from "@/types";

interface AppState {
  // Markets data
  markets: Market[];
  trendingMarkets: MarketSummary[];
  topOIMarkets: MarketSummary[];
  topVolumeMarkets: MarketSummary[];
  selectedMarket: Market | null;
  globalStats: GlobalStats | null;

  // Smart traders
  smartTraders: SmartTraderSummary[];

  // Watchlist
  watchlist: Watchlist | null;

  // UI state
  activeLayer: DataLayer;
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  searchQuery: string;
  selectedPlatform: string | null;
  selectedCategory: string | null;

  // Globe state
  globeAutoRotate: boolean;
  globeZoom: number;

  // Actions
  setMarkets: (markets: Market[]) => void;
  setTrendingMarkets: (markets: MarketSummary[]) => void;
  setTopOIMarkets: (markets: MarketSummary[]) => void;
  setTopVolumeMarkets: (markets: MarketSummary[]) => void;
  setSelectedMarket: (market: Market | null) => void;
  setGlobalStats: (stats: GlobalStats) => void;
  setSmartTraders: (traders: SmartTraderSummary[]) => void;
  setWatchlist: (watchlist: Watchlist | null) => void;
  setActiveLayer: (layer: DataLayer) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedPlatform: (platform: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  setGlobeAutoRotate: (rotate: boolean) => void;
  setGlobeZoom: (zoom: number) => void;

  // Helpers
  isInWatchlist: (marketId: string) => boolean;
  toggleWatchlist: (marketId: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  markets: [],
  trendingMarkets: [],
  topOIMarkets: [],
  topVolumeMarkets: [],
  selectedMarket: null,
  globalStats: null,
  smartTraders: [],
  watchlist: null,
  activeLayer: "oi",
  isLoading: false,
  error: null,
  sidebarOpen: true,
  searchQuery: "",
  selectedPlatform: null,
  selectedCategory: null,
  globeAutoRotate: true,
  globeZoom: 1,

  // Actions
  setMarkets: (markets) => set({ markets }),
  setTrendingMarkets: (trendingMarkets) => set({ trendingMarkets }),
  setTopOIMarkets: (topOIMarkets) => set({ topOIMarkets }),
  setTopVolumeMarkets: (topVolumeMarkets) => set({ topVolumeMarkets }),
  setSelectedMarket: (selectedMarket) => set({ selectedMarket }),
  setGlobalStats: (globalStats) => set({ globalStats }),
  setSmartTraders: (smartTraders) => set({ smartTraders }),
  setWatchlist: (watchlist) => set({ watchlist }),
  setActiveLayer: (activeLayer) => set({ activeLayer }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedPlatform: (selectedPlatform) => set({ selectedPlatform }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setGlobeAutoRotate: (globeAutoRotate) => set({ globeAutoRotate }),
  setGlobeZoom: (globeZoom) => set({ globeZoom }),

  // Helpers
  isInWatchlist: (marketId) => {
    const { watchlist } = get();
    return watchlist?.market_ids?.includes(marketId) ?? false;
  },

  toggleWatchlist: (marketId) => {
    const { watchlist, isInWatchlist } = get();
    if (!watchlist) return;

    if (isInWatchlist(marketId)) {
      set({
        watchlist: {
          ...watchlist,
          market_ids: watchlist.market_ids.filter((id) => id !== marketId),
        },
      });
    } else {
      set({
        watchlist: {
          ...watchlist,
          market_ids: [...watchlist.market_ids, marketId],
        },
      });
    }
  },
}));
