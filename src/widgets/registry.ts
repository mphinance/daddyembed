/** registry.ts — every widget keyed by its `data-widget` name. */

import type { WidgetDef } from './base.js';
import { flowTape } from './flowTape.js';
import { marketVitals } from './marketVitals.js';
import { gammaChip } from './gammaChip.js';
import { ivRankStrip } from './ivRankStrip.js';
import { sectorHeatmap } from './sectorHeatmap.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registry: Record<string, WidgetDef<any>> = {
  [flowTape.name]: flowTape,
  [marketVitals.name]: marketVitals,
  [gammaChip.name]: gammaChip,
  [ivRankStrip.name]: ivRankStrip,
  [sectorHeatmap.name]: sectorHeatmap,
};

export const widgetNames = Object.keys(registry);

export { flowTape, marketVitals, gammaChip, ivRankStrip, sectorHeatmap };
