/** IV-rank strip — `ivRank(symbol)` → a rank gauge with a rich/cheap verdict. */

import type { IvRank } from '@traderdaddy/sdk';
import { type WidgetDef, tickerOf } from './base.js';
import { esc, num, truncate } from '../format.js';

function verdictColor(v: string): string {
  if (v === 'rich') return 'var(--td-bear)';
  if (v === 'cheap') return 'var(--td-bull)';
  return 'var(--td-neutral)';
}

export const ivRankStrip: WidgetDef<IvRank> = {
  name: 'iv-rank',
  title: 'IV Rank',
  marketGated: false,
  css: `
.iv { padding: 11px 12px; }
.iv-top { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; }
.iv-sym { font-weight: 700; font-size: 13px; color: var(--td-accent); }
.iv-rank { font-size: 20px; font-weight: 800; }
.iv-rank small { font-size: 11px; color: var(--td-muted); font-weight: 600; }
.iv-verdict { padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; }
.iv-track { height: 7px; border-radius: 4px; background: var(--td-panel-2); overflow: hidden; }
.iv-fill { height: 100%; border-radius: 4px; }
.iv-note { margin-top: 8px; font-size: 11px; color: var(--td-muted); }
.iv-pct { font-size: 10px; color: var(--td-muted); margin-top: 4px; }
`,
  fetch(client, config) {
    return client.ivRank(tickerOf(config, 'SPY'));
  },
  render(data) {
    const color = verdictColor(String(data.interpretation));
    const pct = Math.max(0, Math.min(100, data.ivRank));
    return `<div class="iv">
      <div class="iv-top">
        <span class="iv-sym">${esc(data.symbol)}</span>
        <span class="iv-rank mono">${num(data.ivRank, 0)}<small>/100</small></span>
        <span class="iv-verdict" style="color:${color};background:color-mix(in srgb, ${color} 16%, transparent)">${esc(data.interpretation)}</span>
      </div>
      <div class="iv-track"><div class="iv-fill" style="width:${pct}%;background:${color}"></div></div>
      <div class="iv-pct mono">IV percentile ${num(data.ivPercentile, 0)} · current IV ${num(data.currentIV * 100, 1)}%</div>
      <div class="iv-note">${esc(truncate(data.note, 120))}</div>
    </div>`;
  },
};
