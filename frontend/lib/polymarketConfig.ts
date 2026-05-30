export const POLYMARKET_GAMMA_HOST = "https://gamma-api.polymarket.com";
export const POLYMARKET_DATA_HOST = "https://data-api.polymarket.com";
export const POLYMARKET_CLOB_HOST = "https://clob.polymarket.com";

export const POLYMARKET_COLLATERAL_ASSET = "pUSD" as const;
export type CollateralAsset = "USD" | typeof POLYMARKET_COLLATERAL_ASSET;

export const POLYMARKET_REQUEST_TIMEOUT_MS = 10_000;

const GAMMA_ENDPOINTS = ["events", "markets", "public-search"] as const;
const DATA_ENDPOINTS = ["trades", "positions", "closed-positions"] as const;
const CLOB_READ_ENDPOINTS = [
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
] as const;

const READ_ONLY_ENDPOINTS = [
  ...GAMMA_ENDPOINTS,
  ...DATA_ENDPOINTS,
  ...CLOB_READ_ENDPOINTS,
] as const;

type ReadOnlyEndpoint = (typeof READ_ONLY_ENDPOINTS)[number];

export function normalizePolymarketEndpoint(endpoint: string): string {
  return endpoint.trim().replace(/^\/+/, "");
}

function endpointRoot(endpoint: string): string {
  return normalizePolymarketEndpoint(endpoint).split("/")[0] ?? "";
}

export function isAllowedPolymarketReadEndpoint(endpoint: string): boolean {
  const normalized = normalizePolymarketEndpoint(endpoint).toLowerCase();
  if (!normalized || normalized.includes("..") || normalized.includes("\\") || normalized.includes("%2e") || normalized.includes("%2f")) {
    return false;
  }

  return READ_ONLY_ENDPOINTS.includes(endpointRoot(normalized) as ReadOnlyEndpoint);
}

export function resolvePolymarketHost(endpoint: string): string {
  const root = endpointRoot(endpoint);
  if ((GAMMA_ENDPOINTS as readonly string[]).includes(root)) return POLYMARKET_GAMMA_HOST;
  if ((DATA_ENDPOINTS as readonly string[]).includes(root)) return POLYMARKET_DATA_HOST;
  if ((CLOB_READ_ENDPOINTS as readonly string[]).includes(root)) return POLYMARKET_CLOB_HOST;
  throw new Error(`Unsupported Polymarket endpoint: ${endpoint}`);
}

export function normalizePolymarketQuery(endpoint: string, params: URLSearchParams): URLSearchParams {
  const normalized = new URLSearchParams(params);

  if (endpointRoot(endpoint) === "prices-history" && normalized.has("token_id") && !normalized.has("market")) {
    normalized.set("market", normalized.get("token_id") ?? "");
    normalized.delete("token_id");
  }

  return normalized;
}
