/**
 * data.ts — the data layer. The ONLY file that imports @traderdaddy/sdk.
 *
 * The SDK owns transport, 429 backoff, market-hours and caching; this file just
 * decides mock-vs-live and hands widgets a ready client. Widgets never touch the
 * SDK directly — they call `getClient()` and get the typed methods.
 *
 * Keyless-first: no key ⇒ `mock: true` ⇒ typed demo fixtures. That's the family
 * funnel — build/screenshot keyless, then supply a key (via a proxy `baseUrl`)
 * to go live. See the key-safety note in README before shipping a PUBLIC embed.
 */

import { TraderDaddy, isMarketOpen, getMarketPhase } from '@traderdaddy/sdk';

/** Re-export the SDK type so widgets can be typed without importing the SDK. */
export type Client = TraderDaddy;
export { isMarketOpen, getMarketPhase };

export interface ClientConfig {
  /** A `td_live_…` key. Omit for keyless demo mode. NEVER ship one in a public embed. */
  apiKey?: string;
  /** Point at a proxy that holds the key server-side (the safe public path). */
  baseUrl?: string;
  /** Force demo fixtures even if a key is present (e.g. for screenshots). */
  mock?: boolean;
}

// One client per distinct config — most pages use exactly one.
const clients = new Map<string, TraderDaddy>();

export function getClient(cfg: ClientConfig = {}): TraderDaddy {
  const key = cfg.apiKey;
  const mock = cfg.mock ?? !key; // keyless ⇒ demo
  const cacheKey = JSON.stringify({ mock, key: key ?? null, baseUrl: cfg.baseUrl ?? null });

  let client = clients.get(cacheKey);
  if (!client) {
    client = new TraderDaddy({
      mock,
      ...(key ? { apiKey: key } : {}),
      ...(cfg.baseUrl ? { baseUrl: cfg.baseUrl } : {}),
      cache: true, // per-tool TTL cache, mirrors DaddyBoard cadence
      backoff: true, // 429 auto-retry, on by default
    });
    clients.set(cacheKey, client);
  }
  return client;
}
