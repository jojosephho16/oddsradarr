import httpx
import pytest

from models.schemas import CollateralAsset
from services.polymarket_config import (
    POLYMARKET_CLOB_HOST,
    POLYMARKET_COLLATERAL_ASSET,
    POLYMARKET_DATA_HOST,
    POLYMARKET_GAMMA_HOST,
    is_allowed_read_endpoint,
    normalize_query,
    resolve_host,
)
from services.polymarket_service import PolymarketService
from services.trading_config import (
    REAL_TRADING_ENV_KEY,
    NoopTradeRequest,
    RealTradingDisabledError,
    get_trading_runtime_config,
    parse_real_trading_flag,
    post_real_order_noop,
)


class TimeoutClient:
    async def get(self, *_args, **_kwargs):
        raise httpx.TimeoutException("timed out")


def test_public_v2_hosts_are_used():
    assert resolve_host("markets") == POLYMARKET_GAMMA_HOST
    assert resolve_host("trades") == POLYMARKET_DATA_HOST
    assert resolve_host("book") == POLYMARKET_CLOB_HOST
    assert resolve_host("price") == POLYMARKET_CLOB_HOST


def test_read_only_allow_list_blocks_trading_and_auth():
    assert is_allowed_read_endpoint("markets/1")
    assert is_allowed_read_endpoint("prices-history")
    assert not is_allowed_read_endpoint("order")
    assert not is_allowed_read_endpoint("orders")
    assert not is_allowed_read_endpoint("auth/api-key")


def test_prices_history_uses_market_query_parameter():
    params = normalize_query("prices-history", {"token_id": "token-1"})

    assert params["market"] == "token-1"
    assert "token_id" not in params


def test_polymarket_market_parse_sets_pusd_collateral():
    service = PolymarketService()
    parsed = service.parse_market({
        "id": "123",
        "question": "Will it rain?",
        "outcomePrices": ["0.43", "0.57"],
        "volume": "1200",
        "volume24hr": "300",
        "liquidity": "5000",
    })

    assert POLYMARKET_COLLATERAL_ASSET == "pUSD"
    assert CollateralAsset.PUSD.value == "pUSD"
    assert parsed["collateral_asset"] == "pUSD"
    assert parsed["price_yes"] == 0.43
    assert parsed["open_interest"] == 5000


@pytest.mark.asyncio
async def test_polymarket_price_timeout_returns_none():
    service = PolymarketService()
    await service.close()
    service.clob_client = TimeoutClient()

    assert await service.get_market_prices("token-1") is None


def test_real_trading_defaults_disabled(monkeypatch):
    monkeypatch.delenv(REAL_TRADING_ENV_KEY, raising=False)

    assert parse_real_trading_flag(None) is False
    assert get_trading_runtime_config() == {
        "real_trading_enabled": False,
        "mode": "read-only-noop",
        "collateral_asset": "pUSD",
        "builder_code": None,
    }


@pytest.mark.asyncio
async def test_noop_order_path_always_raises():
    request = NoopTradeRequest(
        token_id="token-1",
        side="BUY",
        amount_pusd=10,
        price=0.42,
        idempotency_key="intent-1",
    )

    with pytest.raises(RealTradingDisabledError):
        await post_real_order_noop(request)
