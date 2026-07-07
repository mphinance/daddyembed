/**
 * theme.ts — scoped design tokens + the base CSS every widget shares.
 *
 * Widgets render into a Shadow root, so these styles never leak to (or inherit
 * from) the host page. Tokens follow DaddyBoard's palette; `data-theme="light"`
 * on the wrapper flips them. Tier/sentiment accent colors match the SDK
 * fixtures (e.g. LEGENDARY `#f59e0b`).
 */

export type ThemeName = 'dark' | 'light';

/** Injected once per Shadow root. Per-widget CSS is appended after this. */
export const baseCss = `
:host { all: initial; }
* { box-sizing: border-box; }

.td {
  --td-bg: #0d1117;
  --td-panel: #161b22;
  --td-panel-2: #1c2129;
  --td-border: #30363d;
  --td-text: #e6edf3;
  --td-muted: #8b949e;
  --td-bull: #3fb950;
  --td-bear: #f85149;
  --td-neutral: #8b949e;
  --td-accent: #58a6ff;
  --td-radius: 10px;
  --td-shadow: 0 1px 3px rgba(0,0,0,.4);

  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--td-text);
  background: var(--td-bg);
  border: 1px solid var(--td-border);
  border-radius: var(--td-radius);
  box-shadow: var(--td-shadow);
  overflow: hidden;
  display: block;
  width: 100%;
  font-size: 13px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
}
.td[data-theme="light"] {
  --td-bg: #ffffff;
  --td-panel: #f6f8fa;
  --td-panel-2: #eef1f4;
  --td-border: #d0d7de;
  --td-text: #1f2328;
  --td-muted: #656d76;
  --td-bull: #1a7f37;
  --td-bear: #cf222e;
  --td-neutral: #656d76;
  --td-accent: #0969da;
  --td-shadow: 0 1px 3px rgba(140,149,159,.25);
}

.td-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; padding: 9px 12px;
  border-bottom: 1px solid var(--td-border);
  background: var(--td-panel);
}
.td-title { font-weight: 650; font-size: 12px; letter-spacing: .2px; }
.td-title .sym { color: var(--td-accent); }
.td-live { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; color: var(--td-muted); text-transform: uppercase; letter-spacing: .5px; }
.td-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--td-muted); }
.td-dot.open { background: var(--td-bull); box-shadow: 0 0 0 0 rgba(63,185,80,.7); animation: td-pulse 2s infinite; }
@keyframes td-pulse { 0%{box-shadow:0 0 0 0 rgba(63,185,80,.6)} 70%{box-shadow:0 0 0 6px rgba(63,185,80,0)} 100%{box-shadow:0 0 0 0 rgba(63,185,80,0)} }

.td-body { padding: 4px 0; }

.td-foot {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 12px; border-top: 1px solid var(--td-border);
  background: var(--td-panel); font-size: 10px; color: var(--td-muted);
}
.td-foot a { color: var(--td-muted); text-decoration: none; font-weight: 600; }
.td-foot a:hover { color: var(--td-accent); }

.td-badge { display: inline-block; padding: 1px 6px; border-radius: 5px; font-size: 10px; font-weight: 700; letter-spacing: .3px; }
.td-call { color: var(--td-bull); background: color-mix(in srgb, var(--td-bull) 15%, transparent); }
.td-put { color: var(--td-bear); background: color-mix(in srgb, var(--td-bear) 15%, transparent); }
.pos { color: var(--td-bull); }
.neg { color: var(--td-bear); }
.mut { color: var(--td-muted); }
.mono { font-variant-numeric: tabular-nums; }

.td-skel { padding: 14px 12px; display: grid; gap: 8px; }
.td-skel i { display:block; height: 12px; border-radius: 5px; background: linear-gradient(90deg,var(--td-panel) 0%,var(--td-panel-2) 50%,var(--td-panel) 100%); background-size: 200% 100%; animation: td-shimmer 1.3s infinite; }
.td-skel i:nth-child(2){width:82%} .td-skel i:nth-child(3){width:64%}
@keyframes td-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

.td-err { padding: 16px 12px; color: var(--td-muted); font-size: 12px; text-align: center; }
.td-err b { color: var(--td-text); display:block; margin-bottom: 3px; }
`;
