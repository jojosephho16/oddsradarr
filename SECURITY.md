# Security Audit Report - OddsRadar

**Audit Date:** January 2026
**Auditor:** Claude Code (Automated Security Review)
**Overall Risk Level:** Medium (Development Stage)

---

## Executive Summary

This security audit covers the OddsRadar full-stack application, a prediction market visualization dashboard built with FastAPI (backend) and Next.js (frontend). The application demonstrates strong foundational security practices but requires additional security controls before production deployment.

---

## Positive Security Findings

### 1. No Hardcoded Secrets
All sensitive configuration is handled via environment variables:
- `DATABASE_URL` for database connections
- `NEXT_PUBLIC_API_URL` for API endpoints
- `NEXT_PUBLIC_WS_URL` for WebSocket connections

### 2. Strong Input Validation
FastAPI Query constraints with proper bounds:
```python
# backend/routers/markets.py
per_page: int = Query(50, ge=1, le=100)  # Properly bounded
limit: int = Query(10, ge=1, le=50)       # Properly bounded
```

### 3. SQL Injection Prevention
SQLAlchemy ORM with parameterized queries throughout:
```python
# backend/database/crud.py - SAFE
query = select(MarketDB).where(
    MarketDB.title.ilike(f"%{query}%")  # SQLAlchemy parameterizes internally
)
```

### 4. Pydantic Data Validation
All request/response models use Pydantic schemas for type safety and validation.

### 5. Proper Error Handling
- HTTPException used consistently for API errors
- WebSocket gracefully handles JSONDecodeError
- No sensitive stack traces exposed to clients

### 6. No .env Files in Repository
Git properly configured to ignore environment files.

---

## Issues Identified

### Medium Severity

#### 1. No Authentication System
**Location:** `backend/routers/users.py:21`
**Issue:** Uses placeholder `DEFAULT_USER_ID`. Any client can access any user's data via `user_id` path parameter.

```python
# Current (insecure)
DEFAULT_USER_ID = "user_default"

@router.get("/{user_id}/watchlist")
async def get_user_watchlist(user_id: str, ...):
```

**Remediation:** Implement JWT-based authentication:
```python
# Recommended
from fastapi import Depends
from auth import get_current_user

@router.get("/me/watchlist")
async def get_user_watchlist(
    current_user: User = Depends(get_current_user),
    ...
):
```

#### 2. Missing Rate Limiting
**Location:** `backend/main.py`
**Issue:** No rate limiting on API endpoints or WebSocket connections.

**Remediation:** Add fastapi-limiter middleware:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/markets")
@limiter.limit("100/minute")
async def get_markets():
```

#### 3. Overly Permissive CORS
**Location:** `backend/main.py:59-60`

```python
# Current (too permissive for production)
allow_methods=["*"],
allow_headers=["*"],
```

**Remediation:**
```python
# Recommended
allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
allow_headers=["Content-Type", "Authorization"],
```

### Low Severity

#### 4. No WebSocket Connection Limits
**Location:** `backend/routers/websocket.py:21`
**Issue:** No maximum connection limit, potential resource exhaustion.

**Remediation:**
```python
MAX_CONNECTIONS = 1000

async def connect(self, websocket: WebSocket):
    if len(self.active_connections) >= MAX_CONNECTIONS:
        await websocket.close(code=1008)  # Policy Violation
        return
    await websocket.accept()
    self.active_connections.append(websocket)
```

#### 5. No HTTPS Enforcement
**Issue:** Application uses HTTP/WS in development. Production requires HTTPS/WSS.

**Remediation:** Deploy behind a reverse proxy (nginx, Caddy) with TLS termination:
```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8000;
    }
}
```

---

## OWASP Top 10 Assessment

| Category | Status | Notes |
|----------|--------|-------|
| A01 - Broken Access Control | Needs Work | No authentication implemented |
| A02 - Cryptographic Failures | Needs Work | HTTPS not enforced |
| A03 - Injection | Secure | SQLAlchemy ORM prevents SQL injection |
| A04 - Insecure Design | Needs Work | Missing rate limiting |
| A05 - Security Misconfiguration | Needs Work | CORS too permissive |
| A06 - Vulnerable Components | OK | Dependencies reasonably current |
| A07 - Auth Failures | Needs Work | No authentication |
| A08 - Data Integrity | OK | No issues found |
| A09 - Logging Failures | N/A | Not evaluated |
| A10 - SSRF | OK | No server-side URL fetching from user input |

---

## Remediation Priority

### Immediate (Before Production)
1. **Implement Authentication** - JWT/OAuth2 for user endpoints
2. **Enforce HTTPS** - TLS termination at reverse proxy
3. **Add Rate Limiting** - Protect against DoS

### Short-term
4. **Restrict CORS** - Limit methods and headers
5. **WebSocket Limits** - Add connection caps

### Medium-term
6. **Optimize WebSocket** - Centralize periodic updates
7. **Add Security Logging** - Monitor access patterns

---

## Dependencies

### Backend (requirements.txt)
| Package | Version | Status |
|---------|---------|--------|
| FastAPI | 0.109.2 | Current |
| SQLAlchemy | 2.0.25 | Current |
| Pydantic | 2.6.1 | Current |
| httpx | 0.27.0 | Current |

### Frontend (package.json)
| Package | Version | Status |
|---------|---------|--------|
| Next.js | 14.1.0 | Current |
| React | 18.2.0 | Current |
| Three.js | 0.160.0 | Current |

**Recommendation:** Run `npm audit` and `pip-audit` regularly to check for new vulnerabilities.

---

## Conclusion

OddsRadar demonstrates solid security fundamentals with proper input validation, SQL injection prevention, and secrets management. The primary gaps are related to production-readiness features: authentication, HTTPS enforcement, and rate limiting. These should be addressed before any production deployment.

**Current State:** Suitable for development/demo
**Production-Ready:** After implementing authentication + HTTPS + rate limiting
