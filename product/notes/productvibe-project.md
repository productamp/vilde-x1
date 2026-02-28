# ProductVibe

**What:** A super simple desktop app for non-technical people to create, publish, and maintain websites by chatting. Halfway between what you can do in ChatGPT today and what Lovable/v0 provide — but affordable and dead simple.

**Tag:** side project
**Status:** prototype exists
**Where:** Dyad fork (prototype quality, needs rebuild)
**Schedule:** evenings and weekends only

---

## Vision

People who own a yoga studio, run an Airbnb property business, or have a small local business — they've heard the buzzwords. They know AI can build websites. They've talked to experts who told them about React and hosting and design systems. But it's too expensive to hire someone, and they don't have the energy or knowledge to figure it out themselves.

They don't care about GitHub. They don't care about git trees. They don't know what React is. They've heard of HTML. They just want something that works.

**What they need is two things:**
1. **Chat to create a website** that looks good enough
2. **Publish it** — and then maintain it and keep it in sync

You can kinda do this already in ChatGPT or Claude. But the results aren't tuned for it, and publishing isn't easy (at least not yet). ProductVibe sits in the gap: **halfway between raw ChatGPT and full-blown Lovable.** Simple enough for anyone, good enough results, and a path to publish.

## Concept

A super simple app: chat and website. No backend complexity, no Supabase, no full-stack. Just a chat-to-website builder that runs on the user's own AI subscription at low or no extra cost.

### Target user

Non-technical small business people who need a website. Examples:
- Yoga studio owner
- Airbnb property manager
- Local service business

Key traits:
- **Not technical** — don't know React, haven't used a terminal, don't know what a design system is
- **On a tight budget** — can't afford Lovable's pricing or hiring a developer
- **Aware of AI** — they've heard the buzzwords, know AI can do things, but haven't figured out how to use it for themselves
- **Don't have energy to learn** — they want to chat, see a result, publish, done
- **Already paying for AI** — many have ChatGPT, Gmail (Gemini), or could get access cheaply

### Why this works

The tools exist today but the experience doesn't. ChatGPT can generate websites but the results aren't tuned and publishing is hard. Lovable is polished but expensive and overkill. ProductVibe is the middle ground: a focused app that does one thing well — chat to create and publish a website.

### AI engine options

The app wraps an AI coding engine. Three viable options, each with a different market angle:

| Engine | Audience | Cost to user | Quality | Notes |
|--------|----------|-------------|---------|-------|
| **Claude Code** | Best quality, but users are likely already experts | API costs | Best code generation | Current primary target |
| **Codex (ChatGPT)** | Largest market — most people already pay for ChatGPT | Included in subscription | Good | Biggest potential user base |
| **Gemini** | Massive reach — almost everyone has a Google account | Free tier available | Improving | Potentially the biggest market of all |

Starting with Claude Code (best quality, proven with 1Code base). But the architecture should support swapping engines — this is about the user's wallet, not our preference.

### How it works

- Desktop app with chat interface (Lovable-style UX)
- Connects to user's own AI engine (Claude Code, Codex, or Gemini)
- User chats, AI generates the website
- Live preview pane shows the result
- Publish when ready
- Come back to maintain and update

### Tech decisions

- **Platform:** Mac first, then Windows
- **App framework:** Electron (1Code base, Apache 2.0)
- **AI engines:** Claude Code CLI, Codex (bring your own key)
- **Output stack (default):** HTML + Tailwind + DaisyUI — for landing pages and simple sites
- **Output stack (advanced):** Vite + React + Tailwind + shadcn — for interactive/dynamic sites
- **Preview:** iframe-based, technology-agnostic (1Code's `agent-preview.tsx`)
- **Dyad fork:** throwaway prototype only — kept as reference in lab

### Requirements

- **Lightweight codebase** — the Dyad fork is bloated. The real build needs to be lean and minimal.
- **Smooth UX** — current prototype feels rough. The app needs to feel polished and simple, not hacked together.
- **Better architecture** — need a cleaner approach than forking. May mean building from scratch with Electron, or finding a better starting point.
- **Quality bar** — this ships to non-technical users. It has to just work, no jank.

### Business model

- Free app (closed source)
- Revenue TBD

### What it's NOT

- Not a full-stack app builder (no Supabase, no databases, no auth flows)
- Not a Productamp sub-project — standalone product from the studio
- Not competing with Lovable on features — competing on price and simplicity

### Build approach (locked 2026-02-28)

**Base:** 1Code (Apache 2.0, Electron, Claude Code SDK)
**References:** Dyad and Open Lovable kept in codebase for UX patterns
**Lab:** `/Users/ai/lab/productvibe-x2/` — base (1Code), references (Dyad, Open Lovable), docs, CLAUDE.md prompt starter

Researched 10 open-source alternatives, narrowed to 4, tested 5 hypotheses. Final decision: **1Code base + Open Lovable & Dyad as references (H4/H5 hybrid).**

1Code is ~70% complete for ProductVibe MVP. Critical advantage: **live preview pane already built** (`agent-preview.tsx`, 612 LOC — responsive viewport emulation, device presets, URL bar, reload, zoom). Standard iframe, technology-agnostic — just swap `getSandboxPreviewUrl()` to `localhost:{port}`.

Features to ADD (not strip — hide developer UI behind a flag):
- Auto-start dev server + port detection
- Local preview URL mapping — swap cloud sandbox URLs for localhost
- Simplified onboarding for non-developers
- Hide developer UI behind `productVibeMode` flag
- Static HTML serving for sites without `package.json`
- Simplified message views — hide tool calls, diffs

Full research: `research/notes/2026-02-28-agent-builder-ui.md`

### Output stack (locked 2026-02-28)

What ProductVibe generates for users (the websites/landing pages):

| Tier | Stack | Design System | Use case |
|------|-------|---------------|----------|
| **Default** | HTML + Tailwind + DaisyUI | DaisyUI themes + components | Landing pages, simple sites |
| **Advanced** | Vite + React + Tailwind + shadcn | shadcn components | Interactive sites, forms, dynamic content |

**Why DaisyUI for default:** It's the shadcn equivalent for plain HTML. Provides polished component classes (`btn`, `card`, `hero`, `navbar`) on top of Tailwind with 30+ built-in themes. No React, no build step, no `node_modules`. Claude generates DaisyUI markup well — lots of training data. Landing pages look professional out of the box.

**Why keep React+shadcn as advanced:** When users need interactivity, forms, or dynamic content, upgrade to Vite+React+shadcn. This is the proven Lovable stack and Claude excels at generating it.

### Open questions

- **Publishing** — how do users publish? Options: built-in hosting, Netlify/Vercel deploy, export static files, GitHub Pages. This is core to the value prop.
- **Gemini integration** — how to integrate Google Gemini as an AI engine (biggest potential market, free tier)
- **Codex integration** — how to use ChatGPT/Codex for users who already pay for it
- Studio brand name — ProductVibe is one of several products, parent brand TBD
- Monetization — what's worth paying for on top of free?
- Dev server auto-start approach (detect `package.json` + run `npm dev` + health check)
- Minimal viable feature set for v1
- How to detect which tier to scaffold (default HTML vs React) — user prompt analysis or explicit choice?

---

## Discussions Log

2026-02-26 — Idea originated as "Lovable Clone" spark. Discussed with Jeff, who liked it. Named it ProductVibe.

2026-02-28 — Refined scope: landing pages and websites only, no backend complexity. Target shifted to small business people on tight budgets who already have ChatGPT. Positioned as standalone studio product, not a Productamp sub-project. Researched 10 open-source agent builder UIs, cloned all to `/Users/ai/lab/agent-builder-ui/`, assessed at code level. Narrowed to 4 options (1Code, CodePilot, Dyad, Open Lovable), tested 5 build hypotheses. Initially leaned H3 (CodePilot base) but revised after add-features analysis: **1Code already has the live preview pane** that CodePilot lacks (the biggest gap). Final decision: **H4/H5 hybrid — 1Code base, reference both Open Lovable and Dyad for UX.** 70% complete for MVP — main work is dev server automation, simplified onboarding, and hiding developer UI. Locked output stack: HTML+Tailwind+DaisyUI as default (shadcn equivalent for plain HTML), Vite+React+shadcn as advanced tier. Studied Bolt.new (multi-framework via WebContainers), Webflow (plain HTML+CSS), and HTML design system approaches. DaisyUI won as the default because it gives polished component classes on Tailwind without React — Claude generates it well and landing pages look professional out of the box.
