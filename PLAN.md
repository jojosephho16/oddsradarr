# OpenInterest Orbit - Project Plan

## Project Overview

**OpenInterest Orbit (OI & Volume Orbiter)** - A stunning 3D orbiter UI dashboard that visualizes open interest, volume, smart traders OI holdings, and probabilities for prediction markets on Polymarket and Kalshi.

Inspired by Vinfotech event data feed visualization.

---

## UI/UX Design (Based on Gemini Recommendations)

### Visual Style: Dark Mode Neo-Futuristic Dashboard

- **Dark Mode**: Enhances contrast, makes 3D elements pop, reduces eye strain
- **Neo-Futuristic**: Clean lines, subtle glows, transparency, geometric elements
- **Dashboard-centric**: Clear structure for presenting diverse data types

### Color Scheme

| Element | Color | Hex Code |
|---------|-------|----------|
| Primary Background | Deep Midnight Blue | `#0A0D18` |
| Secondary Background | Dark Slate Blue | `#151A2C` |
| Primary Text | Off-White | `#E0E6F0` |
| Accent 1 - Bullish OI | Electric Green | `#50FA7B` |
| Accent 2 - Bearish OI | Vivid Red | `#FF5555` |
| Accent 3 - Volume | Cyan Blue | `#8BE9FD` |
| Accent 4 - Smart Traders | Soft Violet | `#BD93F9` |
| Highlight/Interactive | Warm Yellow | `#FFCB6B` |

### Layout & Navigation

**Hybrid Sidebar + Top Bar with Central Globe Focus**

```
┌──────────────────────────────────────────────────────────────┐
│  Logo    [Global Search]    [Status: Live]    [Settings]     │  ← Top Bar
├────────┬─────────────────────────────────────────────────────┤
│        │                                                      │
│  Nav   │                   3D GLOBE                          │
│        │                 (Central Focus)                      │
│ ────── │                                                      │
│ Market │     ┌─────────┐              ┌─────────┐            │
│ Filters│     │ OI Panel│              │Vol Panel│            │
│        │     └─────────┘              └─────────┘            │
│        │                                                      │
│        │  ┌──────────────────────────────────────────────┐   │
│        │  │          Market List / Charts                 │   │
│        │  └──────────────────────────────────────────────┘   │
└────────┴─────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **3D Graphics**: react-three-fiber + @react-three/drei
- **Charts**: Recharts
- **Icons**: Lucide React
- **Real-time**: WebSocket / Server-Sent Events
- **State Management**: Zustand

### Backend
- **Framework**: Python FastAPI
- **Database**: PostgreSQL + SQLAlchemy ORM (for historical data persistence)
- **Data Sources**: Polymarket API, Kalshi API
- **Caching**: In-memory cache for API responses (Redis-ready for scaling)
- **Real-time**: WebSocket support

---

## File Structure

```
poly99/
├── backend/
│   ├── main.py                 # FastAPI app entry
│   ├── routers/
│   │   ├── polymarket.py       # Polymarket endpoints
│   │   ├── kalshi.py           # Kalshi endpoints
│   │   └── markets.py          # Combined market data
│   ├── services/
│   │   ├── polymarket_service.py
│   │   ├── kalshi_service.py
│   │   └── data_aggregator.py
│   ├── models/
│   │   └── schemas.py          # Pydantic models
│   ├── database/
│   │   ├── models.py           # SQLAlchemy ORM models
│   │   ├── crud.py             # CRUD operations
│   │   └── connection.py       # Database connection setup
│   ├── utils/
│   │   └── cache.py            # Caching utilities
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard (main globe)
│   │   ├── markets/
│   │   │   └── page.tsx        # Markets list
│   │   ├── market/[id]/
│   │   │   └── page.tsx        # Market detail
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── Layout.tsx
│   │   ├── globe/
│   │   │   ├── OrbitGlobe.tsx      # Main 3D globe
│   │   │   ├── GlobeMarker.tsx     # Data markers
│   │   │   ├── GlobeControls.tsx   # Layer toggles
│   │   │   └── DataLayer.tsx       # Data overlays
│   │   ├── charts/
│   │   │   ├── OIChart.tsx
│   │   │   ├── VolumeChart.tsx
│   │   │   └── ProbabilityChart.tsx
│   │   ├── panels/
│   │   │   ├── OIPanel.tsx
│   │   │   ├── VolumePanel.tsx
│   │   │   ├── SmartTradersPanel.tsx
│   │   │   └── MarketDetailPanel.tsx
│   │   ├── markets/
│   │   │   ├── MarketList.tsx
│   │   │   ├── MarketCard.tsx
│   │   │   └── MarketFilters.tsx
│   │   └── ui/                 # shadcn components
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   ├── websocket.ts        # WebSocket client
│   │   └── utils.ts
│   ├── store/
│   │   └── useStore.ts         # Zustand store
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── tailwind.config.ts
│   └── package.json
├── .env.example
├── .gitignore
├── PLAN.md
└── README.md
```

---

## API Endpoints

### Backend API (FastAPI)

#### Polymarket
- `GET /api/polymarket/markets` - List all markets
- `GET /api/polymarket/markets/{id}` - Market details
- `GET /api/polymarket/markets/{id}/oi` - Open interest data
- `GET /api/polymarket/markets/{id}/volume` - Volume data

#### Kalshi
- `GET /api/kalshi/markets` - List all markets
- `GET /api/kalshi/markets/{id}` - Market details
- `GET /api/kalshi/markets/{id}/oi` - Open interest data
- `GET /api/kalshi/markets/{id}/volume` - Volume data

#### Combined
- `GET /api/markets` - All markets from both platforms
- `GET /api/markets/trending` - Trending markets
- `GET /api/markets/top-oi` - Top by open interest
- `GET /api/markets/top-volume` - Top by volume
- `GET /api/smart-traders` - Smart trader positions

#### WebSocket
- `WS /ws/markets` - Real-time market updates

---

## Pages & Components

### 1. Dashboard (Main Page)
**Route: `/`**

- Central 3D Globe visualization
- Layer toggles (OI, Volume, Smart Traders, Probabilities)
- Real-time data panels
- Trending markets sidebar
- Quick stats cards

### 2. Markets Page
**Route: `/markets`**

- Full market list table
- Advanced filters (platform, category, status)
- Sorting by OI, Volume, Change %
- Card/Table view toggle

### 3. Market Detail Page
**Route: `/market/[id]`**

- Detailed charts (OI history, Volume history, Price)
- Probability distribution
- Smart trader holdings
- Related markets
- News/Events

---

## Key Features

### Core Features
1. **Interactive 3D Globe** - Rotatable, zoomable with data markers
2. **Multi-Layer Visualization** - Toggle OI/Volume/Smart Traders/Probabilities
3. **Real-time Data Streaming** - Live updates via WebSocket
4. **Historical Data Charts** - Time series for OI, Volume, Price
5. **Market Filtering** - By platform, category, status
6. **Market Detail View** - Comprehensive single market analysis
7. **Smart Trader Analytics** - Track whale positions
8. **Probability Globe** - Regional probability heatmaps
9. **Global Search** - Quick market lookup
10. **Responsive Design** - Desktop-first, mobile-friendly
11. **Watchlist Management** - Users can save and monitor favorite markets
12. **In-App Notifications** - Real-time alerts for market changes (OI spikes, volume thresholds, probability shifts)

### Animation & Interactions
- Smooth globe rotation (drag + auto-idle)
- Snap-to-region on click
- Pulsing markers for high activity
- Crossfade layer transitions
- Orbiting particle effects
- Hover tooltips
- Slide-in detail panels

---

## Data Models

### Market
```typescript
interface Market {
  id: string;
  platform: 'polymarket' | 'kalshi';
  title: string;
  description: string;
  category: string;
  status: 'open' | 'closed' | 'resolved';
  probability: number;
  openInterest: number;
  volume24h: number;
  volumeTotal: number;
  priceYes: number;
  priceNo: number;
  endDate: string;
  location?: { lat: number; lng: number };
  change24h: number;
}
```

### SmartTrader
```typescript
interface SmartTrader {
  id: string;
  address: string;
  totalValue: number;
  positions: Position[];
  pnl: number;
  winRate: number;
}
```

### MarketData (Real-time)
```typescript
interface MarketData {
  marketId: string;
  openInterest: number;
  volume: number;
  probability: number;
  timestamp: number;
}
```

### MarketHistoryEntry (Database)
```typescript
interface MarketHistoryEntry {
  id: string;
  marketId: string;
  timestamp: number;
  openInterest: number;
  volume: number;
  priceYes: number;
  priceNo: number;
  probability: number;
}
```

### SmartTraderPositionHistory (Database)
```typescript
interface SmartTraderPositionHistory {
  id: string;
  smartTraderId: string;
  marketId: string;
  timestamp: number;
  positionSize: number;
  positionValue: number;
  side: 'yes' | 'no';
}
```

### Watchlist
```typescript
interface Watchlist {
  id: string;
  userId: string;
  marketIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Notification
```typescript
interface Notification {
  id: string;
  userId: string;
  marketId: string;
  type: 'oi_spike' | 'volume_spike' | 'probability_change' | 'price_alert';
  threshold: number;
  isActive: boolean;
  createdAt: string;
}
```

---

## Development Timeline

### Phase 1: Planning ✓
- [x] UI/UX Design consultation with Gemini
- [x] Create detailed plan

### Phase 2: Backend Development
- [ ] Setup FastAPI project
- [ ] Setup PostgreSQL database and SQLAlchemy ORM
- [ ] Implement data persistence for historical market data
- [ ] Implement Polymarket API integration (with data ingestion to DB)
- [ ] Implement Kalshi API integration (with data ingestion to DB)
- [ ] Create combined market endpoints (leveraging historical DB data)
- [ ] Implement watchlist and notification endpoints
- [ ] Add WebSocket support for real-time data
- [ ] Add caching layer

### Phase 3: Frontend Development
- [ ] Setup Next.js project with Tailwind + shadcn
- [ ] Build layout (Sidebar, TopBar)
- [ ] Implement 3D Globe with react-three-fiber
- [ ] Create data panels (OI, Volume, Smart Traders)
- [ ] Build charts with Recharts (fetching historical data from backend DB)
- [ ] Implement market list/filters
- [ ] Add real-time updates
- [ ] Create market detail page
- [ ] Implement Watchlist UI and integration
- [ ] Develop in-app notification display system

### Phase 4: Integration
- [ ] Connect frontend to backend API
- [ ] Implement WebSocket connection
- [ ] Test all features
- [ ] Optimize performance

### Phase 5: Testing & Review
- [ ] Browser testing all pages
- [ ] Gemini review (target 9/10+)
- [ ] Fix issues and add suggested features

### Phase 6: Documentation
- [ ] Security audit
- [ ] Create README
- [ ] Environment setup guide

---

## Security Considerations

1. No hardcoded API keys
2. Environment variables for all secrets
3. CORS configuration
4. Rate limiting on API
5. Input validation
6. XSS prevention

---

## Performance Optimizations

1. **3D Globe**
   - InstancedMesh for multiple markers
   - Level-of-detail for distant objects
   - Efficient shader usage

2. **Data Loading**
   - API response caching
   - Pagination for large lists
   - Debounced search

3. **Real-time**
   - Efficient WebSocket message handling
   - Throttled updates

---

*Plan created: 2026-01-13*
*Version: 1.0*
