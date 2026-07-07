# DaddyEmbed

> An embeddable live **options-flow widget** powered by TraderDaddy Pro — drop a
> smart-money flow tape into any website, blog, or newsletter.

**Status:** 🚧 Spec only — not built yet. This README is the build brief.

Part of the [TraderDaddy Pro](https://traderdaddy.pro) open-source family, alongside
[DaddyBoard](https://github.com/mphinance/daddyboard). Depends on
[traderdaddy-sdk](https://github.com/mphinance/traderdaddy-sdk).

---

## Why this exists

Finance bloggers and newsletter writers want live, credible market widgets.
Every DaddyEmbed on someone's site is **branding + a backlink + a reason for
their readers to get a key** — distributed marketing that compounds. Think a
`<script>` embed or a `<TDFlowTape />` React component that renders the flow tape,
a gamma bias chip, or an IV-rank strip.

## What it does

- **Drop-in embeds:**
  - `<script src="…/daddyembed.js" data-widget="flow-tape">` (vanilla, any site)
  - `<TDFlowTape />`, `<TDGammaChip ticker="SPY" />` (React package)
- Widgets: **flow tape**, **market vitals bar**, **gamma bias chip**,
  **IV-rank strip**, **sector heatmap**. Each themeable (dark default, matches
  DaddyBoard) and responsive.
- Always shows a small **Powered by TraderDaddy Pro** attribution that links out.

## Architecture

- Rendering layer over [`@traderdaddy/sdk`](https://github.com/mphinance/traderdaddy-sdk)
  (isomorphic transport does the fetching; this repo is "SDK + render").
- Two entry points: a zero-build UMD bundle for `<script>` embeds, and an ESM
  React package.
- Shadow DOM / scoped styles so it never collides with host-page CSS.

## MCP tools used

`get_unusual_activity`, `get_market_stats`, `get_gex_ticker`,
`get_put_call_ratios`, `get_iv_rank`, `get_sector_flow`.

## 🔴 Key-safety — decide BEFORE public launch

This is the one family member that runs on **other people's** public pages, so
the personal-key pattern doesn't apply — a `td_live_` key can't be exposed in a
page anyone can view-source. Pick one before shipping widely:

1. **Server-side proxy** — the embedder runs a tiny proxy that holds the key and
   the widget calls that. Safe, but adds friction for non-technical bloggers.
2. **Domain-scoped publishable key** (e.g. `td_pub_…`, restricted by
   `Origin`/referrer, read-only, tighter rate limit) — best UX, but requires a
   backend change in TraderDaddy Pro to mint and enforce it.

Until one exists, ship DaddyEmbed in **demo/self-host mode only** (own site +
own key) and gate the public `<script>` embed behind option 2. Coordinate with
the TraderDaddy Pro backend team.

## Build milestones

1. Depend on `@traderdaddy/sdk`; build the flow-tape widget against demo data.
2. Vanilla UMD bundle + `data-*` config; then the React package.
3. Theme tokens (reuse DaddyBoard's `tokens.css`); responsive + Shadow DOM.
4. Attribution/CTA footer.
5. **Resolve the key-safety model** (proxy vs `td_pub_`) before enabling the
   public embed. Document both integration paths.
6. Demo/playground page showing every widget.

## Picking this up in a new session

Prereq: [`traderdaddy-sdk`](https://github.com/mphinance/traderdaddy-sdk). Build
entirely against `@traderdaddy/sdk/mock` first — you can finish the whole render
layer keyless. The blocker for *public* launch is the key-safety decision above,
not the code; raise it early.
