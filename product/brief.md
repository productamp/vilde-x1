# ProductVibe — Brief

**What:** A super simple desktop app for non-technical people to create, publish, and maintain websites by chatting. Halfway between raw ChatGPT and full-blown Lovable — affordable, dead simple, good enough results.

## Vision

People who own a yoga studio, run an Airbnb property business, or have a small local business — they've heard AI can build websites. They've talked to experts who told them about React and hosting. But it's too expensive to hire someone, and they don't have the energy to figure it out themselves.

They don't care about GitHub, git trees, or design systems. They've heard of HTML. They just want something that works.

**Two core needs:**
1. **Chat to create a website** that looks good enough
2. **Publish it** — and maintain it, keep it in sync

You can kinda do this in ChatGPT or Claude today. But the results aren't tuned and publishing isn't easy. ProductVibe sits in the gap: **halfway between raw ChatGPT and full-blown Lovable.**

## Target user

Non-technical small business people. Examples: yoga studio owner, Airbnb property manager, local service business.

- **Not technical** — don't know React, haven't used a terminal, don't know what a design system is
- **On a tight budget** — can't afford Lovable or hiring a developer
- **Aware of AI** — heard the buzzwords, know it can do things, haven't figured out how
- **Don't have energy to learn** — want to chat, see a result, publish, done
- **Already paying for AI** — many have ChatGPT, Gmail (Gemini), or could get access cheaply

## AI engine options

| Engine | Audience | Cost to user | Notes |
|--------|----------|-------------|-------|
| **Claude Code** | Best quality, current primary target | CLI subscription | Users likely already experts |
| **Codex (ChatGPT)** | Largest market — most people already pay | Included in subscription | Biggest potential user base |
| **Gemini** | Massive reach — everyone has Google | Free tier available | Potentially biggest market of all |

Starting with Claude Code (best quality, proven with 1Code). Architecture should support swapping engines. We wrap the CLI, not the API.

## Output stacks (what ProductVibe generates for users)

Two tiers of generated output:

| Tier | Stack | Design System | Use case |
|------|-------|---------------|----------|
| **Default** | HTML + Tailwind + DaisyUI | DaisyUI themes + components | Landing pages, simple sites |
| **Advanced** | Vite + React + Tailwind + shadcn | shadcn components | Interactive sites, dynamic content |

- **Default (HTML + DaisyUI):** No build step, no `node_modules`. Claude generates DaisyUI markup well. Polished component classes (`btn`, `card`, `hero`, `navbar`) on Tailwind with 30+ built-in themes. Landing pages look professional out of the box.
- **Advanced (Vite + React + shadcn):** When users need interactivity, forms, or dynamic content. Proven Lovable stack.

## Architecture approach

- **Don't remove 1Code features** — hide them behind a `productVibeMode` flag so they can be toggled
- The preview pane is technology-agnostic (standard iframe loading any URL) — works for both HTML and React output
- For HTML output: serve via built-in static file server, no dev server needed
- For React output: auto-start Vite dev server, preview at `localhost:{port}`

## Phase 1 status — feature flag and no-auth baseline

Phase 1 is implemented.

- **`productVibeMode` exists** as a persisted app-level flag shared between Electron main and renderer
- **21st.dev login is bypassed** when `productVibeMode` is on, so the app boots directly into the product instead of `login.html`
- **Provider/account onboarding is skipped** for ProductVibe entry, so users are not blocked by the old account flow
- **Claude Code uses local auth flow** in ProductVibe mode: use the installed Claude CLI and existing Claude credentials instead of the old 21st.dev auth path
- **Codex/custom model setup remains allowed** through model settings, but app login is no longer a prerequisite
- **Developer-only friction is hidden behind the flag** where already patched, including worktree setup prompts

Current caveat: this is only the no-auth baseline. The product still needs further UI stripping and onboarding simplification to fully feel consumer-facing.

## Phase 2 status — first working local preview loop

Phase 2 is implemented.

- **Local static preview server exists** in Electron main process and serves the current local project/worktree over `127.0.0.1`
- **Preview no longer depends on cloud sandbox URLs** for local desktop chats
- **Preview supports normal website behavior** for simple static sites: `/` resolves to `index.html`, relative CSS/JS/assets load normally, and simple multi-page `.html` navigation works
- **Preview reloads on local file changes** so edits show up without manually restarting a server
- **Preview is integrated into the unified right sidebar** as a `Preview` tab next to `Files`, instead of a separate dedicated preview sidebar

Current caveat: this is the static-site baseline only. Advanced preview for Vite/React dev servers still belongs to Phase 4.

### Current feature-flagged items

- Desktop auth and login screen
- Account/provider onboarding entry flow
- Remote auth-backed team and automation queries
- Worktree setup banner in new chat
- Worktree setup section in project settings

## What 1Code already has (~70% of MVP)

- Chat input (rich — attachments, voice input, @mentions, slash commands)
- Claude Code SDK (multi-agent support, Claude + Codex)
- **Live preview pane** — `agent-preview.tsx` (612 LOC), iframe with responsive viewport emulation, device presets, URL bar, reload, zoom
- Iterate via chat (forking, message queue, sub-chats)
- File explorer (tree view, grouped view, Cmd+P search, syntax highlighting)
- Project save/load (SQLite + Drizzle ORM)
- Onboarding (multi-step, auto-skip if CLI detected)

## Reference repos

- `product/references/dyad/` — Desktop Lovable clone. Study for: feature set, UX flow, multi-provider AI pattern, preview pane approach. Code quality is bad, don't copy implementation details.
- `product/references/open-lovable/` — Web-based Lovable clone (24.3k stars). Study for: chat-to-app UX flow, prompt engineering patterns, preview iteration UX. Web-only, not desktop.
