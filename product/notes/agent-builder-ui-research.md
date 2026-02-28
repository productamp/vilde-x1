# Agent Builder UI: Open-Source Desktop Apps

**Date:** 2026-02-28
**Context:** Researching open-source AI coding agent desktop UIs — Electron and Tauri apps that wrap Claude Code, Codex, or similar CLI tools. Evaluating as potential bases for ProductVibe (landing page builder for non-technical users).

**Requirement:** Lightweight, smooth, well-architected, consumer-grade quality.

**Code cloned to:** `/Users/ai/lab/agent-builder-ui/`

---

## Four options

Two as potential fork starters, two as pattern references:

| Project | Role | Framework | Size | License | Stars |
| --- | --- | --- | --- | --- | --- |
| **1Code** | Fork starter | Electron + Vite + Bun | 41MB | Apache 2.0 | 4.4k |
| **CodePilot** | Fork starter | Electron + Next.js 16 | 9.3MB | MIT | 2.4k |
| **Dyad** | Pattern reference | Electron + Vite + React 19 | 20MB | Apache 2.0 / FSL | 1M+ downloads |
| **Open Lovable** | Pattern reference | Next.js (web-only) | small | MIT | 24.3k |

---

## Fork starters

### 1Code (top candidate)

- https://github.com/21st-dev/1codehttps://github.com/21st-dev/1codehttps://github.com/21st-dev/1code**GitHub:** https://github.com/21st-dev/1code
- **Framework:** Electron
- **Tech stack:** Bun, Vite, Tailwind, Claude Code SDK, Drizzle ORM
- **Stars:** 4.4k
- **License:** Apache 2.0
- **Backed by:** YC
- **Repo size:** 41MB
- **Structure:** Single app (not monorepo)

Uses the official Claude Code SDK — the sanctioned way to build on top of Claude Code. Cursor-like UI with diff previews, built-in git client, worktree isolation. Supports both Claude Code and Codex. Most Lovable-like UX of the bunch. Much smoother than Dyad.

**Why fork this:**
- Official Claude Code SDK integration (right way to build)
- Closest to Lovable UX of all candidates
- Single app structure — easier to fork than monorepos
- Apache 2.0 — clean for closed-source derivative
- Active development, YC-backed, 62 releases

**Work to strip down:**
- Remove worktrees, diff previews, git client
- Simplify or remove Drizzle DB layer
- Simplify UI for non-technical users
- Scope down to landing pages / websites only

### CodePilot (lightweight alternative)

- https://github.com/op7418/CodePilothttps://github.com/op7418/CodePilothttps://github.com/op7418/CodePilot**GitHub:** https://github.com/op7418/CodePilot
- **Framework:** Electron
- **Tech stack:** Next.js 16, Claude Agent SDK, SQLite, shadcn/ui, Tailwind CSS 4
- **License:** MIT
- **Repo size:** 9.3MB (smallest of all)
- **Structure:** Single app

Clean chat UI, hidden title bar, auto-update. Uses Claude Agent SDK. Significantly leaner codebase — 4x smaller than 1Code.

**Why fork this:**
- Smallest codebase — least to strip out
- MIT license (most permissive)
- Clean, minimal UI already close to consumer-grade
- Uses official Claude SDK integration

**Concerns:**
- Next.js bundled as standalone server inside Electron adds some weight
- Less polished and mature than 1Code
- Fewer features to build on

---

## Pattern references

Not viable as fork bases, but worth studying for UX patterns and approaches.

### Dyad (UX patterns, not code)

- https://github.com/dyad-sh/dyadhttps://github.com/dyad-sh/dyadhttps://github.com/dyad-sh/dyad**GitHub:** https://github.com/dyad-sh/dyad
- **Repo size:** 20MB | **LOC:** ~115K | **Files:** ~562
- **Framework:** Electron + Vite + React 19
- **License:** Apache 2.0 (main) + FSL 1.1 (src/pro/) — dual license
- **AI integration:** Vercel AI SDK (@ai-sdk/anthropic, openai, google) — multi-provider
- **DB:** SQLite via Drizzle ORM, 29 migration directories

Most Lovable-like desktop app in terms of feature scope (chat, preview, file explorer, multi-provider). 1M+ downloads proves the concept works. But code quality is terrible — extremely slow, buggy, bad UX. Already confirmed through hands-on prototype.

**Study for:**
- https://github.com/eigent-ai/eigent. Feature set and UX flow (what a Lovable clone desktop app needs)
- Multi-provider AI integration pattern (Vercel AI SDK)
- Preview pane implementation
- Project scaffolding approach

**Why not fork:**
- https://github.com/different-ai/openwork. Terrible code quality — extremely slow, buggy, bad UX
- Dual license (FSL for pro features) complicates forking
- 115K LOC, 84 React components, 60+ hooks, 60+ IPC handlers — heavily bloated
- Complex monorepo with packages, workers, shared utils
- Estimated 2-5 weeks to strip down

### Open Lovable (UX patterns, closest to Lovable)

- https://github.com/firecrawl/open-lovablehttps://github.com/firecrawl/open-lovablehttps://github.com/firecrawl/open-lovable**GitHub:** https://github.com/firecrawl/open-lovable
- **Framework:** Next.js (web-only, no desktop)
- **Tech stack:** Next.js, React, Tailwind CSS, Firecrawl API, direct LLM API calls (Gemini, Claude, OpenAI, Groq)
- **Stars:** 24.3k
- **License:** MIT
- **Repo size:** small (~59 commits)
- **Language:** 94.9% TypeScript
- **Sandbox:** Vercel (default) or E2B

Most popular repo of the lot (24.3k stars). Chat-to-React-app builder — closest to actual Lovable's concept and UX.

**Study for:**
- Chat-to-app UX flow (the gold standard reference)
- Prompt engineering patterns for code generation
- Preview and iteration UX
- How Lovable-like products handle project state

**Why not fork:**
- https://github.com/aofp/yumeWeb-only — no desktop app, would need Electron wrapper built from scratch
- Uses direct API calls, not Claude Code SDK — different integration model
- Requires Firecrawl API dependency (external service)
- Sandbox execution via Vercel/E2B — not local CLI-based

---

## Rejected (wrong direction)

| Project | Framework | Why rejected |
| --- | --- | --- |
| **opcode / Claudia** | Tauri 2 + Rust | AGPL-3.0 license (dealbreaker for closed-source). Requires Rust. |
| **Eigent** | Electron + FastAPI (Python) | Wrong paradigm (agent orchestration IDE). 87MB. Needs Python backend. |
| **OpenWork** | Tauri + Solid.js | 134MB, Solid.js (not React), 10-package monorepo, OpenCode SDK (not Claude). |
| **Yume** | Tauri 2 + React 19 | Too large to clone. Developer-focused, 4-agent orchestration, overkill. |
| **claude-code-gui** | Tauri + React + TS | Too immature. |

---

## Build hypotheses

Three approaches to building ProductVibe, each with a different base + reference pairing:

### H1: Dyad base + 1Code reference (done)

- **Base:** Dyad fork
- **Reference:** 1Code for code quality patterns
- **Status:** Already tested. Works, but bad UX, slow, bloated.
- **Verdict:** Proven that the concept works. Not viable as production foundation.

### H2: Open Lovable base + CodePilot reference — STUDIED

- **Base:** Open Lovable (chat-to-app UX, closest to Lovable)
- **Reference:** CodePilot (Electron shell, Claude SDK integration)
- **Approach:** Take the Lovable-like web UI and wrap in Electron, swap API calls for Claude Code SDK.
- **Feasibility:** 6/10
- **Effort:** 4-5 weeks

**Findings:**
- Open Lovable is Next.js 15 with 28 API routes — needs a server, can't export static
- AI layer uses Vercel AI SDK (streamText) — medium effort to swap for Claude Code SDK
- **Critical blocker: cloud sandbox.** All code execution runs on Vercel/E2B cloud sandboxes. Replacing with local execution = 2-3 weeks of the hardest, riskiest work.
- Firecrawl deeply integrated — needs replacing with Playwright/Puppeteer (1 week)
- State is in-memory only (global variables) — needs database added
- Electron wrapper must be built from scratch
- Total: ~4-5 weeks, with the sandbox rewrite being 50% of the effort

**Verdict:** Viable but expensive. The cloud-to-local sandbox rewrite dominates the timeline and is high-risk.

### H3: CodePilot base + Open Lovable reference — STUDIED (add-features framing)

- **Base:** CodePilot (lean Electron app, Claude SDK already working)
- **Reference:** Open Lovable (UX patterns for chat-to-app flow)
- **Approach:** Keep everything. Add features to make it Lovable-like.
- **Effort:** 1-2 weeks

**What CodePilot already has:**
- ✅ Chat input (advanced — attachments, model selector)
- ✅ Claude Agent SDK (936 LOC, rock-solid, streaming, permissions, session resume)
- ✅ Electron 40 (861 LOC, clean lifecycle)
- ✅ SQLite database (sessions, messages, settings, tasks)
- ✅ File explorer (right panel, tree view)
- ✅ File preview with iframe (renders HTML)
- ✅ Multi-session support, streaming, real-time events
- 107 components, ~35K LOC, TypeScript throughout

**What to ADD:**
- ❌ **Live website preview** — has file preview (iframe) but NOT live site preview. Must build WebView component to show running website. **16-24 hours — biggest item.**
- ❌ Dev server auto-start and port detection
- ❌ Landing page templates / simplified onboarding
- ❌ Default "landing page mode" (hide developer UI)

**Verdict:** Viable. All plumbing solved. But the **live preview must be built from scratch** — CodePilot only previews individual files, not running websites.

### H4: 1Code base + Open Lovable reference — STUDIED (add-features framing)

- **Base:** 1Code (Electron, Claude Code SDK, YC-backed, most feature-rich)
- **Reference:** Open Lovable (chat-to-app UX patterns)
- **Approach:** Keep everything. Add features to fill gaps for landing page builder.
- **Effort:** 2-3 weeks

**What 1Code already has (all 7 MVP features):**
- ✅ Chat input (rich — attachments, voice input, @mentions, slash commands)
- ✅ Claude Code SDK (multi-agent support, Claude + Codex)
- ✅ **Live preview pane** — `agent-preview.tsx` (612 LOC), production-ready iframe with responsive viewport emulation, device presets, URL bar, reload, zoom. **This is the key differentiator vs CodePilot.**
- ✅ Iterate via chat (forking, message queue, sub-chats)
- ✅ File explorer (tree view, grouped view, Cmd+P search, syntax highlighting)
- ✅ Project save/load (SQLite + Drizzle ORM, full project management)
- ✅ Onboarding (multi-step, auto-skip if CLI detected)

**What to ADD:**
- ❌ Auto-start dev server (detect `package.json`, run `npm dev`, health check) — 3-5 days
- ❌ Local preview URL mapping (swap `getSandboxPreviewUrl()` cloud URLs for `localhost`) — 1-2 days
- ❌ Simplified onboarding for non-developers — 3-5 days
- ❌ Hide developer UI (git, terminal, MCP, PRs) behind `productVibeMode` flag — 2-4 days
- ❌ Static HTML serving (sites without `package.json`) — 2-3 days
- ❌ Simplified message views (hide tool calls, diffs) — 2-3 days

**1Code's critical advantage:** The live preview component is already production-ready — viewport modes, responsive emulation, reload, URL navigation, mobile/desktop switching. This would take 2-3 weeks to build from scratch. CodePilot doesn't have it.

**Verdict:** ~70% complete for MVP. Remaining 30% is mostly UI hiding and dev server automation. The preview pane is the biggest win.

### H5: 1Code base + Dyad reference — STUDIED (add-features framing)

- **Base:** 1Code (Electron, Claude Code SDK, YC-backed)
- **Reference:** Dyad (feature set and UX flow for desktop Lovable clone)
- **Approach:** Same as H4 but use Dyad's Lovable-like patterns as the UX reference instead of Open Lovable.
- **Effort:** 2-3 weeks (same as H4)

Same features to add as H4. The difference is the UX reference:
- **H4 reference (Open Lovable):** Web-native chat-to-app flow, cleanest Lovable UX
- **H5 reference (Dyad):** Desktop-native Lovable clone, proven feature set for Electron

Dyad is the more relevant reference for a desktop app — it already solved the "Lovable in Electron" UX challenge, even if the code is bad. Open Lovable is web-first and some patterns won't translate to desktop.

**Verdict:** Same effort as H4. Dyad is arguably the better UX reference for a desktop app, but carries risk of copying bad design decisions along with good ones.

### Comparison (add-features framing)

|  | H2: OL base | H3: CodePilot | H4: 1Code + OL | H5: 1Code + Dyad |
| --- | --- | --- | --- | --- |
| **Effort** | 4-5 weeks | 1-2 weeks | 2-3 weeks | 2-3 weeks |
| **Confidence** | 6/10 | 8/10 | 9/10 | 9/10 |
| **Live preview** | Has it (cloud) | ❌ Must build | ✅ Already built | ✅ Already built |
| **Claude SDK** | Must replace | ✅ Working | ✅ Working | ✅ Working |
| **Electron** | Must build | ✅ Built | ✅ Built | ✅ Built |
| **Database** | Must add | ✅ SQLite | ✅ Drizzle + SQLite | ✅ Drizzle + SQLite |
| **Features to add** | Sandbox rewrite, Electron, DB, Firecrawl swap | Preview WebView, dev server, templates | Dev server, onboarding, UI hiding | Dev server, onboarding, UI hiding |
| **Biggest gap** | Cloud → local sandbox | Build preview from scratch | Dev server auto-start | Dev server auto-start |
| **Codebase** | small | 9.3MB | 41MB | 41MB |

### Decision (LOCKED)

**H4/H5 hybrid — 1Code base, reference both Open Lovable and Dyad.**

- **Base:** 1Code (Apache 2.0, Electron, Claude Code SDK) — ~70% complete for ProductVibe MVP
- **References:** Dyad (desktop UX patterns) + Open Lovable (chat-to-app UX polish) — kept in lab for reference
- **Lab repos:** `/Users/ai/lab/agent-builder-ui/` — 1code (base), dyad (ref), open-lovable (ref)
- **Discarded:** CodePilot (too lean, no preview), Eigent, OpenWork, opcode, Yume

**Output stack (LOCKED):**

| Tier | Stack | Design System | Use case |
|------|-------|---------------|----------|
| **Default** | HTML + Tailwind + DaisyUI | DaisyUI themes + components | Landing pages, simple sites |
| **Advanced** | Vite + React + Tailwind + shadcn | shadcn components | Interactive sites, dynamic content |

DaisyUI is the shadcn equivalent for plain HTML — polished component classes on Tailwind, 30+ themes, no React/build step needed. Claude generates it well. Vite+React+shadcn reserved for when users need interactivity.

**Key insight:** 1Code already has the live preview pane (`agent-preview.tsx`, 612 LOC). Standard iframe, technology-agnostic. Swap `getSandboxPreviewUrl()` from cloud to `localhost:{port}`. This was CodePilot's biggest gap.
