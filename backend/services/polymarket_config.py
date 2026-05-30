from typing import Any, Dict, Final, Set


POLYMARKET_GAMMA_HOST: Final[str] = "https://gamma-api.polymarket.com"
POLYMARKET_DATA_HOST: Final[str] = "https://data-api.polymarket.com"
POLYMARKET_CLOB_HOST: Final[str] = "https://clob.polymarket.com"

POLYMARKET_COLLATERAL_ASSET: Final[str] = "pUSD"
POLYMARKET_REQUEST_TIMEOUT_SECONDS: Final[float] = 30.0

GAMMA_ENDPOINTS: Final[Set[str]] = {"events", "markets", "public-search"}
DATA_ENDPOINTS: Final[Set[str]] = {"trades", "positions", "closed-positions"}
CLOB_READ_ENDPOINTS: Final[Set[str]] = {
    "book",
    "price",
    "prices",
    "prices-history",
    "midpoint",
    "midpoints",
    "spread",
    "last-trade-price",
    "tick-size",
    "fee-rate",
    "markets-by-token",
}

READ_ONLY_ENDPOINTS: Final[Set[str]] = GAMMA_ENDPOINTS | DATA_ENDPOINTS | CLOB_READ_ENDPOINTS


def normalize_endpoint(endpoint: str) -> str:
    return endpoint.strip().lstrip("/")


def endpoint_root(endpoint: str) -> str:
    return normalize_endpoint(endpoint).split("/", maxsplit=1)[0]


def is_allowed_read_endpoint(endpoint: str) -> bool:
    normalized = normalize_endpoint(endpoint).lower()
    if not normalized or ".." in normalized or "\\" in normalized or "%2e" in normalized or "%2f" in normalized:
        return False
    return endpoint_root(normalized) in READ_ONLY_ENDPOINTS


def resolve_host(endpoint: str) -> str:
    root = endpoint_root(endpoint)
    if root in GAMMA_ENDPOINTS:
        return POLYMARKET_GAMMA_HOST
    if root in DATA_ENDPOINTS:
        return POLYMARKET_DATA_HOST
    if root in CLOB_READ_ENDPOINTS:
        return POLYMARKET_CLOB_HOST
    raise ValueError(f"Unsupported Polymarket endpoint: {endpoint}")


def normalize_query(endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
    normalized = dict(params)
    if endpoint_root(endpoint) == "prices-history" and "token_id" in normalized and "market" not in normalized:
        normalized["market"] = normalized.pop("token_id")
    return normalized
