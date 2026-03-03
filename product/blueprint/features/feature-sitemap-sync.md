# Feature — Project Sitemap Canvas

Add a sitemap feature for each individual project.

This is a simple product feature:
- A new `Sitemap` button appears next to `Preview`.
- Clicking it opens a visual canvas.
- The canvas shows the project's page structure (similar to Relume).
- The sitemap stays automatically synced with the generated website pages/routes.

## User flow

1. Open a project.
2. Click `Sitemap` (next to `Preview`).
3. See a canvas with connected page cards.
4. Click any page card to open a dialog with that actual page preview.

## Canvas style (based on your reference)

- Top-level project node at the top
- Child page nodes below (connected with lines)
- Each page card can show major page sections (navbar, hero, CTA, footer, etc.)
- Clean, lightweight canvas focused on structure only
- Clicking a card opens a preview dialog for that exact page

## Behavior

- Always project-specific (not global across projects)
- Auto-sync from real site pages/routes
- If pages/routes change, sitemap updates
- If a page is added/removed/renamed, the sitemap reflects it
- Page-card click behavior: open modal/dialog preview of the selected page

## Render and refresh model

- The sitemap is rendered as a derived view from the project's React routes/pages.
- It auto-refreshes when route/page files change.
- It is not a separate saved sitemap artifact that must be generated and stored.
- Core sync/render is handled by deterministic Node/TypeScript logic.
- AI is optional only for enrichment (for example, naming section blocks), not source of truth.

## Goal

Give users a clear visual map of their website structure from one click, without digging into files or code.
