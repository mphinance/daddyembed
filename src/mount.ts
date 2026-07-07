/** mount.ts — resolve a widget by name and mount it. Shared by UMD + React. */

import { mountWidget, type WidgetConfig, type WidgetHandle } from './widgets/base.js';
import { registry } from './widgets/registry.js';

export interface MountOptions extends WidgetConfig {
  /** Which widget to render (registry key). */
  widget: string;
}

export function mount(target: HTMLElement, options: MountOptions): WidgetHandle {
  const { widget, ...config } = options;
  const def = registry[widget];
  if (!def) {
    throw new Error(`DaddyEmbed: unknown widget "${widget}". Known: ${Object.keys(registry).join(', ')}`);
  }
  return mountWidget(target, def, config);
}
