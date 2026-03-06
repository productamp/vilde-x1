# Decision 002 — shadcn Blocks in Template Codebase

**Date:** 2026-03-06
**Status:** Decided

## Decision

[shadcn-ui-blocks](https://github.com/shadcnblocks/shadcn-ui-blocks) will be **included directly in the default project template codebase** (e.g. `src/blocks/`), not stored as a shared resource in the Electron app bundle.

## Rationale

- Embedding blocks in the template allows different templates to use different block sets or a different stack entirely.
- Avoids coupling the app to a fixed block registry that all projects must share.
- Simpler mental model: the project is self-contained — blocks are just source files.
- No tRPC endpoint or on-demand copy mechanism needed.
- Easier for Claude to reference and adapt blocks since they live in the project root.

## Implementation

- Add `src/blocks/` to the default Vite + React + Tailwind + shadcn/ui starter template.
- Include the 55 free marketing blocks (hero, features, pricing, testimonials, CTA, etc.).
- Update `CLAUDE.md` in the template to instruct Claude to check `src/blocks/` before writing custom components.

## Supersedes

Replaces the earlier approach documented in Phase 8d of `product/plan.md` which proposed storing blocks in `app/resources/blocks/` and copying them on demand via a `blocks.use` tRPC endpoint.
