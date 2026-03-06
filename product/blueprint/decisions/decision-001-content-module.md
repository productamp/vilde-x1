# Decision 001 — Content Module

**Date:** 2026-03-06
**Status:** Decided

## Decision

The content/CMS module will use a **custom implementation**. We will not use Keystatic or any third-party headless CMS library.

## Rationale

- Keystatic adds unnecessary dependency weight and configuration complexity for non-technical users.
- A custom implementation allows tight integration with the existing chat-first workflow.
- Content editing should feel native to the ProductVibe UX, not like a separate CMS.
- Simpler to iterate on without being constrained by a third-party schema or API.

## Scope

Custom content module will cover:
- Blog posts (markdown files in project)
- Site copy (editable text fields mapped to page sections)
- Media/image management

See Phase 9 in `product/plan.md` for implementation detail.
