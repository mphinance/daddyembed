/** Market vitals bar — `marketStats()` → a compact row of market-wide reads. */

import type { MarketStats } from '@traderdaddy/sdk';
import type { WidgetDef } from './base.js';
import { premium, esc, num, sentimentClass } from '../format.js';

export const marketVitals: WidgetDef<MarketStats> = {
  name: 'market-vitals',
  title: 'Market Vitals',
  marketGated: true,
  css: `
.mv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--td-border); }
.mv-cell { background: var(--td-bg); padding: 9px 12px; }
.mv-k { font-size: 10px; color: var(--td-muted); text-transform: uppercase; letter-spacing: .4px; }
.mv-v { font-size: 15px; font-weight: 700; margin-top: 2px; }
.mv-sub { font-size: 10px; color: var(--td-muted); margin-top: 1px; }
`,
  fetch(client) {
    return client.marketStats();
  },
  render(data) {
    const s = sentimentClass(data.overallSentiment);
    const lt = data.largestTrade;
    const ltCls = lt.type === 'CALL' ? 'pos' : 'neg';
    return `<div class="mv-grid">
      <div class="mv-cell">
        <div class="mv-k">Sentiment</div>
        <div class="mv-v ${s}">${esc(data.overallSentiment)}</div>
        <div class="mv-sub">score ${esc(String(data.sentimentScore))} · ${esc(data.dominantFlow)} lead</div>
      </div>
      <div class="mv-cell">
        <div class="mv-k">Put / Call</div>
        <div class="mv-v mono">${num(data.putCallRatioSPY, 2)}</div>
        <div class="mv-sub mono">QQQ ${num(data.putCallRatioQQQ, 2)} · IWM ${num(data.putCallRatioIWM, 2)}</div>
      </div>
      <div class="mv-cell">
        <div class="mv-k">Largest Trade</div>
        <div class="mv-v ${ltCls}">${esc(lt.ticker)} <span class="mono">${premium(lt.premium)}</span></div>
        <div class="mv-sub">${esc(lt.type)} · ${esc(lt.tradeType)} · score ${esc(String(lt.score))}</div>
      </div>
    </div>`;
  },
};
