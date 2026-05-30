import os
from dataclasses import dataclass
from typing import Dict, Final, Literal, Optional

from services.polymarket_config import POLYMARKET_COLLATERAL_ASSET


REAL_TRADING_ENV_KEY: Final[str] = "REAL_TRADING_ENABLED"
REAL_TRADING_DEFAULT_ENABLED: Final[bool] = False
TRADING_MODE: Final[str] = "read-only-noop"
DEFAULT_BUILDER_CODE: Final[Optional[str]] = None

TradingSide = Literal["BUY", "SELL"]


@dataclass(frozen=True)
class NoopTradeRequest:
    token_id: str
    side: TradingSide
    amount_pusd: float
    price: float
    builder_code: Optional[str] = None
    idempotency_key: Optional[str] = None


class RealTradingDisabledError(RuntimeError):
    code = "real_trading_disabled"

    def __init__(self) -> None:
        super().__init__(
            "Real trading is disabled. Set REAL_TRADING_ENABLED only after replacing the no-op order path."
        )


def parse_real_trading_flag(value: Optional[str]) -> bool:
    if value is None:
        return REAL_TRADING_DEFAULT_ENABLED
    return value.strip().lower() == "true"


def get_trading_runtime_config() -> Dict[str, object]:
    return {
        "real_trading_enabled": parse_real_trading_flag(os.environ.get(REAL_TRADING_ENV_KEY)),
        "mode": TRADING_MODE,
        "collateral_asset": POLYMARKET_COLLATERAL_ASSET,
        "builder_code": DEFAULT_BUILDER_CODE,
    }


async def post_real_order_noop(_request: NoopTradeRequest) -> None:
    raise RealTradingDisabledError()
