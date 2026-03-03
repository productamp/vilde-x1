# Refactor Opportunities (Main)

## Context

Current renderer output indicates structural coupling and over-bundling:

- Main renderer entry bundle: `app/out/renderer/assets/index-BDE9tDiQ.js` (~15.46 MB)
- Secondary renderer entry: `app/out/renderer/assets/index-CJ2clhw9.js` (~0.82 MB)
- Total JS in `out/renderer/assets`: ~58.56 MB
- Build required increased heap to complete (`NODE_OPTIONS=--max-old-space-size=8192`)

This is not a single-file problem. The bundle size is a downstream effect of architecture and feature boundaries in source.

---

## P0 — Monolith Decomposition (Highest Impact)

### 1) Split `active-chat.tsx` into feature islands

**Why it matters**
- `app/src/renderer/features/agents/main/active-chat.tsx` is ~8k LOC and aggregates many unrelated concerns (chat orchestration, diff UI, file viewer, terminal, queue, sidebars, plan flow).
- Large import surface and broad state subscriptions force high churn and limit code-splitting.

**Refactor direction**
- Extract into separate containers:
  - `chat-controller` (transport/send/retry)
  - `diff-controller` + lazy diff pane
  - `file-viewer-controller` + lazy viewer
  - `terminal-controller` + lazy terminal
  - `input-controller` + queue handling
- Keep a thin orchestrator component that composes these children.

**Expected outcome**
- Smaller initial renderer chunk.
- Reduced re-render blast radius.
- Easier incremental optimization and testing.

### 2) Introduce hard lazy boundaries for heavy features

**Why it matters**
- Diff/file viewer/terminal features are reachable from primary app paths and currently contribute to a heavy initial payload.

**Refactor direction**
- Use route/feature-level lazy imports for:
  - Diff view stack
  - Monaco-based file viewer
  - Terminal stack (`xterm` addons)
  - Mermaid-heavy blocks/components
- Load only when pane/dialog is opened.

**Expected outcome**
- Faster first paint and interaction.
- Better memory profile at startup.

---

## P1 — Startup and Runtime Performance

### 3) Remove eager syntax highlighter preload from app boot

**Why it matters**
- `app/src/renderer/main.tsx` preloads diff highlighter on startup.
- Shiki loader initializes with broad theme/language defaults.

**Refactor direction**
- Remove boot-time preload.
- Initialize highlighter on first diff/code-highlight usage.
- Reduce default preloaded languages/themes to minimal set.

**Expected outcome**
- Lower startup CPU/memory.
- Less up-front work for users who never open diff-heavy views.

### 4) Reduce synchronous localStorage hydration pressure

**Why it matters**
- Many atoms use `getOnInit: true`, causing synchronous storage reads during boot.
- `window-storage` migration path may scan `localStorage` keys during reads.

**Refactor direction**
- Keep `getOnInit: true` only for truly critical UI state.
- Defer non-critical persisted state hydration until after initial render.
- Run one migration pass once, then stop key-scanning in hot paths.

**Expected outcome**
- Smoother startup.
- Fewer synchronous stalls during initial mount.

---

## P1 — Main Process Responsiveness and Safety

### 5) Replace blocking sync IO/exec in interactive paths

**Why it matters**
- Main-process sync calls (`readFileSync`, `writeFileSync`, `execSync`, `which/where`, shell probes) can block Electron’s event loop.

**Refactor direction**
- Move to async equivalents (`fs/promises`, `spawn`/`execFile`) where possible.
- Cache resolved binary paths/env probes.
- Move expensive discovery (theme scans, shell env capture) off critical interaction paths.

**Expected outcome**
- Lower UI jank risk from main-process stalls.
- More predictable responsiveness under load.

---

## P2 — Codebase Simplification and Maintenance

### 6) Consolidate duplicated icon packs

**Why it matters**
- `components/ui/icons.tsx` and `components/ui/canvas-icons.tsx` heavily overlap and are both large.

**Refactor direction**
- Merge into a single source with explicit export groups.
- Remove dead/duplicate icon exports after usage scan.

**Expected outcome**
- Smaller maintenance surface.
- Cleaner import conventions.

### 7) Clean dynamic-vs-static import inconsistencies

**Why it matters**
- Some modules are both statically and dynamically imported (e.g., analytics), which defeats chunk-splitting intent.

**Refactor direction**
- Decide module-by-module:
  - startup-critical => static import
  - optional/late => dynamic import only
- Eliminate mixed patterns.

**Expected outcome**
- Clearer loading model.
- More reliable chunking.

---

## Suggested Implementation Slices

### Slice A (1-2 PRs): Fast wins
- Remove highlighter preload from startup.
- Add lazy loading around diff/file-viewer/terminal surfaces.
- Measure bundle deltas after each PR.

### Slice B (2-4 PRs): `active-chat` decomposition
- Extract controllers one by one with no behavior changes.
- Keep integration tests/smoke flows passing between extractions.

### Slice C (1-2 PRs): startup hydration cleanup
- Audit all `getOnInit` atoms.
- Gate non-critical hydration and simplify migration path.

### Slice D (1-3 PRs): main-process blocking calls
- Replace sync calls in high-traffic handlers first.
- Add lightweight timing logs around slow operations.

---

## Success Metrics

Track after each slice:

- Renderer initial JS entry size (`index-*.js`)
- Total renderer JS size
- Cold start time to interactive
- Memory usage after initial load
- Build reliability without custom Node heap overrides

