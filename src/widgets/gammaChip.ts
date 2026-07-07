/** Gamma bias chip — `gexTicker(symbol)` → a compact dealer-positioning chip. */

import type { GexTicker } from '@traderdaddy/sdk';
import { type WidgetDef, tickerOf } from './base.js';
import { premium, esc, num } from '../format.js';

export const gammaChip: WidgetDef<GexTicker> = {
  name: 'gamma-chip',
  title: 'Gamma Bias',
  marketGated: true,
  css: `
.gc { display: flex; align-items: center; gap: 12px; padding: 12px; }
.gc-bias { flex: 0 0 auto; padding: 8px 12px; border-radius: 8px; font-weight: 800; font-size: 13px; letter-spacing: .3px; text-align: center; }
.gc-long { color: var(--td-bull); background: color-mix(in srgb, var(--td-bull) 16%, transparent); }
.gc-short { color: var(--td-bear); background: color-mix(in srgb, var(--td-bear) 16%, transparent); }
.gc-stats { display: flex; gap: 16px; flex: 1; }
.gc-k { font-size: 10px; color: var(--td-muted); text-transform: uppercase; letter-spacing: .4px; }
.gc-v { font-size: 14px; font-weight: 700; margin-top: 2px; }
.gc-sym { color: var(--td-accent); }
`,
  fetch(client, config) {
    return client.gexTicker(tickerOf(config, 'SPY'));
  },
  render(data) {
    const long = data.bias === 'LONG_GAMMA';
    const label = long ? 'LONG&nbsp;γ' : data.bias === 'SHORT_GAMMA' ? 'SHORT&nbsp;γ' : esc(data.bias);
    return `<div class="gc">
      <div class="gc-bias ${long ? 'gc-long' : 'gc-short'}">${label}</div>
      <div class="gc-stats">
        <div>
          <div class="gc-k">Symbol</div>
          <div class="gc-v gc-sym">${esc(data.symbol)}</div>
        </div>
        <div>
          <div class="gc-k">Flip Point</div>
          <div class="gc-v mono">${num(data.flipPoint, 0)}</div>
        </div>
        <div>
          <div class="gc-k">Net GEX</div>
          <div class="gc-v mono ${data.netGex >= 0 ? 'pos' : 'neg'}">${premium(data.netGex)}</div>
        </div>
      </div>
    </div>`;
  },
};
