# CLAUDE.md — agent ground-truth for DaddyEmbed

> Read this first. The short, factual map for working in this repo. Tool-agnostic
> — copy to `AGENTS.md` if you use Cursor/other.
>
> **Building it by talking to your AI?** See [`PROMPTS.md`](PROMPTS.md). The full
> spec is the [`README.md`](README.md).

## What this is (and its status)

Embeddable **options-flow widgets** for any website/blog/newsletter, powered by
TraderDaddy Pro. **Status: build brief — no code yet.** The dependency it was
blocked on ([`@traderdaddy/sdk`](https://github.com/mphinance/traderdaddy-sdk),
v0.1.0) is shipped, so **the entire render layer can be built today against mock
data.** The only thing gating a *public* launch is a backend key-safety decision
(below) — not the code. The README is the spec; build to it.

## The one pattern

DaddyEmbed writes **no transport, no auth, no polling, no fixtures** — the SDK
owns all of it. This repo is exactly one thing: **how the data looks.**

```
@traderdaddy/sdk   (the data — never re-implemented here)
        +
  a render layer    (the only part this repo owns: widgets → DOM)
```

Because the SDK ships keyless demo mode with identical types to live, build,
theme, and screenshot every widget with **no key**, then flip one flag for live.

## Intended structure (build to this)

- **Data layer — one file.** Wrap `TraderDaddy` once; nothing else imports the
  SDK. This is where mock-vs-live, `baseUrl` (proxy), and caching are decided:
  ```ts
  export const td = new TraderDaddy({
    mock: !runtimeKeyPresent, apiKey: runtimeKey, baseUrl,
    cache: true, backoff: true,
  });
  ```
- **Widgets — one SDK method → one typed response → one Shadow-DOM component:**

  | Widget | SDK method | Type |
  |---|---|---|
  | Flow tape | `unusualActivity({ ticker?, limit })` | `UnusualActivity` |
  | Market vitals bar | `marketStats()` | `MarketStats` |
  | Gamma bias chip | `gexTicker(symbol)` | `GexTicker` |
  | IV-rank strip | `ivRank(symbol)` | `IvRank` |
  | Sector heatmap | `sectorFlow()` | `SectorFlow` |

- **Two entry points:** a vanilla **UMD** `<script>` (config from `data-*` attrs,
  mounts into a Shadow root, inlines the SDK) and an **ESM React** package
  (`@traderdaddy/embed`, lists `@traderdaddy/sdk` as a dep).
- **Shadow DOM / scoped styles** so widgets never collide with host-page CSS.
- **Poll only while `isMarketOpen()`.** Theme tokens reused from DaddyBoard.

## 🔴 The one real blocker — key safety (decide BEFORE public launch)

This is the **only** family member that runs on **other people's** public pages,
so the personal-key pattern does NOT apply — a `td_live_` key **cannot** ship in
anything a stranger can view-source or unzip. Two routes, pick one before shipping
widely:

1. **Server-side proxy** — embedder runs a tiny endpoint holding the key; the
   widget points the SDK's `baseUrl` at it. Safe; adds friction.
2. **Domain-scoped publishable key** (`td_pub_…`, Origin-restricted, read-only) —
   best UX, but **does not exist yet**; it's a backend change in TraderDaddy Pro.

Until one exists, build and ship in **demo/self-host mode only**, and gate the
public `<script>` embed behind route 2. **Raise this before starting live work.**

## Conventions (match these when building)

- **One data-layer file; widgets never import the SDK directly.**
- **One method → one type → one component.** Don't merge widgets or reach past the
  typed method.
- **Keyless-first.** Every widget must render from `@traderdaddy/sdk/mock` with no
  key. That's how you build the whole set before the key-safety decision lands.
- **Zero host-page CSS leakage** — Shadow DOM, always.

## Where to look when unsure

- The spec → [`README.md`](README.md)
- The SDK playbook's DaddyEmbed section → [BUILDING-APPS.md](https://github.com/mphinance/traderdaddy-sdk/blob/main/docs/BUILDING-APPS.md#daddyembed--public-embed-for-someone-elses-site)
- The SDK's methods + types → [SDK README](https://github.com/mphinance/traderdaddy-sdk#methods)
- Prompts to build it → [`PROMPTS.md`](PROMPTS.md)
