# ProductVibe — Plan

## Target

Non-technical small business people who need a website.

Yoga studio owners. Airbnb property managers. Local service businesses. Freelancers. Coaches.

They've heard AI can build websites. They can't afford a developer. They don't have energy to learn tools. They want to chat, see a result, publish, done.

They already pay for ChatGPT or have a Google account. They know HTML exists. They don't know what React is.

## Principles

1. **Chat and website. That's the whole app.** Everything else is hidden or gone.
2. **Works on first try.** No setup, no terminal, no CLI installs for the user to figure out.
3. **Hide, don't remove.** 1Code features stay — developer UI goes behind a flag. We can always bring it back.
4. **One stack.** Every project is Vite + React + Tailwind + shadcn + React Router. Builds to static HTML for publishing.
5. **The preview is the product.** If the user can't see their website live as they chat, nothing else matters.
6. **Cheap to run.** Users bring their own AI CLI — Claude Code, Codex, Gemini CLI. We wrap the CLI, not the API. No API keys, no token billing, no subscription tax on top.

## Sequence

| Phase | Name | What | Status |
|-------|------|------|--------|
| 0 | Setup | Build and run the app | Done |
| 1 | Feature flag | Feature flag system, bypass auth requirement | Done |
| 2 | First working loop | Static server + preview URL mapping | Done |
| 3 | Scaffold starter | Default project template (shadcn) | Done |
| 4 | Vite dev server | Auto-detect Vite, dev server with HMR | Done |
| 5 | New project flow | Create project → scaffold → install → preview | Done |
| 6 | UI polish and simplification | Hide dev UI | Done |
| 6b | File viewer layout simplification | Merge file viewer into the same panel | Done |
| 7 | Workspace-to-projects | Rename "Workspace" to "Projects" and rework project management UX | Not started |
| 8 | Onboarding | Simplified setup for non-technical users | Not started |
| 9 | Publishing | One-click deploy to live URL | Not started |
| 10 | Scaffold optimisation | Smarter defaults, prompt-aware templates | Not started |
| 11 | UI and settings simplification | Simplify message views, hide developer tabs | Not started |
| 12 | Gemini support | Add Gemini as AI engine | Not started |

### Phase 0 — Setup

Get the app running.

- [x] **Build and run** — `bun install`, `bun run dev`, verify 1Code starts clean

### Phase 1 — Feature flag

Add the feature flag system and use it to bypass auth/onboarding requirements.

- [x] **Feature flag system** — add `productVibeMode` flag (atom + persistence). Single boolean that all UI hiding checks against.
- [x] **Flag toggle** — dev-only way to switch between 1Code mode and ProductVibe mode
- [x] **Bypass auth** — feature flag out the auth requirement for onboarding and usage. When `productVibeMode` is on, skip login/signup gates entirely.

## Feature Flagged Items

Current items gated behind `productVibeMode`:

- Desktop auth and login screen
- Account/provider onboarding entry flow
- Remote auth-backed team and automation queries
- Worktree setup banner in new chat
- Worktree setup section in project settings

### Phase 2 — First working loop

Get one end-to-end flow working: user chats, Claude generates HTML, preview shows it.

Important implementation note:

- **Preview should run through a local web server, not read `index.html` directly.** The sidebar can stay an iframe UI, but it should load `http://127.0.0.1:{port}/` from a tiny static server serving the current project/worktree directory. This is the simplest correct approach because relative CSS/JS/assets and normal page navigation work automatically. Directly reading `index.html` would break linked assets, scripts, images, and multi-page navigation.

- [x] **Static file server** — serve HTML/CSS/JS from project directory, no `package.json` needed
- [x] **Preview URL mapping** — swap `getSandboxPreviewUrl()` from cloud sandbox to `localhost:{port}`
- [x] **Verify the loop** — chat → generate HTML+DaisyUI → static server → preview pane shows it live

This is the minimum demoable prototype.

Scope for this phase:

- Keep the existing preview sidebar UI
- Use a tiny local static server in Electron main process
- Default preview target is the current project/worktree folder
- `/` should resolve to `index.html`
- Relative assets like `styles.css`, `script.js`, images, and links to other HTML pages should work normally
- On file changes, reload the iframe

### Phase 3 — Scaffold starter

Build the default project template. Bundled into the app at `app/resources/templates/default/`.

- [x] **Scaffold template** — Vite+React+Tailwind+shadcn via `npx shadcn@latest create` + `npx shadcn@latest add --all`
- [x] **React Router** — BrowserRouter, Routes, layout with `<Outlet />`
- [x] **Landing page** — hero placeholder, sticky nav (Home, Blog)
- [x] **Blog plumbing** — markdown frontmatter parser, `marked`, `import.meta.glob`, blog listing + post pages
- [x] **Example blog post** — `content/blog/welcome.md`
- [x] **Clean up** — remove `node_modules/`, `bun.lock`, fix title, prose styles use shadcn tokens

### Phase 4 — Vite dev server

Auto-detect Vite projects and run a dev server for live preview with HMR. Assumes template is already in the project directory with deps installed.

- [x] **Auto-start Vite** — detect `vite.config.ts`, spawn `npx vite`, health check until port is ready
- [x] **Port detection** — parse Vite stdout for the local URL/port
- [x] **Preview mapping** — preview pane loads `localhost:{port}` from the running Vite dev server
- [x] **Auto `npm install`** — run `npm install` when `node_modules` is missing
- [x] **Lifecycle management** — stop dev server on chat archive/delete and app quit, kill entire process group
- [x] **HMR works** — Vite hot module replacement updates preview live as Claude edits files

### Phase 5 — New project flow

End-to-end flow for starting a new project. User clicks "New Project" → app scaffolds template → installs deps → starts dev server → preview shows the site.

- [x] **New project UI** — "Create new project" button + name input on SelectRepoPage and ProjectSelector dropdown (gated behind `productVibeMode`)
- [x] **Copy template on project create** — `createFromTemplate` tRPC mutation copies `resources/templates/default/` to `~/.21st/projects/{name}/`, filtering out `node_modules`/lockfiles
- [x] **Auto `npm install`** — `ensureDepsInstalled()` runs `npm install` when `node_modules` is missing before starting Vite
- [x] **Auto-start Vite** — Vite dev server starts automatically via `ensureForChat` query, preview connects
- [x] **First chat prompt** — user sees starter site in preview and can immediately start chatting to customise it
- [x] **Template CLAUDE.md + AGENTS.md** — guides AI to work within existing React/shadcn setup, never create standalone HTML, never start/stop the dev server
- [x] **Dev server resilience** — auto-restart on unexpected crash (max 5 retries), refresh button re-ensures server is alive without killing it
- [x] **CLI resolution** — both Claude and Codex prefer system-installed CLI (`which claude`/`which codex`) over bundled binary, with bundled as fallback
- [x] **Template in extraResources** — bundled for production builds via electron-builder

### Phase 6 — UI polish and simplification

Strip the developer feel. Make it consumer-grade.

- [x] **Clean default layout** — chat left, preview right, global header above. Merged preview toolbar with tab pills into single row.
- [x] **Details tab hidden** — "Details" tab removed in ProductVibe mode. Preview is default, Files tab still accessible.
- [x] **Merged preview header** — pill tabs (Preview/Files) sit on the left, preview controls (refresh, viewport, scale, external link) on the right — single row, no separate tab bar when on Preview.
- [x] **Scale control simplified** — replaced text input with preset-only dropdown selector.
- [x] **Global header bar** — full-width header with traffic lights, product name, bottom divider. Window drag region.
- [x] **Hide terminal sidebar** — gate `<TerminalSidebar>` behind `!productVibeMode`
- [x] **Hide terminal bottom panel** — gate `<ResizableBottomPanel>` behind `!productVibeMode`
- [x] **Disable `Cmd+J`** — terminal toggle hotkey disabled in productVibeMode
- [x] **Disable `Cmd+P`** — file search hotkey disabled in productVibeMode

### Phase 6b — File viewer layout simplification

Simplify file browsing by consolidating the file viewer into one panel.

- [x] **Single-panel merge** — file tree (left) and file content viewer (right) render inside the same Files tab panel. No separate file viewer sidebar in ProductVibe mode.
- [x] **Unified panel behavior** — single header with Preview/Files pill tabs. File viewer header has "Open" dropdown (Finder, Terminal, Copy Path) and `...` options menu (Word Wrap, Minimap, Line Numbers). Minimap and line numbers default to off.
- [x] **Resizable file tree** — draggable divider between file tree and content viewer (default 192px / `w-48`, min 140px, max 500px).
- [x] **State continuity** — both tabs always mounted (hidden via CSS), preserving scroll position and search state when switching between Preview and Files.
- [x] **Toggle cleanup** — standalone file viewer sidebar, center-peek, and full-page modes disabled in ProductVibe mode. Close button and mode switcher hidden. File viewer is persistent (no Escape dismiss).
- [x] **Open in Terminal** — added `openInTerminal` tRPC endpoint (`open -a Terminal <dir>`) for file viewer context actions.

### Phase 7 — Workspace-to-projects

Adopt Lovable-style terminology and project management flow.

- [ ] **Terminology migration** — replace user-facing "Workspace" copy with "Projects" across sidebar, headers, dialogs, and empty states
- [ ] **Projects-first navigation** — make Projects the primary mental model (project switcher, recent projects, clear "New Project" entry)
- [ ] **Project management UX** — simplify create, switch, rename, archive, and delete flows for non-technical users
- [ ] **Project settings simplification** — focus on project name/path/status and hide developer-centric controls in `productVibeMode`
- [ ] **Compatibility layer** — keep internal IDs/worktree internals stable while updating labels and UX

### Phase 8 — Onboarding

Make the first 60 seconds work for someone who's never used a terminal.

- [ ] **Simplified onboarding flow** — no CLI jargon, no "install Claude Code" steps
- [ ] **API key setup** — guide user through getting and entering their key
- [ ] **First project creation** — "What kind of website do you want?" → scaffold → preview

### Phase 9 — Publishing

The other half of the value prop. Users need their site on the internet.

- [ ] **Research deploy targets** — Netlify, Vercel, GitHub Pages, built-in hosting
- [ ] **One-click publish** — from preview to live URL with minimal steps
- [ ] **Update flow** — chat to change → preview → re-publish

### Phase 10 — Scaffold optimisation

Improve the starter template based on what we've learned from real usage.

- [ ] **Smarter defaults** — pre-populate with layout, routing, and page structure that matches common user requests
- [ ] **Prompt-aware scaffolding** — tailor the starter based on what the user asks for ("blog", "portfolio", "landing page")
- [ ] **Template variants** — multiple starter templates for different site types
- [ ] **Reduce first-build time** — optimise dependencies, trim unused components, speed up `npm install`

### Phase 11 — UI and settings simplification

Simplify message views and hide developer-facing settings.

**Message views:**
- [ ] **Tool call blocks** — collapse all tool calls to a single subtle "Working..." indicator (no file names, diffs, shell output)
- [ ] **MCP tool calls** — hide entirely
- [ ] **File mentions** — hide inline file path references

**Settings tabs:**
- [ ] **Hide developer tabs** — MCP, Debug, Plugins, Skills, Custom Agents tabs hidden in `productVibeMode`
- [ ] **Simplify Models tab** — show only model picker, hide migration UI and advanced config
- [ ] **Simplify Beta tab** — show version info only, hide automations and subscription checks
- [ ] **Simplify Profile tab** — hide team features, show name/avatar only
- [ ] **Projects tab** — verify worktree section is already gated

### Phase 12 — Gemini support

Add Gemini as an AI engine option. Claude Code and Codex are already supported.

- [ ] **Gemini CLI integration** — wrap Gemini CLI the same way we wrap Claude Code and Codex
- [ ] **Engine selector** — choose your AI engine in settings
- [ ] **Blog content support** — generate and serve multi-page blog sites (posts, index, navigation)

---

## Appendix A — Phase 6 change list

### Principle

Two strategies. Choose per element:

- **Flag** — hide via `productVibeMode` check. The feature stays, the render is gated. Quick, safe, reversible. Use for anything that's fine as-is but not for end users.
- **Rework** — change the component behaviour or layout. Needed when hiding alone leaves a broken or confusing experience. More work, do only where necessary.

Everything below is gated on `productVibeMode === true`.

### Panels and sidebars

| Element | Strategy | File | Detail |
|---------|----------|------|--------|
| Terminal sidebar (right) | Flag | `active-chat.tsx` | Don't render `<TerminalSidebar>`. Keep internal terminal for silent ops. |
| Terminal bottom panel | Flag | `active-chat.tsx` | Don't render `<TerminalBottomPanelContent>` or `<ResizableBottomPanel>`. |
| Details sidebar (widgets) | Rework | `details-sidebar.tsx` | Done. "Details" tab hidden. Preview is default tab, Files tab kept. Pill tabs + preview controls merged into single header row. Resize handle fixed (removed `overflow:hidden` that clipped it). |
| Changes / diff panel | Flag | `active-chat.tsx` | Don't render `<ChangesPanel>`, `<DiffFullPageView>`, `<DiffSidebarHeader>`, `<DiffCenterPeekDialog>`. |
| File viewer sidebar | Flag | `active-chat.tsx` | Don't render file tree or file search dialog. Disable `Cmd+Shift+K`. |
| Sub-chats sidebar | Flag | `active-chat.tsx` | Hide. Non-technical users don't need parallel sub-chat threads. |
| Preview close button | Flag | `active-chat.tsx`, `details-sidebar.tsx` | Done. Hide `>>` close button, disable click-to-close on resize handle, hide resize tooltip. Applies to both unified sidebar (`details-sidebar.tsx`) and standalone preview (`active-chat.tsx`). Preview stays permanently open. |

### Header and toolbar

| Element | Strategy | File | Detail |
|---------|----------|------|--------|
| Git branch selector | Flag | `active-chat.tsx` ~L1786 | Hide branch dropdown, fetch/review/PR actions in chat header. |
| Workspace subtitle (repo • branch) | Flag | `active-chat.tsx` ~L4650 | Hide or replace with project name only. |
| Worktree path indicator | Flag | `active-chat.tsx` ~L4763 | Already partially gated. Verify hidden. |
| Terminal toggle button | Flag | `sub-chat-selector.tsx`, `active-chat.tsx` | Done. Hide terminal button from chat header. Hide `Cmd+J` hotkey. |
| File viewer toggle button | Flag | `active-chat.tsx` | Hide file explorer button from toolbar. |
| Details sidebar toggle button | Flag | `active-chat.tsx` ~L7662 | Done. Hide details/terminal sidebar toggle from chat header. |
| Token usage indicator | Flag | `chat-input-area.tsx` | Done. Hide `AgentContextIndicator` in ProductVibe mode. |
| Model selector | Rework | `chat-input-area.tsx`, `agent-model-selector.tsx` | Done. Icon-only mode (`iconOnly` prop), moved to right side of input actions. |
| Traffic lights (macOS) | Flag | `agents-layout.tsx`, `active-chat.tsx` | Done. Always visible in ProductVibe mode even when sidebar closed. Spacer added to chat header to prevent overlap. |

### Layout

| Element | Strategy | File | Detail |
|---------|----------|------|--------|
| Workspaces panel (column 1) | Keep | `agents-sidebar.tsx` | Keep for now. Project selector + new project flow lives here. |
| Chats panel (column 2) | Rework | `agents-content.tsx`, new component | Flag out the panel. Replace with a `CommandDialog` (shadcn) triggered by the existing clock icon in the chat header. Reuse the existing panel UI (search input, "New Chat" button, chat list items) inside the dialog — no redesign, just relocation. No separate `+` icon — clock is the single entry point for both history and creation. |
| Chat header icons | Rework | `active-chat.tsx` | Left side: clock icon only (opens chat CommandDialog). Right side: settings gear, preview toggle. All dev icons (terminal, file viewer, details sidebar) flagged out. Icons are fixed — no shifting since panel 2 doesn't exist. |
| Default layout | Rework | `active-chat.tsx`, `agents-content.tsx`, layout atoms | Done. Three-panel when sidebar open: workspaces (narrow), chat, preview. Two-panel when sidebar closed: chat, preview. Chat min-width `min-w-72` (288px). Details sidebar max-width uncapped. Preview header background matches chat (`bg-background`). Scale control is preset-only dropdown. |
| Global header bar | Rework | `product-vibe-header.tsx`, `agents-layout.tsx` | Done. Full-width header (`h-9`) with traffic lights + "ProductVibe" label + bottom divider. Window drag region. Sidebar/chat/preview render below it. Per-panel traffic light spacers and drag regions suppressed (`agents-sidebar.tsx`, `sub-chat-selector.tsx`). |
| Preview auto-open | Rework | `active-chat.tsx` ~L5788 | Currently skips auto-open in ProductVibe mode. Invert: always auto-open preview when `productVibeMode`. |
| Chat input | Rework | `chat-input-area.tsx` | Done (partial). Token usage hidden. Model selector icon-only and moved to right. File attach still visible (keep for now — users may want to attach screenshots). |

### Hotkeys

| Key | Strategy | Detail |
|-----|----------|--------|
| `Cmd+J` | Flag | Disable terminal toggle. |
| `Cmd+Shift+K` | Flag | Disable file search. |
| `Cmd+B` | Keep | Toggle left sidebar (useful). |

### Not in scope (Phase 6)

- Blog content support — moved to verification. Template from Phase 3 already supports it. Just confirm AI instructions guide correct generation.
- Onboarding — Phase 8.
- Message view simplification — moved to Phase 11.
- Settings dialog simplification — moved to Phase 11.
