# OddsRadar

A real-time prediction market radar dashboard for visualizing odds, open interest, volume, smart trader holdings, and probability data from Polymarket and Kalshi.

## Features

- **Interactive 3D Globe** - Rotate, zoom, and explore market data on a beautiful globe visualization
- **Multi-Layer Data** - Toggle between Open Interest, Volume, Smart Traders, and Probability views
- **Real-time Updates** - Live data streaming via WebSocket
- **Market Analytics** - Track trending markets, top OI, and top volume
- **Smart Trader Tracking** - Monitor whale positions and win rates
- **Watchlist** - Save and track your favorite markets
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- react-three-fiber + drei (3D Globe)
- Recharts (Charts)
- Zustand (State Management)

### Backend
- Python FastAPI
- PostgreSQL + SQLAlchemy
- WebSocket support
- Polymarket & Kalshi API integration

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (optional, works without for demo)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the API server
python -m uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
poly99/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── routers/             # API routes
│   ├── services/            # Business logic
│   ├── database/            # DB models & CRUD
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Next.js pages
│   ├── components/          # React components
│   │   ├── globe/           # 3D Globe
│   │   ├── charts/          # Chart components
│   │   ├── panels/          # Data panels
│   │   └── markets/         # Market list/cards
│   ├── lib/                 # Utilities
│   ├── store/               # Zustand store
│   └── types/               # TypeScript types
├── PLAN.md                  # Project plan
└── README.md
```

## API Endpoints

### Markets
- `GET /api/markets` - All markets (filterable)
- `GET /api/markets/trending` - Trending markets
- `GET /api/markets/top-oi` - Top by open interest
- `GET /api/markets/top-volume` - Top by volume
- `GET /api/markets/stats` - Global statistics
- `GET /api/markets/{id}` - Market details

### Platforms
- `GET /api/polymarket/markets` - Polymarket only
- `GET /api/kalshi/markets` - Kalshi only

### Smart Traders
- `GET /api/smart-traders` - Trader leaderboard
- `GET /api/smart-traders/{id}` - Trader details

### User (Watchlist/Notifications)
- `GET /api/users/{id}/watchlist` - Get watchlist
- `POST /api/users/{id}/watchlist/add` - Add to watchlist
- `GET /api/users/{id}/notifications` - Get notifications

### WebSocket
- `WS /ws/markets` - Real-time market updates

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Backend
DATABASE_URL=postgresql://localhost/poly99

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/markets
```

## Design

The UI follows a **Dark Mode Neo-Futuristic Dashboard** style with:

| Element | Color |
|---------|-------|
| Background | #0A0D18 |
| Secondary BG | #151A2C |
| Text | #E0E6F0 |
| Bullish/OI | #50FA7B |
| Bearish | #FF5555 |
| Volume | #8BE9FD |
| Smart Traders | #BD93F9 |
| Highlight | #FFCB6B |

## License

MIT

---

Built with Claude Code
