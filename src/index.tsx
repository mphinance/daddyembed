/**
 * index.tsx — the ESM/CJS React package entry (@traderdaddy/embed).
 *
 * React-thin wrappers over the same vanilla widgets the UMD bundle mounts. Each
 * component mounts its widget into a host <div> on mount and re-mounts when its
 * props change. `@traderdaddy/sdk` and `react` stay external (real deps).
 *
 *   import { TDFlowTape, TDGammaChip } from "@traderdaddy/embed";
 *   <TDFlowTape ticker="SPY" limit={8} />
 *
 * Keyless by default (demo fixtures). For a live PUBLIC page, pass `baseUrl`
 * pointing at a proxy — do NOT pass a raw `td_live_` key to the browser.
 */

import { useEffect, useRef, createElement, type CSSProperties } from 'react';
import { mountWidget, type WidgetConfig, type WidgetDef } from './widgets/base.js';
import { flowTape, marketVitals, gammaChip, ivRankStrip, sectorHeatmap } from './widgets/registry.js';

export type { WidgetConfig } from './widgets/base.js';
export { registry, widgetNames } from './widgets/registry.js';
export { mount } from './mount.js';
export type { MountOptions } from './mount.js';
export { getClient, type ClientConfig } from './data.js';

export interface TDWidgetProps extends WidgetConfig {
  /** Passthrough to the host div (className, style, id …). */
  className?: string;
  style?: CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useWidget(def: WidgetDef<any>, props: TDWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { className, style, ...config } = props;
  const dep = JSON.stringify(config);
  useEffect(() => {
    if (!ref.current) return;
    const handle = mountWidget(ref.current, def, config);
    return () => handle.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);
  return { ref, className, style };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeComponent(def: WidgetDef<any>) {
  return function TDWidget(props: TDWidgetProps) {
    const { ref, className, style } = useWidget(def, props);
    return createElement('div', { ref, className, style });
  };
}

export const TDFlowTape = makeComponent(flowTape);
export const TDMarketVitals = makeComponent(marketVitals);
export const TDGammaChip = makeComponent(gammaChip);
export const TDIvRankStrip = makeComponent(ivRankStrip);
export const TDSectorHeatmap = makeComponent(sectorHeatmap);
