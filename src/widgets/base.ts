/**
 * base.ts — the widget runtime. Every widget is a `WidgetDef`: a name, its CSS,
 * a `fetch` (one SDK method) and a `render` (typed data → HTML). `mountWidget`
 * does everything else: Shadow-DOM isolation, theme, initial skeleton, the
 * market-gated poll loop, error states, and the attribution footer.
 *
 * One method → one type → one component. Widgets never import the SDK — they get
 * a ready `Client` from the data layer.
 */

import { getClient, isMarketOpen, type Client, type ClientConfig } from '../data.js';
import { baseCss, type ThemeName } from '../theme.js';
import { esc } from '../format.js';

export interface WidgetConfig extends ClientConfig {
  /** Primary ticker for ticker-scoped widgets (flow tape, gamma, IV). */
  ticker?: string;
  /** Alias for `ticker`. */
  symbol?: string;
  /** Row cap for list widgets (flow tape). */
  limit?: number;
  /** Sector-flow window. */
  window?: string;
  /** Visual theme. Default `dark`. */
  theme?: ThemeName;
  /** Header label override. */
  title?: string;
  /** Poll interval (ms). Default 30_000. */
  refreshMs?: number;
}

export interface WidgetDef<T> {
  /** Kebab name used in `data-widget` / the registry. */
  name: string;
  /** Default header label. */
  title: string;
  /** Widget-specific CSS, appended after `baseCss` inside the Shadow root. */
  css: string;
  /** The single SDK call this widget makes. */
  fetch(client: Client, config: WidgetConfig): Promise<T>;
  /** Typed data → inner HTML for `.td-body`. */
  render(data: T, config: WidgetConfig): string;
  /** Set false for widgets that should keep polling after hours. Default true. */
  marketGated?: boolean;
}

export interface WidgetHandle {
  refresh(): void;
  destroy(): void;
  el: HTMLElement;
}

const ATTRIB = 'https://traderdaddy.pro';

/** Resolve the ticker a widget should use, tolerant of `ticker`/`symbol`. */
export function tickerOf(config: WidgetConfig, fallback = 'SPY'): string {
  return (config.ticker || config.symbol || fallback).toUpperCase();
}

export function mountWidget<T>(
  target: HTMLElement,
  def: WidgetDef<T>,
  config: WidgetConfig = {},
): WidgetHandle {
  const theme: ThemeName = config.theme === 'light' ? 'light' : 'dark';
  const title = esc(config.title ?? def.title);
  const refreshMs = config.refreshMs ?? 30_000;
  const gated = def.marketGated ?? true;

  const shadow = target.shadowRoot ?? target.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>${baseCss}${def.css}</style>
    <div class="td" part="widget" data-theme="${theme}">
      <div class="td-head">
        <span class="td-title">${title}</span>
        <span class="td-live"><span class="td-dot" data-live></span><span data-live-label>—</span></span>
      </div>
      <div class="td-body" data-body>
        <div class="td-skel"><i></i><i></i><i></i></div>
      </div>
      <div class="td-foot">
        <span>Powered by <a href="${ATTRIB}" target="_blank" rel="noopener">TraderDaddy&nbsp;Pro</a></span>
        <span data-ts class="mut"></span>
      </div>
    </div>`;

  const body = shadow.querySelector<HTMLElement>('[data-body]')!;
  const dot = shadow.querySelector<HTMLElement>('[data-live]')!;
  const liveLabel = shadow.querySelector<HTMLElement>('[data-live-label]')!;
  const tsEl = shadow.querySelector<HTMLElement>('[data-ts]')!;
  const client = getClient(config);

  let timer: ReturnType<typeof setInterval> | null = null;
  let destroyed = false;
  let loadedOnce = false;

  function setLive(): void {
    const open = isMarketOpen();
    dot.classList.toggle('open', open);
    liveLabel.textContent = open ? 'Live' : 'Closed';
  }

  async function refresh(): Promise<void> {
    if (destroyed) return;
    setLive();
    try {
      const data = await def.fetch(client, config);
      if (destroyed) return;
      body.innerHTML = def.render(data, config);
      tsEl.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      loadedOnce = true;
    } catch (err) {
      if (destroyed || loadedOnce) return; // keep last good data on transient errors
      const msg = err instanceof Error ? err.message : 'Could not load data';
      body.innerHTML = `<div class="td-err"><b>Unavailable</b>${esc(msg)}</div>`;
    }
  }

  void refresh();
  timer = setInterval(() => {
    if (!gated || isMarketOpen()) void refresh();
    else setLive();
  }, refreshMs);

  return {
    el: target,
    refresh: () => void refresh(),
    destroy() {
      destroyed = true;
      if (timer) clearInterval(timer);
      shadow.innerHTML = '';
    },
  };
}
