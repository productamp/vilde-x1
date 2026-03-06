# Phase 8b — Master Prompt

## What this is

A system prompt architecture that steers every AI session in Vilda toward producing high-quality websites, blog content, and documentation — without the user seeing or thinking about prompts.

## Architecture

Three layers:

| Layer | File | Purpose | Editable by user |
|-------|------|---------|------------------|
| **Master prompt** | `app/src/main/prompts/vilda-system.ts` | Light index: role, way of working, points to CLAUDE.md | No (runtime inject) |
| **Project CLAUDE.md** | `<project>/CLAUDE.md` | All specifics: stack, design, accessibility, file structure, constraints | Yes |
| **Project AGENTS.md** | `<project>/AGENTS.md` | One-line redirect: "Read CLAUDE.md" (Codex compat only) | Yes |

### How it reaches the AI

```
systemPrompt = {
  preset: "claude_code",                    // SDK built-in (not editable)
  append: VILDA_SYSTEM_PROMPT               // ← injected when productVibeMode is on
        + AGENTS.md content                 // ← from project root (if exists)
}
```

- `systemPrompt.append` is present for **every message** in the conversation
- It **survives context compaction** — it's system prompt, not history
- It's **invisible** to the user — not in chat, not in project files
- Gated on `getProductVibeMode()` — developer mode gets stock Claude Code behaviour

### Why this split

- **Master prompt stays light** (~10 lines). It defines the role ("website marketing copilot") and way of working ("read CLAUDE.md, keep responses brief, no jargon"). It never changes per project or template.
- **CLAUDE.md carries all specifics.** Stack rules, design quality, component discipline, image handling, accessibility, tone. Per-project and per-template — different templates can have different rules.
- **AGENTS.md is a Codex redirect.** Codex reads AGENTS.md; Claude reads CLAUDE.md natively. One line: "Read CLAUDE.md for all instructions."

## Files

### `app/src/main/prompts/vilda-system.ts` (implemented)

Exports `VILDA_SYSTEM_PROMPT` constant. Bundled into `out/main/index.js` by electron-vite.

```
You are Vilda, a website marketing copilot. You help non-technical users
build websites, write blog content, and create documentation. They describe
what they want in plain language. You make it happen.

## Way of working

- Read CLAUDE.md in the project root for all project rules, stack constraints,
  and design guidelines. Follow them exactly.
- The Vite dev server is already running. Never start, stop, or restart it.
  Just edit files — HMR handles the rest.
- Prioritise a visually complete, polished result on every change.
  No skeletons, no TODOs, no placeholder layouts.
- Keep your responses brief. Say what you changed, not how you changed it.
- Never use technical jargon in UI copy or in your chat responses.
  The user is not a developer.
```

Companion `vilda-system.md` in the same directory is the human-readable source of truth.

### `app/src/main/lib/trpc/routers/claude.ts` (implemented)

Import at top:
```typescript
import { VILDA_SYSTEM_PROMPT } from "../../../prompts/vilda-system"
```

Injection at ~line 1759:
```typescript
const appendParts: string[] = []
if (getProductVibeMode()) {
  appendParts.push(VILDA_SYSTEM_PROMPT)
}
if (agentsMdContent) {
  appendParts.push(`# AGENTS.md\n...${agentsMdContent}`)
}
const systemPromptConfig = appendParts.length > 0
  ? { type: "preset", preset: "claude_code", append: "\n\n" + appendParts.join("\n\n") }
  : { type: "preset", preset: "claude_code" }
```

### `app/resources/templates/default/CLAUDE.md` (implemented)

Sections:
1. **Project intro** — what it is, who the user is
2. **Tech stack** — React 19, Vite 7, Tailwind v4, shadcn/ui, lucide-react, Inter font
3. **Project structure** — file tree
4. **How to make changes** — recipes for common tasks
5. **Rules** — React SPA only, Tailwind only, shadcn components, router structure, path alias
6. **Design quality** — mobile-first, colour palette, typography, spacing, components first, no inline styles, Unsplash images, real copy, clean code
7. **Accessibility** — semantic HTML, alt text, keyboard nav, colour contrast
8. **Dev server** — already running, never start/stop/restart

### `app/resources/templates/default/AGENTS.md` (implemented)

One line:
```
Read CLAUDE.md in the project root for all project rules and instructions.
```

## Checklist

- [x] Create `app/src/main/prompts/vilda-system.ts` + `.md`
- [x] Wire into `systemPrompt.append` in `claude.ts`, gated on `productVibeMode`
- [x] Verified bundling — prompt confirmed in compiled `out/main/index.js`
- [x] Beefed up `app/resources/templates/default/CLAUDE.md` (design, accessibility, images, tone)
- [x] Slimmed `app/resources/templates/default/AGENTS.md` to one-line CLAUDE.md redirect
- [x] Build passes clean
- [ ] Test: new project in productVibeMode gets master prompt + beefed CLAUDE.md
- [ ] Test: developer mode (productVibeMode off) gets stock Claude Code behaviour
- [ ] Test: first-send output quality with a real prompt (e.g. "make this a yoga studio website")

## Notes

- **Existing projects** created before this change keep their old CLAUDE.md/AGENTS.md. The master prompt injection still works (it's runtime), but the beefed-up CLAUDE.md only applies to new projects.
- **Per-template CLAUDE.md** — when Phase 8c (Templates) lands, each template gets its own CLAUDE.md. The master prompt stays the same across all templates.
- **Prompt iteration** — edit `vilda-system.ts` for the role/way-of-working, edit template `CLAUDE.md` for specific rules. No A/B framework needed yet.
