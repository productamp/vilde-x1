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
| 4 | Vite dev server | Wire template into app, auto-start Vite | Not started |
| 5 | New project flow | Create project → scaffold → install → preview | Not started |
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

Wire the template into the app and get the dev server running. All ProductVibe projects are Vite+React+shadcn+React Router. Uses `npm` (not bun) for user projects.

- [ ] **Copy template on project create** — app copies `resources/templates/default/` to project directory
- [ ] **Auto `npm install`** — run `npm install` in project dir after template copy
- [ ] **Auto-start Vite** — detect `package.json`, run `npm run dev`, health check until port is ready
- [ ] **Port detection** — parse Vite output for the local URL/port
- [ ] **Preview mapping** — preview pane loads `localhost:{port}` from the running Vite dev server
- [ ] **Lifecycle management** — stop dev server on project close, handle crashes/restarts, don't leak child processes
- [ ] **HMR works** — Vite hot module replacement updates preview live as Claude edits files

### Phase 5 — New project flow

End-to-end flow for starting a new project. User clicks "New Project" → app scaffolds template → installs deps → starts dev server → preview shows the site.

- [ ] **New project UI** — simplified "create project" experience in the app
- [ ] **Copy template** — copy bundled `resources/templates/default/` to project directory
- [ ] **Auto `npm install`** — run install after template copy, show progress
- [ ] **Auto-start Vite** — start dev server after install, connect preview
- [ ] **First chat prompt** — user sees their starter site in preview and can immediately start chatting to customise it

### Phase 6 — UI polish and simplification

Strip the developer feel. Make it consumer-grade.

- [ ] **Hide dev UI** — git, terminal, MCP, PRs, worktrees, diff previews behind the flag
- [ ] **Simplified message views** — hide tool calls and diffs, show only the conversation
- [ ] **Clean default layout** — chat left, preview right, nothing else
- [ ] **Blog content support** — generate and serve multi-page blog sites (posts, index, navigation)

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
