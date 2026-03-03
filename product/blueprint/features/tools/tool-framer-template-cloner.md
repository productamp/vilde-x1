# Tool — Framer Template Cloner (Claude Code + Ralph Loop)

Clone a Framer site/template into a reusable ProductVibe starter template using a simple scripted loop.

## Purpose

Provide a fast, repeatable internal workflow for turning high-quality Framer layouts into neutral, editable templates for ProductVibe's template library.

## Scope

- Source: public Framer templates/sites only.
- Output: reusable ProductVibe template (not a 1:1 branded copy).
- Process: lightweight Claude Code prompt + `script` and `ralph loop` refinement passes.

## Input

- Framer URL (template page or published site)
- Target template type (`business`, `product`, `portfolio`, `restaurant`)
- Output stack (`HTML + Tailwind + DaisyUI` or `Vite + React + Tailwind + shadcn`)

## Claude Code starter prompt (operator)

Use this as the base prompt:

`Clone the structure and style direction of this Framer site into our target stack as a reusable template, not a branded copy. Keep layout patterns, section hierarchy, spacing rhythm, and component intent. Replace all brand copy/assets with neutral placeholders. Preserve responsive behavior and animation intent using stack-native patterns. Output production-ready files and a short conversion report.`

## Ralph loop (simple quality loop)

1. **R1 — Recreate:** Generate first pass from URL reference.
2. **R2 — Audit:** Compare against reference for layout parity (desktop + mobile), section order, spacing, typography, CTA hierarchy.
3. **R3 — Level-up:** Fix the largest visual deltas and weak components; normalize to ProductVibe section patterns.
4. **R4 — Harden:** Remove leftover brand/IP artifacts, ensure accessibility basics, finalize responsive behavior.
5. **R5 — Hand-off:** Export template package + metadata (name, category, tags, preview notes).

## Output

- Template files in target stack
- Template metadata for library ingestion:
  - `name`
  - `category`
  - `tags`
  - `source_reference_url`
  - `license_notes`
- Short QA report (what matched, what changed, known gaps)

## Guardrails

- Respect Framer template/site rights and creator terms.
- Do not copy trademarks, logos, product names, or proprietary media.
- Keep outputs generic, reusable, and safe for distribution in ProductVibe.
- Treat Framer references as design/structure input unless explicit reuse rights are confirmed.

## Goal

Make Framer-inspired template production fast and consistent so ProductVibe can scale a high-quality starter library with minimal manual design work.

