import { describe, expect, it } from "vitest";

import {
  isAllowedPolymarketReadEndpoint,
  normalizePolymarketQuery,
  POLYMARKET_CLOB_HOST,
  POLYMARKET_COLLATERAL_ASSET,
  POLYMARKET_DATA_HOST,
  POLYMARKET_GAMMA_HOST,
  resolvePolymarketHost,
} from "@/lib/polymarketConfig";
import { formatMarketCurrency, getPlatformCollateralAsset } from "@/lib/utils";

describe("polymarket v2 frontend config", () => {
  it("uses current public v2 hosts for read-only endpoints", () => {
    expect(resolvePolymarketHost("markets")).toBe(POLYMARKET_GAMMA_HOST);
    expect(resolvePolymarketHost("trades")).toBe(POLYMARKET_DATA_HOST);
    expect(resolvePolymarketHost("book")).toBe(POLYMARKET_CLOB_HOST);
    expect(resolvePolymarketHost("price")).toBe(POLYMARKET_CLOB_HOST);
  });

  it("blocks trading and auth endpoints", () => {
    expect(isAllowedPolymarketReadEndpoint("markets/1")).toBe(true);
    expect(isAllowedPolymarketReadEndpoint("prices-history")).toBe(true);
    expect(isAllowedPolymarketReadEndpoint("order")).toBe(false);
    expect(isAllowedPolymarketReadEndpoint("orders")).toBe(false);
    expect(isAllowedPolymarketReadEndpoint("auth/api-key")).toBe(false);
  });

  it("normalizes prices-history token_id to market", () => {
    const params = normalizePolymarketQuery("prices-history", new URLSearchParams({ token_id: "token-1" }));

    expect(params.get("market")).toBe("token-1");
    expect(params.has("token_id")).toBe(false);
  });

  it("formats Polymarket values as pUSD", () => {
    expect(POLYMARKET_COLLATERAL_ASSET).toBe("pUSD");
    expect(getPlatformCollateralAsset("polymarket")).toBe("pUSD");
    expect(formatMarketCurrency(1200, { platform: "polymarket" })).toBe("1,200 pUSD");
    expect(formatMarketCurrency(1200, { platform: "kalshi" })).toBe("$1,200");
  });
});
