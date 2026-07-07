# Prompt pack — build DaddyEmbed

DaddyEmbed is embeddable options-flow widgets for any site. **It's not built yet**
— which makes it the best repo in the family to build from scratch, because the
whole render layer works **keyless** against the SDK's demo mode. Pick a prompt,
paste it into your AI coding tool (Claude Code, Cursor, …) inside a clone of this
repo, and let it drive.

> **First, always:** tell your AI to read `CLAUDE.md` and `README.md` in this repo
> — the README is the full spec.

---

## 1. Build the first widget (start here)

```
I want to start building this repo. It has no code yet — read CLAUDE.md and
README.md first; the README is the spec and CLAUDE.md has the pattern.

Build milestone 1 only: the data layer + the flow-tape widget, keyless.
1. Scaffold the project and add @traderdaddy/sdk.
2. Create ONE data-layer file that wraps `new TraderDaddy({ mock: true })` — start
   keyless, no key. Nothing else imports the SDK.
3. Build ONE widget: the flow tape from `unusualActivity({ limit })`. Render each
   row (ticker, type, premium, tier) colored by `tierColor`, inside a Shadow DOM
   so host-page CSS can't leak in.
4. Give me a plain HTML demo page I can open in a browser to see it render from
   demo data — no key.
Ship this one working widget before we add any others. Show me the plan first.
```

---

## 2. Add the remaining widgets

```
The flow-tape widget works. Now add the rest, same shape as CLAUDE.md describes:
one SDK method → one typed response → one Shadow-DOM component.

- Market vitals bar → marketStats()
- Gamma bias chip → gexTicker(symbol)
- IV-rank strip → ivRank(symbol)
- Sector heatmap → sectorFlow()

Keep them all keyless (mock demo data) and themeable. Add each to the demo page.
Don't merge widgets or bypass the typed methods. One at a time; show me each.
```

---

## 3. Add the two entry points

```
Read CLAUDE.md's "Two entry points" section. Add:
1. A vanilla UMD <script> build: reads config from data-* attributes
   (data-widget, data-ticker, data-limit, data-theme), mounts into a Shadow root
   next to itself, inlines the SDK, starts the poll loop — but ONLY polls while
   isMarketOpen() (import it from the SDK).
2. An ESM React package exporting <TDFlowTape />, <TDGammaChip />, <TDIvRankStrip />.

Both must work keyless in demo mode. Give me a demo page for each. Explain the
build setup before writing it.
```

---

## 4. Understand the key-safety blocker before going public

```
Read CLAUDE.md's "key safety" section and the SDK playbook's DaddyEmbed section.
Explain to me, in plain language:
1. Why I CANNOT put my td_live_ key in the public <script> embed (this widget runs
   on other people's pages).
2. The two routes — a server-side proxy vs a domain-scoped publishable key
   (td_pub_) — and the tradeoffs.
3. Which one lets me ship, and which one doesn't exist yet.
I want to build the whole widget set in demo mode now and understand exactly what
has to be decided before I enable a live public embed. Don't write live-key code.
```

---

## 5. Contribute what you built

```
I built part of DaddyEmbed and want to contribute it back as a pull request. Read
CLAUDE.md first and match its conventions (one data-layer file, one method → one
type → one component, Shadow DOM, keyless-first).

Before the PR:
1. Confirm every widget renders keyless from demo data with no key.
2. Confirm NO td_live_ key is anywhere in the code (this is the public-embed repo
   — that rule is absolute here).
3. Help me write a clear commit message and open the PR against `main` on GitHub.
Explain each step.
```

---

## Tips

- **Build everything keyless first.** The SDK's demo mode has identical types to
  live, so you can finish every widget with no key. That's the whole point.
- **This is the public-embed repo — the key rule is absolute.** Never put a
  `td_live_` key in the code. If your AI writes one in, stop it; the live path is a
  proxy or a (not-yet-existing) `td_pub_` key.
- **Shadow DOM, always.** Widgets run on strangers' pages; host CSS must not leak
  in and yours must not leak out.
- **Ship one widget before five.** Get the flow tape rendering from demo data,
  then repeat the pattern.
