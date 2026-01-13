from cachetools import TTLCache
from typing import Any, Optional, Callable
from functools import wraps
import asyncio
from datetime import datetime

# Cache configurations
MARKET_CACHE_TTL = 60  # 1 minute
HISTORY_CACHE_TTL = 300  # 5 minutes
STATS_CACHE_TTL = 30  # 30 seconds


class AsyncCache:
    """Async-compatible cache with TTL support."""

    def __init__(self, maxsize: int = 1000, ttl: int = 60):
        self._cache = TTLCache(maxsize=maxsize, ttl=ttl)
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            return self._cache.get(key)

    async def set(self, key: str, value: Any) -> None:
        async with self._lock:
            self._cache[key] = value

    async def delete(self, key: str) -> None:
        async with self._lock:
            self._cache.pop(key, None)

    async def clear(self) -> None:
        async with self._lock:
            self._cache.clear()

    def __contains__(self, key: str) -> bool:
        return key in self._cache


# Global cache instances
market_cache = AsyncCache(maxsize=5000, ttl=MARKET_CACHE_TTL)
history_cache = AsyncCache(maxsize=1000, ttl=HISTORY_CACHE_TTL)
stats_cache = AsyncCache(maxsize=100, ttl=STATS_CACHE_TTL)


def cached(cache_instance: AsyncCache, key_func: Optional[Callable] = None):
    """Decorator for caching async function results."""

    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"

            # Try to get from cache
            cached_value = await cache_instance.get(cache_key)
            if cached_value is not None:
                return cached_value

            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_instance.set(cache_key, result)
            return result

        return wrapper

    return decorator


class CacheStats:
    """Track cache hit/miss statistics."""

    def __init__(self):
        self.hits = 0
        self.misses = 0
        self.start_time = datetime.utcnow()

    @property
    def hit_rate(self) -> float:
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0

    def record_hit(self):
        self.hits += 1

    def record_miss(self):
        self.misses += 1

    def to_dict(self) -> dict:
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": f"{self.hit_rate:.2%}",
            "uptime_seconds": (datetime.utcnow() - self.start_time).total_seconds(),
        }


cache_stats = CacheStats()
