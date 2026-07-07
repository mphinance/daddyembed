/** Flow tape — `unusualActivity()` → a scrolling list of smart-money prints. */

import type { UnusualActivity } from '@traderdaddy/sdk';
import type { WidgetDef } from './base.js';
import { premium, esc, truncate, sentimentClass } from '../format.js';

export const flowTape: WidgetDef<UnusualActivity> = {
  name: 'flow-tape',
  title: 'Options Flow',
  marketGated: true,
  css: `
.ft-row { display: grid; grid-template-columns: 54px 40px 1fr auto; align-items: center; gap: 8px; padding: 7px 12px; border-bottom: 1px solid var(--td-border); }
.ft-row:last-child { border-bottom: 0; }
.ft-tkr { font-weight: 700; font-size: 12px; }
.ft-tier { display: block; font-size: 9px; letter-spacing: .3px; margin-top: 1px; font-weight: 700; }
.ft-desc { color: var(--td-muted); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ft-prem { text-align: right; font-weight: 700; font-size: 12px; }
`,
  fetch(client, config) {
    const ticker = config.ticker || config.symbol;
    return client.unusualActivity({
      limit: config.limit ?? 8,
      ...(ticker ? { ticker: ticker.toUpperCase() } : {}),
    });
  },
  render(data, config) {
    const rows = data.data.slice(0, config.limit ?? 8);
    if (!rows.length) return `<div class="td-err"><b>No unusual flow</b>Nothing crossing the tape right now.</div>`;
    return rows
      .map((r) => {
        const badge = r.type === 'CALL' ? 'td-call' : 'td-put';
        return `<div class="ft-row">
          <div>
            <span class="ft-tkr">${esc(r.ticker)}</span>
            <span class="ft-tier" style="color:${esc(r.tierColor)}">${esc(r.tier)}</span>
          </div>
          <div><span class="td-badge ${badge}">${esc(r.type)}</span></div>
          <div class="ft-desc" title="${esc(r.flowDescription)}">${esc(truncate(r.flowDescription, 60))}</div>
          <div class="ft-prem ${sentimentClass(r.sentiment)} mono">${premium(r.premium)}</div>
        </div>`;
      })
      .join('');
  },
};
