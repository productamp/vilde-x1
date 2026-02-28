# Phase 4 — Vite Dev Server

**Status: Implemented**

Wire the scaffold template into the app and auto-start a Vite dev server so React projects get live HMR preview.

## What was built

### 1. Vite Server Manager (`src/main/lib/preview/vite-dev-server.ts`)

New file mirroring the static preview server's `ensure/cleanup` pattern.

**Exports:**
- `hasViteConfig(rootPath)` — checks for `vite.config.{ts,js,mjs}`
- `ensureViteDevServer(rootPath)` — starts or returns cached Vite server
- `killViteDevServer(rootPath)` — kills a specific Vite server
- `cleanupViteDevServers()` — kills all Vite servers (app quit)

**Key details:**
- Spawns `npx vite` directly (not `npm run dev`) to avoid orphaned grandchild processes
- Uses `detached: true` + `process.kill(-pid)` to kill the entire process group
- Sets `NO_COLOR=1` and `FORCE_COLOR=0` in spawn env so Vite's stdout is parseable (no ANSI escape codes)
- Pre-checks for `node_modules` before spawning — clear error message if missing
- 30-second startup timeout
- Same Map-based dedup pattern as `preview-server.ts`

### 2. Preview router (`src/main/lib/trpc/routers/preview.ts`)

`ensureForChat` now detects `vite.config.ts` in the worktree:
- If found → `ensureViteDevServer()`
- If not → `ensurePreviewServer()` (static, same as before)

Returns the same `{ baseUrl, port, rootPath }` shape — frontend unchanged.

### 3. Lifecycle cleanup

- **App quit** (`src/main/index.ts`): `cleanupViteDevServers()` added to `before-quit` handler
- **Chat archive** (`src/main/lib/trpc/routers/chats.ts`): `killViteDevServer()` in `archive` procedure
- **Chat archive batch**: `killViteDevServer()` in `archiveBatch` procedure
- **Chat delete**: `killViteDevServer()` in `delete` procedure

### 4. No frontend changes needed

- Preview iframe already loads whatever URL the router returns
- Vite HMR works natively (injects WebSocket client into the page)
- `staleTime: Infinity` on the query is fine — Vite stays running for chat lifetime

## Files modified

| File | Action |
|------|--------|
| `src/main/lib/preview/vite-dev-server.ts` | **Created** |
| `src/main/lib/trpc/routers/preview.ts` | **Modified** — Vite detection |
| `src/main/index.ts` | **Modified** — cleanup on quit |
| `src/main/lib/trpc/routers/chats.ts` | **Modified** — cleanup on archive/delete |

## Out of scope (Phase 5)

- Template copying into new project directories
- Auto `npm install` / `bun install`
- New project creation flow

Phase 4 assumes the template is already in the project directory with deps installed.

## Verification

1. `cd app && bun run dev` — start the Electron app
2. Open a project that has the scaffold template (with `vite.config.ts` and `node_modules`)
3. Create/open a chat for that project
4. Click the Preview tab — should show the Vite dev server output (React app)
5. Edit a React component — HMR should update the preview live
6. Archive the chat — Vite process should be killed (`ps aux | grep vite`)
7. Quit the app — all Vite processes should be cleaned up
