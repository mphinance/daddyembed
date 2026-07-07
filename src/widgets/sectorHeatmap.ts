/** Sector heatmap — `sectorFlow()` → a grid of sectors tinted by flow/change. */

import type { SectorFlow } from '@traderdaddy/sdk';
import type { WidgetDef } from './base.js';
import { premium, esc, signedPct, sparkline } from '../format.js';

/** Tint strength scales with |chgPct|, capped so nothing blows out. */
function tint(chgPct: number): string {
  const mag = Math.min(Math.abs(chgPct) / 2, 1); // 2% ⇒ full
  const alpha = (6 + mag * 22).toFixed(0);
  const base = chgPct >= 0 ? 'var(--td-bull)' : 'var(--td-bear)';
  return `color-mix(in srgb, ${base} ${alpha}%, transparent)`;
}

export const sectorHeatmap: WidgetDef<SectorFlow> = {
  name: 'sector-heatmap',
  title: 'Sector Flow',
  marketGated: true,
  css: `
.sh-macro { padding: 8px 12px; font-size: 11px; color: var(--td-muted); border-bottom: 1px solid var(--td-border); }
.sh-macro b { color: var(--td-text); }
.sh-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--td-border); }
.sh-cell { padding: 8px 9px; min-height: 62px; display: flex; flex-direction: column; justify-content: space-between; }
.sh-top { display: flex; align-items: center; justify-content: space-between; gap: 4px; }
.sh-sym { font-weight: 700; font-size: 12px; }
.sh-chg { font-size: 11px; font-weight: 700; }
.sh-bot { display: flex; align-items: flex-end; justify-content: space-between; gap: 4px; }
.sh-flow { font-size: 10px; color: var(--td-muted); }
`,
  fetch(client, config) {
    return client.sectorFlow(config.window ?? 'today');
  },
  render(data) {
    const m = data.macro;
    const cells = data.sectors
      .map((s) => {
        const cls = s.chgPct >= 0 ? 'pos' : 'neg';
        const sparkColor = s.chgPct >= 0 ? 'var(--td-bull)' : 'var(--td-bear)';
        return `<div class="sh-cell" style="background:${tint(s.chgPct)}" title="${esc(s.name)}">
          <div class="sh-top">
            <span class="sh-sym">${esc(s.sym)}</span>
            <span class="sh-chg ${cls} mono">${signedPct(s.chgPct)}</span>
          </div>
          <div class="sh-bot">
            <span class="sh-flow mono">${premium(s.flowNet)}</span>
            ${sparkline(s.sparkline, sparkColor, 46, 16)}
          </div>
        </div>`;
      })
      .join('');
    return `<div class="sh-macro"><b>${esc(m.label)}</b> · ${esc(m.dominantSector)} leads ${esc(m.dominantFlow)} · risk-on ${esc(String(m.riskOnScore))}</div>
      <div class="sh-grid">${cells}</div>`;
  },
};
