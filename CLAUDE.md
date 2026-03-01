# ProductVibe x2

**What:** A super simple desktop app for non-technical people to create, publish, and maintain websites by chatting. Halfway between raw ChatGPT and full-blown Lovable — affordable, dead simple, good enough results.

**App:** 1Code (Apache 2.0) — cloned into `app/`. This is the working codebase.
**Product:** `product/brief.md` (vision, target, architecture), `product/plan.md` (principles, sequence), `product/notes/` (research), `product/references/` (Dyad, Open Lovable).

## Quick start

```bash
cd app
bun install
bun run dev
```

## Development sequence

See `product/plan.md` for full details.

| Phase | Name | What | Status | Comment |
|-------|------|------|--------|---------|
| 0 | Setup | Build and run the app | Done | |
| 1 | Feature flag | Feature flag system, bypass auth requirement | Done | |
| 2 | First working loop | Static server + preview URL mapping | Done | |
| 3 | Scaffold starter | Default project template (shadcn) | Done | |
| 4 | Vite dev server | Auto-detect Vite, dev server with HMR | Done | |
| 5 | New project flow | Create project, scaffold, install, preview | Done | |
| 6 | UI polish and simplification | Hide dev UI, simplify messages | In progress | |
| 6b | File viewer layout simplification | Merge file viewer into the same panel | Done | |
| 7 | Onboarding | Simplified setup for non-technical users | Not started | |
| 8 | Publishing | One-click deploy to live URL | Not started | |
| 9 | Scaffold optimisation | Smarter defaults, prompt-aware templates | Not started | |
| 10 | Gemini support | Add Gemini as AI engine | Not started | |

## Key files in app (1Code)

- `src/renderer/features/agents/ui/agent-preview.tsx` — Live preview component (612 LOC). **Start here** for preview URL changes.
- `src/renderer/features/agents/main/active-chat.tsx` — Main chat component
- `src/main/lib/trpc/routers/claude.ts` — Claude SDK integration
- `src/main/lib/db/schema/index.ts` — Database schema
- `src/renderer/features/agents/atoms/index.ts` — UI state atoms
- `electron.vite.config.ts` — Build config

## Dev commands

```bash
cd app
bun run dev              # Start Electron with hot reload
bun run build            # Compile app
bun run package:mac      # Build macOS (DMG + ZIP)
bun run db:generate      # Generate migrations from schema
bun run db:push          # Push schema directly (dev only)
```

## Conventions

- Components: PascalCase (`ActiveChat.tsx`)
- Utilities/hooks: camelCase (`useFileUpload.ts`)
- Stores: kebab-case (`sub-chat-store.ts`)
- Atoms: camelCase with `Atom` suffix (`selectedAgentChatIdAtom`)
- IPC: tRPC with `trpc-electron` (type-safe main <-> renderer)
- State: Jotai (UI), Zustand (persisted), React Query (server via tRPC)
