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
| 6 | UI polish and simplification | Hide dev UI, simplify messages | Not started |
| 7 | Onboarding | Simplified setup for non-technical users | Not started |
| 8 | Publishing | One-click deploy to live URL | Not started |
| 9 | Scaffold optimisation | Smarter defaults, prompt-aware templates | Not started |
| 10 | Gemini support | Add Gemini as AI engine | Not started |

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

- [ ] **Clean default layout** — chat left, preview right, nothing else
- [ ] **Hide dev UI** — git, terminal, MCP, PRs, worktrees, diff previews behind the flag
- [ ] **Simplified message views** — hide tool calls and diffs, show only the conversation

### Phase 7 — Onboarding

Make the first 60 seconds work for someone who's never used a terminal.

- [ ] **Simplified onboarding flow** — no CLI jargon, no "install Claude Code" steps
- [ ] **API key setup** — guide user through getting and entering their key
- [ ] **First project creation** — "What kind of website do you want?" → scaffold → preview

### Phase 8 — Publishing

The other half of the value prop. Users need their site on the internet.

- [ ] **Research deploy targets** — Netlify, Vercel, GitHub Pages, built-in hosting
- [ ] **One-click publish** — from preview to live URL with minimal steps
- [ ] **Update flow** — chat to change → preview → re-publish

### Phase 9 — Scaffold optimisation

Improve the starter template based on what we've learned from real usage.

- [ ] **Smarter defaults** — pre-populate with layout, routing, and page structure that matches common user requests
- [ ] **Prompt-aware scaffolding** — tailor the starter based on what the user asks for ("blog", "portfolio", "landing page")
- [ ] **Template variants** — multiple starter templates for different site types
- [ ] **Reduce first-build time** — optimise dependencies, trim unused components, speed up `npm install`

### Phase 10 — Gemini support

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
| Details sidebar (widgets) | Flag | `details-sidebar.tsx` | Hide entire sidebar. No user-facing need for info/todo/plan/diff/mcp tabs. |
| Changes / diff panel | Flag | `active-chat.tsx` | Don't render `<ChangesPanel>`, `<DiffFullPageView>`, `<DiffSidebarHeader>`, `<DiffCenterPeekDialog>`. |
| File viewer sidebar | Flag | `active-chat.tsx` | Don't render file tree or file search dialog. Disable `Cmd+Shift+K`. |
| Sub-chats sidebar | Flag | `active-chat.tsx` | Hide. Non-technical users don't need parallel sub-chat threads. |

### Header and toolbar

| Element | Strategy | File | Detail |
|---------|----------|------|--------|
| Git branch selector | Flag | `active-chat.tsx` ~L1786 | Hide branch dropdown, fetch/review/PR actions in chat header. |
| Workspace subtitle (repo • branch) | Flag | `active-chat.tsx` ~L4650 | Hide or replace with project name only. |
| Worktree path indicator | Flag | `active-chat.tsx` ~L4763 | Already partially gated. Verify hidden. |
| Terminal toggle button | Flag | `active-chat.tsx` | Hide `Cmd+J` terminal toggle from toolbar. |
| File viewer toggle button | Flag | `active-chat.tsx` | Hide file explorer button from toolbar. |
| Details sidebar toggle button | Flag | `active-chat.tsx` | Hide widget sidebar button from toolbar. |

### Settings dialog

| Tab | Strategy | File | Detail |
|-----|----------|------|--------|
| MCP | Flag | `settings-content.tsx` | Hide tab entirely. |
| Debug | Flag | `settings-content.tsx` | Hide tab entirely (keep ProductVibe toggle accessible via other means or dev shortcut). |
| Plugins | Flag | `settings-content.tsx` | Hide tab entirely. |
| Skills | Flag | `settings-content.tsx` | Hide tab entirely. |
| Custom Agents | Flag | `settings-content.tsx` | Hide tab entirely. |
| Projects (worktree section) | Flag | `agents-project-worktree-tab.tsx` L448 | Already gated. Verify. |
| Models | Rework | `agents-models-tab.tsx` | Show only model picker. Hide migration UI, advanced config. |
| Beta | Rework | `agents-beta-tab.tsx` | Show version info only. Hide automations, subscription checks. |
| Appearance | Keep | — | User-facing. No change. |
| Preferences | Keep | — | User-facing. No change. |
| Keyboard | Keep | — | User-facing. No change. |
| Profile | Rework | `agents-profile-tab.tsx` | Hide team features. Show name/avatar only. |

### Chat messages

| Element | Strategy | File | Detail |
|---------|----------|------|--------|
| Tool call blocks | Rework | `assistant-message-item.tsx`, `agent-tool-call.tsx` | Collapse all tool calls to a single subtle "Working..." indicator. No file names, no diffs, no shell output. |
| MCP tool calls | Flag | `agent-mcp-tool-call.tsx` | Hide entirely (subset of above). |
| File mentions | Flag | message rendering | Hide inline file path references. |
| AI text responses | Keep | `chat-markdown-renderer.tsx` | Show as-is. This is the conversation. |
| User messages | Keep | — | Show as-is. |

### Layout

| Element | Strategy | File | Detail |
|---------|----------|------|--------|
| Default layout | Rework | `active-chat.tsx`, layout atoms | Two-panel: chat (left, ~35%), preview (right, ~65%). No third column, no bottom panel. |
| Preview auto-open | Rework | `active-chat.tsx` ~L5788 | Currently skips auto-open in ProductVibe mode. Invert: always auto-open preview when `productVibeMode`. |
| Chat input | Rework | chat input component | Hide file attach, model selector, advanced options. Keep text input + send button. |
| Left sidebar (chat list) | Keep | `agents-sidebar.tsx` | Already clean. Project selector + chat list. |

### Hotkeys

| Key | Strategy | Detail |
|-----|----------|--------|
| `Cmd+J` | Flag | Disable terminal toggle. |
| `Cmd+Shift+K` | Flag | Disable file search. |
| `Cmd+B` | Keep | Toggle left sidebar (useful). |

### Not in scope (Phase 6)

- Blog content support — moved to verification. Template from Phase 3 already supports it. Just confirm AI instructions guide correct generation.
- Onboarding — Phase 7.
- New settings UI design — not needed yet, flagging tabs is enough.
