# Template Strategy — Phase 8b

## Core idea

Templates are bundled scaffolds — real, working websites that ship as starters. They are the primary quality control mechanism. A good template means a good result in 60 seconds.

## Why bundled scaffolds (not prompt-based)

- **Output quality.** A curated, hand-polished scaffold produces better results than asking Claude to build from scratch every time. The template IS the quality floor.
- **Speed.** User picks a template, writes one prompt, publishes. No waiting for Claude to generate a full site from nothing.
- **Marketing asset.** Each template is a public proof point. "Build a professional website in 60 seconds" — the demo video starts from a template.
- **Control.** We control the design, the structure, the sections. Claude customises — it doesn't architect from zero.

## Template sourcing

**Primary method: clone from Lovable/v0, then genericise.**

1. Use personal Lovable/v0 account to fork/use the best template in each category
2. Prompt: "Make this generic — remove brand content, use placeholder business copy, ensure images are royalty-free or placeholder"
3. Download the code
4. You own the output (both platforms assign IP rights to the user)
5. Add `CLAUDE.md`, `AGENTS.md`, `template.json`, push to GitHub as MIT

**Why Lovable/v0:**
- Highest design quality available — these are the market leaders
- Lovable outputs Vite + React + Tailwind — matches our stack exactly (minimal conversion)
- v0 outputs Next.js — needs Vite conversion, so prefer Lovable when quality is comparable
- Both platforms' terms assign output ownership to the user
- Genericising the template (removing brand content, rewriting copy) strengthens the ownership claim

**Fallback: MIT GitHub repos.** For categories where Lovable/v0 don't have a strong template, clone from the MIT repos identified in `open-source-business-template-library.md`:
- `leoMirandaa/shadcn-landing-page` — SaaS/business, React + shadcn + Tailwind, near-zero conversion
- `shadcnstore/shadcn-dashboard-landing-template` — SaaS + dashboard, has Vite variant
- `itsDaiton/business-website-template` — business/fintech, React + Tailwind + Vite
- `onwidget/astrowind` — best general business design (needs Astro → React conversion)

**Licensing notes:**
- v0: "As between you and Vercel, you own Customer Content and Vercel assigns to you Vercel's rights, if any, in the Output." Output not guaranteed unique, no IP warranty. Same theoretical risk as any AI-generated code.
- Lovable: you own what you create. Lovable gets a license to use for training unless you opt out or upgrade.
- Neither platform puts an explicit open source license on templates, but ownership terms allow you to relicense your output as MIT.

## Template definition

A template is a complete, working Vite + React + Tailwind + shadcn project stored in a public GitHub repo (MIT licensed).

Each template repo contains:
- Full source code (same stack as `resources/templates/default/`)
- `README.md` with screenshot, description, live demo link
- `template.json` — metadata for the gallery (name, description, category, thumbnail URL, tags)
- `CLAUDE.md` / `AGENTS.md` — AI instructions tailored to the template's structure

## Template naming

**Convention:** Norwegian-inspired nouns. One word. Lowercase in code (`bryggen`), Title Case in UI (`Bryggen`).

**Rules:**
- One word only — no compounds, no hyphens
- ASCII only — no å, ø, æ (replace with a, o, e if adapting a Norwegian word)
- Easy to spell and pronounce for English speakers
- Draw from: nature (trees, weather, terrain), places (towns, regions), everyday nouns (buildings, objects, crafts)
- Each name should feel Nordic but not require explanation
- Avoid names that are common English words (e.g., "storm" is fine, "sun" is too generic)
- No duplicates across the template library

A curated word bank will be maintained separately. Pick from it when adding a template.

## Template set (v1 — ~5 core templates)

| Template | Target user | Example prompt | Likely source |
|----------|-------------|----------------|---------------|
| Professional / Business | Consultants, agencies, local services | "Upload your LinkedIn PDF → builds from there" | Lovable |
| SaaS / Product | Startup landing pages, app marketing | "Describe your product and pricing tiers" | Lovable or shadcn-landing-page |
| Portfolio / Personal | Freelancers, creators, coaches | "Upload your resume or describe your work" | Lovable |
| Restaurant / Local | Restaurants, cafes, salons, local shops | "Enter your menu and location" | Lovable or v0 |
| Blog / Content | Writers, thought leaders, newsletters | "Describe your niche and first post topic" | Lovable |

Each template is a polished, production-ready website. Not a wireframe. Not a skeleton. A real site with real copy placeholders, real sections, real responsive design.

## Template creation workflow

```
For each template:
  1. Browse Lovable/v0 template galleries, pick the best in category
  2. Fork/use it in your account
  3. Prompt: "Make generic — remove brand content, placeholder copy, royalty-free images"
  4. Download code
  5. Verify it's Vite + React + Tailwind (convert if needed — prefer Lovable to avoid this)
  6. Add CLAUDE.md, AGENTS.md, template.json
  7. Run: npm install && npm run dev — must work first try
  8. Lighthouse check — 90+ on all scores
  9. Push to GitHub as MIT

Time per template: ~1-2 hours (clone + genericise + metadata)
```

## How it works

### Gallery flow
1. User opens Vilda → sees template gallery (cards with thumbnails)
2. Picks a template → sees a preview
3. Clicks "Use Template" → project created from that scaffold
4. Types a prompt describing their business → Claude customises the template
5. Preview updates live → publish

### "Upload and go" flow (key differentiator)
Some templates support file upload as the primary input:
- **Professional:** Upload LinkedIn PDF → extracts name, title, experience, skills → populates site
- **Restaurant:** Upload menu PDF or photo → extracts items → builds menu page
- **Portfolio:** Upload resume/CV → extracts projects and skills → builds portfolio

This is the marketing hook. Not "describe your website" — "upload your LinkedIn and watch."

## GitHub hosting

Templates live in public GitHub repos under a Vilda org (or similar). MIT licensed.

Why public:
- **Marketing.** Each repo is discoverable, forkable, star-able. Free distribution.
- **Community.** Users and developers can contribute templates.
- **Trust.** Open source = inspectable = trustworthy for non-technical users' businesses.
- **Demo videos.** Each template README links to a 60-second demo video.

The app bundles the core templates at build time (same as `resources/templates/default/` today). Updates ship with app updates. Future: fetch latest from GitHub at runtime.

## App integration

### Template registry
A `templates.json` manifest (bundled in app) listing all available templates:
```json
[
  {
    "id": "professional",
    "name": "Professional",
    "description": "Business website for consultants, agencies, and services",
    "category": "business",
    "thumbnail": "professional-thumb.png",
    "path": "professional",
    "tags": ["business", "services", "agency"],
    "supportsUpload": ["linkedin-pdf", "resume"]
  }
]
```

### Project creation
`createFromTemplate` mutation gains an optional `template` parameter (defaults to `"default"` for backward compat). Template path resolves to `resources/templates/{id}/`.

### Gallery UI
New view accessible from:
- Home screen (replaces or sits above the prompt input)
- Projects screen ("+ New from Template")

Card grid with: thumbnail, name, one-line description. Click → preview → "Use This Template".

## Wizard (future version)

Not in v1. Planned for Phase 14 or later.

The wizard would be a guided setup flow: business type → style preferences → pages needed → tone → generates a tailored starting point. This is complementary to templates, not a replacement.

## Quality bar

Each template must:
- Look production-ready at first render (no lorem ipsum, no broken layouts)
- Be fully responsive (mobile, tablet, desktop)
- Score 90+ on Lighthouse (performance, accessibility, SEO)
- Have meaningful placeholder content (not "Lorem ipsum dolor sit amet")
- Include all shadcn components it needs (no install step for the user)
- Work immediately after `npm install && npm run dev`

## Build sequence for Phase 8b

1. **Source 5 templates from Lovable/v0** — clone, genericise, download, verify stack
2. **Template registry** — `templates.json` manifest + thumbnails bundled in app
3. **Gallery UI** — card grid on home screen, preview, "Use Template" action
4. **createFromTemplate update** — support template selection (not just default)
5. **Template-specific CLAUDE.md** — each template gets AI instructions for customisation
6. **Screenshots and metadata** — thumbnails, descriptions, categories for gallery
