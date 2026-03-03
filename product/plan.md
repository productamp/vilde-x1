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
| 7 | Workspace-to-projects | Rename "Workspace" to "Projects" and rework project management UX | Done |
| 8 | New chat form simplification | Hide developer controls in `new-chat-form.tsx` | Done |
| 8a | Rebrand to Vilda | Rename all "21st" / "1Code" references to "Vilda" in UI and config | Not started |
| 9 | Project settings | Simplify project settings for non-technical users | Not started |
| 10 | Pro menu + sitemap | Sitemap canvas synced to project pages/routes | Not started |
| 11 | Templates | Template gallery + generator wizard for fast project kickoff | Not started |
| 12 | Onboarding | Simplified setup for non-technical users | Not started |
| 13 | MVP Publish | Working release path for internal testers | Not started |
| 14 | Scaffold optimisation | Smarter defaults, prompt-aware templates | Not started |
| 15 | Content (CMS) view | Integrated project content management with blog-first workflow | Not started |
| 16 | Publishing | One-click deploy to live URL | Not started |
| 17 | UI and settings simplification | Simplify message views, hide developer tabs | Not started |
| 18 | Guided brief generation | Pre-prompt conversation to produce editable project brief | Not started |
| 19 | Gemini support | Add Gemini as AI engine | Not started |

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

Adopt Lovable-style terminology and project management flow. Feature-flagged via `projectsScreenModeAtom` (on by default when `productVibeMode` is on).

- [x] **Feature flag** — `projectsScreenModeAtom` in `product-vibe.ts`, defaults to true when productVibeMode is on
- [x] **Projects screen** — full-page centered projects list (`projects-screen.tsx`) with search, "New Project", project list sorted by recency, settings gear
- [x] **Sidebar gated** — `AgentsSidebar` hidden in projects-screen mode (except settings view). 1Code mode unaffected.
- [x] **Navigation** — auto-route to projects screen when no chat selected. "← Projects" back button in chat header. `Cmd+\` navigates to projects screen instead of toggling sidebar.
- [x] **Terminology migration** — user-facing "Workspace" → "Project" across sidebar, context menus, toasts, shortcuts, details panel, kanban, archive
- [x] **Compatibility layer** — internal IDs/table names unchanged, only user-facing labels updated
- [x] **Project thumbnails** — capture preview screenshots to `.productvibe/thumbnail.png`, serve via tRPC as base64 data URLs
- [x] **Browser frame cards** — project cards with minimal browser chrome, grey background, display URL
- [x] **Favourite projects** — star toggle on cards, `isFavourited` DB column, Favourites section in sidebar
- [x] **Filter tabs** — Drafts / Published / Archived (replaces Recents / All)

### Phase 8 — New chat form simplification

Redesign the home screen in `productVibeMode` as a new-project creation entry point. No manual project selection — the user lands, sees a name, types a prompt, and the project is created and built automatically.

**Navigation model (productVibeMode):**
- `desktopView = null`, no chat → **Home** (`NewChatForm`) — always the starting point
- `desktopView = "projects"` → **Projects screen** — secondary, accessed via "My Projects →"
- Chat open → **ChatView** — entered by sending a prompt or selecting an existing project
- "← Projects" from chat → Projects screen
- "+ New" from Projects screen → Home (fresh name generated)

**Home screen flow:**
1. User arrives at Home — `NewChatForm` mounts, a random name is generated immediately.
2. Name is shown as a muted subheading under "What do you want to get done?" (e.g. "Happy Robin").
3. User types a prompt and presses send.
4. `createFromTemplate` runs silently: project directory is created, scaffold starter is cloned.
5. Chat starts — Claude receives the prompt and begins building the site.

**Name format:** `[Adjective] [Noun]` in Title Case — everyday words from nature, animals, and plants (e.g. "Calm Cedar", "Swift Fox"). A fresh name is generated every time Home mounts.

**Controls:**
- [x] **Home is NewChatForm** — `projectsScreenMode && !productVibeMode` gates ProjectsScreen; in productVibeMode home falls through to `NewChatForm`.
- [x] **"My Projects →" link** — small link on Home navigates to `desktopView = "projects"`. Hidden once a project is selected.
- [x] **"+ New" button** — on Projects screen, resets `desktopView = null` → back to Home with a fresh name.
- [x] **Environment fixed to local** — `<WorkModeSelector>` hidden via `!productVibeMode`. Always agent mode.
- [x] **Branch selector hidden** — branch popover hidden via `!productVibeMode`.
- [x] **Agent/Plan toggle hidden** — mode dropdown hidden via `!productVibeMode`.
- [x] **Project selector hidden** — `<ProjectSelector>` hidden via `!productVibeMode`.
- [x] **Auto-generated project name** — random adjective + noun, generated on mount, shown under title.
- [x] **Auto-create on send** — `createFromTemplate` + scaffold on first send; no manual project creation step.
- [ ] **Simplify model selector** — hide Ollama models, custom Claude config, extended thinking controls in `productVibeMode`.
- [ ] **Hide developer slash commands** — suppress `/` commands that expose developer workflows in `productVibeMode`.

### Phase 8a — Rebrand to Vilda

Find and replace all visible "21st" and "1Code" references with "Vilda" throughout the UI and config. Covers displayed text, window titles, about screens, tray menus, and any branding strings that a user would see.

**Scope:**
- [ ] App window title — `1Code` → `Vilda`
- [ ] Electron tray / dock menu labels
- [ ] Any in-app text, tooltips, or help copy referencing "1Code" or "21st"
- [ ] `package.json` `name` / `productName` fields
- [ ] `electron-builder` config (app name, bundle ID)
- [ ] Any references in `README` or visible docs
- [ ] Sidebar logo label (currently already "ProductVibe" — verify it never shows "1Code")

**Out of scope:** internal variable names, file names, import paths — code identifiers stay as-is.

### Phase 9 — Project settings

Simplify project settings for non-technical users. Hide developer-centric controls in `productVibeMode`.

- [ ] **Audit existing settings** — identify all fields in the project settings panel and categorise as user-facing vs developer-only
- [ ] **Hide developer controls** — gate worktree config, git settings, CLI paths, and advanced options behind `!productVibeMode`
- [ ] **Simplified project info** — show project name, folder path, status, and thumbnail. Allow renaming.
- [ ] **Delete / archive project** — clear, accessible actions with confirmation dialogs
- [ ] **Favourite from settings** — toggle favourite status from the project settings panel

### Phase 10 — Pro menu + sitemap

Add a project sitemap canvas that is always synced from real pages/routes.

- [ ] **Sitemap entry point** — add a new `Sitemap` control next to `Preview` in the main panel navigation
- [ ] **Canvas view** — render a lightweight structural canvas (Relume-style): project node at top, connected child page cards below
- [ ] **Page card details** — show major page sections per card (for example navbar, hero, CTA, footer)
- [ ] **Card preview dialog** — clicking a page card opens a modal/dialog preview for that exact page
- [ ] **Deterministic route sync** — derive sitemap from actual React routes/pages via Node/TypeScript logic (not AI as source of truth)
- [ ] **Auto-refresh on changes** — update sitemap when route/page files change, including add/remove/rename
- [ ] **Project-scoped state** — sitemap is per project and not shared globally across projects
- [ ] **AI enrichment optional** — allow optional AI-only enrichment (for example section naming), while core structure stays deterministic

### Phase 11 — Templates

Add a templates experience to help users start from proven inspirations instead of a blank project.

- [ ] **Templates view** — add a `Templates` view in new-project and project flows with clear entry points
- [ ] **Template gallery** — card-based gallery with thumbnail, name, and short description
- [ ] **Filters and preview** — categories/filters and quick preview mode for fast browsing
- [ ] **Clone/start action** — `Use Template` / `Clone Template` creates a new editable project and opens it immediately
- [ ] **Template Generator wizard** — guided setup (business type, style, pages, tone) for users who prefer prompts-as-questions
- [ ] **Wizard output project creation** — generated template output creates a fully editable project baseline
- [ ] **Chat continuation** — users can immediately continue editing the cloned/generated result in chat
- [ ] **Inspiration-first behavior** — templates stay starter-ready and reduce blank-page friction for non-technical users

### Phase 12 — Onboarding

Make the first 60 seconds work for someone who's never used a terminal.
Target outcome: app works automatically without the user opening a terminal.

- [ ] **Zero-terminal onboarding** — no CLI jargon, no terminal steps, no manual setup
- [ ] **Automatic environment setup** — detect/install/configure what is needed in-app so users can start immediately
- [ ] **First project creation** — "What kind of website do you want?" → scaffold → preview

### Phase 13 — MVP Publish

Create a working publish path for internal testers (not full public publishing yet).

- [ ] **Internal tester target** — deploy to a single tester-facing environment
- [ ] **Shareable tester URL** — return a working URL that internal testers can open immediately
- [ ] **Basic update flow** — push fixes and re-publish quickly for tester re-validation
- [ ] **Simple failures** — friendly error states with one retry path for internal testing

### Phase 14 — Scaffold optimisation

Improve the starter template based on what we've learned from real usage.

- [ ] **Smarter defaults** — pre-populate with layout, routing, and page structure that matches common user requests
- [ ] **Prompt-aware scaffolding** — tailor the starter based on what the user asks for ("blog", "portfolio", "landing page")
- [ ] **Improved design skills** — upgrade scaffolded design quality (typography, spacing, color systems, component polish) so first output looks production-ready
- [ ] **Template variants** — multiple starter templates for different site types
- [ ] **Reduce first-build time** — optimise dependencies, trim unused components, speed up `npm install`

### Phase 15 — Content (CMS) view

Add an integrated, project-level CMS workflow with `Blog` as the default content type.

- [ ] **Content entry point** — add a new `Content` view after `Preview` in project views/navigation
- [ ] **Blog-first collections** — default `Blog` collection plus support for additional user-defined content types
- [ ] **Three-panel CMS layout** — collection list, content item list, and content editor (read/edit modes)
- [ ] **Core editorial actions** — create item, edit item, save, set draft/published status, publish updates
- [ ] **Search and filtering** — fast item discovery by title/status/date and optional language/category
- [ ] **Chat integration** — chat can create/update content items directly; manual edits and chat edits remain synced
- [ ] **Editorial controls sub-view** — style, tone, voice guidelines, audience level, length/depth, SEO/editorial preferences
- [ ] **Source-of-truth sync** — reads/writes from the real website content source, with view auto-refresh on file changes
- [ ] **Project-scoped content model** — content always belongs to the active project (never global)
- [ ] **Autopilot (Pro) workflows** — optional scheduled/automated generation and adaptation in the same CMS workflow

### Phase 16 — Publishing

The other half of the value prop. Users need their site on the internet.

- [ ] **Research deploy targets** — Netlify, Vercel, GitHub Pages, built-in hosting
- [ ] **One-click publish** — from preview to live URL with minimal steps
- [ ] **Update flow** — chat to change → preview → re-publish

### Phase 17 — UI and settings simplification

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

### Phase 18 — Guided brief generation

Add a guided pre-prompt flow that captures intent and turns it into a project-specific `brief.md` used for first generation.

- [ ] **Guided pre-prompt chat** — on new project creation, run a short structured conversation to validate what the user wants to build
- [ ] **Generate `brief.md`** — create a project-level `brief.md` from the pre-prompt answers using a consistent structure (business context, goals, audience, pages, tone, visual direction, constraints)
- [ ] **Editable brief UX** — let users open and edit `brief.md` directly before generation
- [ ] **First prompt source of truth** — use the latest saved `brief.md` as the first generation prompt for the project
- [ ] **Regenerate loop** — when users update `brief.md`, regenerate from the updated brief
- [ ] **Chat/brief alignment** — keep pre-prompt answers and brief content in sync so generation reflects the latest intent

### Phase 19 — Gemini support

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
- Onboarding — Phase 11.
- Message view simplification — moved to Phase 16.
- Settings dialog simplification — moved to Phase 16.
