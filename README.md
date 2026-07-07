# DaddyEmbed

> An embeddable live **options-flow widget** powered by TraderDaddy Pro — drop a
> smart-money flow tape into any website, blog, or newsletter.

**Status:** 🚧 Not built yet — this README is the build brief. The dependency it
was blocked on now exists: [`@traderdaddy/sdk`](https://github.com/mphinance/traderdaddy-sdk)
is shipped (v0.1.0, typed + keyless demo mode), so the entire **render layer can
be built today against mock data**. The only thing still gating a *public*
launch is the backend key-safety decision (see below) — not the code.

Part of the [TraderDaddy Pro](https://traderdaddy.pro) open-source family, alongside
[DaddyBoard](https://github.com/mphinance/daddyboard) (the reference SDK consumer).

**Building it?** This is the best repo in the family to build from scratch — the
render layer works keyless. Grab a prompt from [`PROMPTS.md`](PROMPTS.md) and paste
it into Claude Code / Cursor; [`CLAUDE.md`](CLAUDE.md) has the pattern + the one blocker.

---

## Why this exists

Finance bloggers and newsletter writers want live, credible market widgets.
Every DaddyEmbed on someone's site is **branding + a backlink + a reason for
their readers to get a key** — distributed marketing that compounds. A one-line
`<script>` embed or a `<TDFlowTape />` React component renders a live flow tape,
a gamma bias chip, or an IV-rank strip on any page.

## The core idea: SDK + a render layer

DaddyEmbed writes **no transport, no auth, no polling, no fixtures** — the SDK
owns all of that. This repo is exactly one thing: **how the data looks.**

```
@traderdaddy/sdk   (the data — never re-implemented here)
        +
  a render layer    (the only part this repo owns: widgets → DOM)
```

Because the SDK ships keyless demo mode (`mock: true`) with *identical types* to
live, the entire widget set is built, themed, and screenshotted with **no key**,
then flips to live with one flag. That is the family's "spread keyless, convert
on go-live" funnel — inherited for free.

## Widgets

Each widget is **one SDK method → one typed response → one Shadow-DOM
component.** All shapes below are confirmed against the shipped SDK's `types.ts`.

| Widget | SDK method | Response type | Key fields rendered |
|---|---|---|---|
| **Flow tape** | `unusualActivity({ ticker?, limit })` | `UnusualActivity` | `data[]`: `ticker`, `type`, `premium`, `tier` + `tierColor`, `flowDescription`, `sentiment` |
| **Market vitals bar** | `marketStats()` | `MarketStats` | `putCallRatioSPY/QQQ/IWM`, `overallSentiment`, `dominantFlow`, `largestTrade` |
| **Gamma bias chip** | `gexTicker(symbol)` | `GexTicker` | `bias` (`LONG_GAMMA`/`SHORT_GAMMA`), `flipPoint`, `netGex` |
| **IV-rank strip** | `ivRank(symbol)` | `IvRank` | `ivRank`, `ivPercentile`, `interpretation` (`rich`/`cheap`/`neutral`), `note` |
| **Sector heatmap** | `sectorFlow()` | `SectorFlow` | `sectors[]`: `sym`, `flowNet`, `chgPct`, `flowSide`, `sparkline` |

Each widget is themeable (dark default, matching DaddyBoard's tokens),
responsive, and carries a small **Powered by TraderDaddy Pro** attribution that
links out.

## Two entry points

1. **Vanilla UMD** — zero-build `<script>` embed for any site (WordPress,
   Ghost, Substack, plain HTML):

   ```html
   <script src="https://cdn.traderdaddy.pro/daddyembed.js"
           data-widget="flow-tape"
           data-ticker="SPY"
           data-limit="10"
           data-theme="dark"></script>
   ```

   The script reads its config from `data-*` attributes, mounts into a Shadow
   root next to itself, and starts the SDK poll loop.

2. **ESM React package** — for React/Next sites:

   ```tsx
   import { TDFlowTape, TDGammaChip, TDIvRankStrip } from "@traderdaddy/embed";

   <TDFlowTape ticker="SPY" limit={10} />
   <TDGammaChip ticker="SPY" />
   <TDIvRankStrip ticker="NVDA" />
   ```

## Architecture

- **Data layer (one file).** Wrap `TraderDaddy` once; nothing else imports the
  SDK. This is where mock-vs-live and caching are decided:

  ```ts
  import { TraderDaddy, isMarketOpen } from "@traderdaddy/sdk";

  export const td = new TraderDaddy({
    mock: !runtimeKeyPresent,   // demo by default — the funnel
    apiKey: runtimeKey,         // supplied by the proxy / publishable-key path
    baseUrl,                    // point at the proxy when self-hosting
    cache: true,                // per-tool TTL cache (mirrors DaddyBoard cadence)
    backoff: true,              // 429 auto-retry — on by default
  });
  export { isMarketOpen };
  ```

- **Poll only while the market is open** — the SDK exports `isMarketOpen()`:

  ```ts
  setInterval(() => { if (isMarketOpen()) refresh(); }, 30_000);
  ```

- **Shadow DOM / scoped styles** so widgets never collide with host-page CSS.
- **Theme tokens** reused from DaddyBoard's `tokens.css`.
- The UMD bundle inlines the SDK; the React package lists `@traderdaddy/sdk` as
  a dependency.

## 🔴 Key-safety — the one real blocker (decide BEFORE public launch)

This is the only family member that runs on **other people's** public pages, so
the personal-key pattern does not apply — a `td_live_` key **cannot** be shipped
in anything a stranger can view-source or unzip. This is spelled out in the
SDK's [app playbook](https://github.com/mphinance/traderdaddy-sdk/blob/main/docs/BUILDING-APPS.md#daddyembed--public-embed-for-someone-elses-site).
Pick one before shipping widely:

1. **Server-side proxy** — the embedder runs a tiny endpoint that holds the key
   and forwards requests; the widget calls *that* endpoint (point the SDK's
   `baseUrl` at it). The proxy itself runs the SDK in Node with the real key.
   Safe, but adds friction for non-technical bloggers.
2. **Domain-scoped publishable key** (e.g. `td_pub_…`, restricted by
   `Origin`/referrer, read-only, tighter rate limit) — best UX, but **does not
   exist yet**: it is a backend change in TraderDaddy Pro to mint and enforce
   it. Coordinate with the API team.

Until one exists, ship DaddyEmbed in **demo/self-host mode only** and gate the
public `<script>` embed behind option 2.

## Build milestones

1. **Data layer + flow-tape widget** against `new TraderDaddy({ mock: true })`.
   Render `unusualActivity().data[]` with tier coloring. Ship one working widget
   before adding more.
2. **UMD bundle + `data-*` config** — `<script>` mount into Shadow DOM, config
   from attributes. Then the **React package**.
3. **Remaining widgets** — market vitals bar, gamma bias chip, IV-rank strip,
   sector heatmap — same method→type→component shape.
4. **Theme tokens** (reuse DaddyBoard's `tokens.css`); responsive.
5. **Attribution / CTA footer** ("Powered by TraderDaddy Pro").
6. **Resolve the key-safety model** (proxy vs `td_pub_`) before enabling the
   public embed. Document both integration paths.
7. **Demo/playground page** showing every widget (works keyless via `mock:true`).

## Picking this up in a new session

Prereq is **done**: [`@traderdaddy/sdk`](https://github.com/mphinance/traderdaddy-sdk)
is built and published-ready. Read its
[app playbook](https://github.com/mphinance/traderdaddy-sdk/blob/main/docs/BUILDING-APPS.md)
first — the DaddyEmbed section is written for exactly this repo.

Build the whole render layer keyless against `@traderdaddy/sdk/mock` — you can
finish every widget with no key. The blocker for *public* launch is the
key-safety decision above, not the code; **raise it before you start.**

## MCP tools used (via the SDK)

`get_unusual_activity`, `get_market_stats`, `get_gex_ticker`,
`get_put_call_ratios`, `get_iv_rank`, `get_sector_flow` — each surfaced as a
typed SDK method (`unusualActivity()`, `marketStats()`, `gexTicker()`,
`putCallRatios()`, `ivRank()`, `sectorFlow()`).
