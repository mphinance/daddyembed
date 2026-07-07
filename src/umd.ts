/**
 * umd.ts — the vanilla `<script>` entry (built to dist/daddyembed.js, SDK inlined).
 *
 * Two ways to use it on a page:
 *   1. Self-mounting script tag — the widget renders right where the tag sits:
 *        <script src="…/daddyembed.js"
 *                data-widget="flow-tape" data-ticker="SPY" data-limit="8"
 *                data-theme="dark"></script>
 *   2. Placeholder element — mark any element and it gets upgraded:
 *        <div data-daddyembed data-widget="gamma-chip" data-ticker="NVDA"></div>
 *   3. Programmatic — `DaddyEmbed.mount(el, { widget: "iv-rank", ticker: "TSLA" })`.
 *
 * Key safety: this bundle is PUBLIC. Never put a `td_live_` key in a data-* attr
 * on a page a stranger can view-source. Keyless ⇒ demo fixtures; for live public
 * embeds point `data-base-url` at a proxy that holds the key. See README.
 */

import { mount, type MountOptions } from './mount.js';
import { registry, widgetNames } from './widgets/registry.js';
import type { WidgetHandle } from './widgets/base.js';

type AttrEl = HTMLElement & { dataset: DOMStringMap };

/** Read a widget config off an element's data-* attributes. */
function configFromEl(el: AttrEl): MountOptions | null {
  const widget = el.dataset.widget;
  if (!widget) return null;
  const d = el.dataset;
  const opts: MountOptions = { widget };
  if (d.ticker) opts.ticker = d.ticker;
  if (d.symbol) opts.symbol = d.symbol;
  if (d.limit) opts.limit = Number(d.limit);
  if (d.window) opts.window = d.window;
  if (d.theme === 'light' || d.theme === 'dark') opts.theme = d.theme;
  if (d.title) opts.title = d.title;
  if (d.refresh) opts.refreshMs = Number(d.refresh);
  if (d.apiKey) opts.apiKey = d.apiKey; // discouraged in public embeds
  if (d.baseUrl) opts.baseUrl = d.baseUrl;
  if (d.mock != null) opts.mock = d.mock !== 'false';
  return opts;
}

const MOUNTED = '__tdMounted';

function upgrade(el: AttrEl): WidgetHandle | null {
  if ((el as unknown as Record<string, unknown>)[MOUNTED]) return null;
  const opts = configFromEl(el);
  if (!opts) return null;
  (el as unknown as Record<string, unknown>)[MOUNTED] = true;
  return mount(el, opts);
}

/** Auto-mount everything currently on the page. */
function scan(): void {
  // Placeholder elements.
  document.querySelectorAll<AttrEl>('[data-daddyembed]').forEach(upgrade);
  // Self-mounting script tags → insert a host div right after each.
  document.querySelectorAll<HTMLScriptElement & AttrEl>('script[data-widget]').forEach((script) => {
    if ((script as unknown as Record<string, unknown>)[MOUNTED]) return;
    const opts = configFromEl(script);
    if (!opts) return;
    (script as unknown as Record<string, unknown>)[MOUNTED] = true;
    const host = document.createElement('div');
    host.style.display = 'block';
    if (script.dataset.width) host.style.maxWidth = script.dataset.width;
    script.parentNode?.insertBefore(host, script.nextSibling);
    mount(host, opts);
  });
}

export interface DaddyEmbedGlobal {
  mount(target: HTMLElement, options: MountOptions): WidgetHandle;
  scan(): void;
  widgets: string[];
  registry: typeof registry;
}

const api: DaddyEmbedGlobal = { mount, scan, widgets: widgetNames, registry };

declare global {
  interface Window {
    DaddyEmbed: DaddyEmbedGlobal;
  }
}

if (typeof window !== 'undefined') {
  window.DaddyEmbed = api;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan, { once: true });
  } else {
    scan();
  }
}

export { mount };
export type { MountOptions };
