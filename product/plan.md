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
4. **Default to simple.** HTML + Tailwind + DaisyUI. No build step, no node_modules. React only when needed.
5. **The preview is the product.** If the user can't see their website live as they chat, nothing else matters.
6. **Cheap to run.** Users bring their own AI CLI — Claude Code, Codex, Gemini CLI. We wrap the CLI, not the API. No API keys, no token billing, no subscription tax on top.

## Sequence

| Phase | Name | What | Status |
|-------|------|------|--------|
| 0 | Setup | Build and run the app | Done |
| 1 | Feature flag | Feature flag system, bypass auth requirement | Not started |
| 2 | First working loop | Static server + preview URL mapping | Not started |
| 3 | Feel like ProductVibe | Hide dev UI, simplify messages | Not started |
| 4 | Advanced tier | Auto-start dev server, React+shadcn support | Not started |
| 5 | Onboarding | Simplified setup for non-technical users | Not started |
| 6 | Publishing | One-click deploy to live URL | Not started |
| 7 | Multi-engine | Codex, Gemini support | Not started |

### Phase 0 — Setup

Get the app running.

- [x] **Build and run** — `bun install`, `bun run dev`, verify 1Code starts clean

### Phase 1 — Feature flag

Add the feature flag system and use it to bypass auth/onboarding requirements.

- [ ] **Feature flag system** — add `productVibeMode` flag (atom + persistence). Single boolean that all UI hiding checks against.
- [ ] **Flag toggle** — dev-only way to switch between 1Code mode and ProductVibe mode
- [ ] **Bypass auth** — feature flag out the auth requirement for onboarding and usage. When `productVibeMode` is on, skip login/signup gates entirely.

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

- [ ] **Static file server** — serve HTML/CSS/JS from project directory, no `package.json` needed
- [ ] **Preview URL mapping** — swap `getSandboxPreviewUrl()` from cloud sandbox to `localhost:{port}`
- [ ] **Verify the loop** — chat → generate HTML+DaisyUI → static server → preview pane shows it live

This is the minimum demoable prototype.

Scope for this phase:

- Keep the existing preview sidebar UI
- Use a tiny local static server in Electron main process
- Default preview target is the current project/worktree folder
- `/` should resolve to `index.html`
- Relative assets like `styles.css`, `script.js`, images, and links to other HTML pages should work normally
- On file changes, reload the iframe

### Phase 3 — Make it feel like ProductVibe

Strip the developer feel. Make it consumer-grade.

- [ ] **Hide dev UI** — git, terminal, MCP, PRs, worktrees, diff previews behind the flag
- [ ] **Simplified message views** — hide tool calls and diffs, show only the conversation
- [ ] **Clean default layout** — chat left, preview right, nothing else

### Phase 4 — Dev server for advanced tier

Support Vite+React+shadcn sites for users who need interactivity.

- [ ] **Auto-start dev server** — detect `package.json`, run dev command, health check port
- [ ] **Port detection and mapping** — preview pane connects to running dev server
- [ ] **Tier detection** — decide HTML vs React based on project contents

### Phase 5 — Onboarding

Make the first 60 seconds work for someone who's never used a terminal.

- [ ] **Simplified onboarding flow** — no CLI jargon, no "install Claude Code" steps
- [ ] **API key setup** — guide user through getting and entering their key
- [ ] **First project creation** — "What kind of website do you want?" → scaffold → preview

### Phase 6 — Publishing

The other half of the value prop. Users need their site on the internet.

- [ ] **Research deploy targets** — Netlify, Vercel, GitHub Pages, built-in hosting
- [ ] **One-click publish** — from preview to live URL with minimal steps
- [ ] **Update flow** — chat to change → preview → re-publish

### Phase 7 — Multi-engine

Open up to the biggest markets.

- [ ] **Codex (ChatGPT)** — users who already pay for ChatGPT Plus
- [ ] **Gemini** — users with a Google account (free tier)
- [ ] **Engine selector** — choose your AI in settings
