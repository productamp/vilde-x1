# Feature — Data Analytics

Add a built-in analytics setup and data refresh feature for each project.

This is a **Pro** feature:
- Guide users through analytics integration setup.
- Connect analytics to the generated/published website.
- Pull fresh analytics data on user-triggered refresh.
- Surface key website/content performance metrics in ProductVibe.
- Generate clear AI recommendations on what to improve next.

## User flow

1. Open a project.
2. Click `Analytics`.
3. Run a guided setup wizard (provider, tracking config, connection check).
4. Save integration.
5. Click `Refresh data` whenever new metrics are needed.
6. View updated analytics in the project analytics view.
7. Review `What to improve next` recommendations and suggested actions.

## Behavior

- Pro-only capability.
- Setup should be no-code and friendly for non-technical users.
- Data pulls happen on explicit user refresh (manual pull-first model).
- Show clear last-sync timestamp and sync status.
- Handle disconnected/invalid integration states with clear recovery actions.
- After each refresh, generate a short prioritized analysis:
  - What is underperforming
  - Why it likely underperforms
  - What to change next (content, SEO, page UX, CTA, traffic mix)

## Initial metrics scope

- Traffic overview (sessions/users/page views)
- Top pages
- Traffic sources/channels
- Basic content performance (top posts/pages by views and engagement)

## Insight output (recommended)

- `Top opportunities` (3-5 prioritized items)
- `Quick wins` (fast changes with expected impact)
- `Content recommendations` (new topics, refresh old posts, internal linking)
- `Conversion recommendations` (CTA placement/copy, form friction, trust signals)
- `Next 7-day action plan` (simple checklist for non-technical users)

## Open design/workflow decisions

- First analytics providers to support.
- Refresh rate limits and caching strategy.
- Whether to add optional scheduled refresh later.
- How deeply analytics should connect to content recommendations.

## Goal

Give small business users a simple way to connect analytics, pull performance data on demand, and receive clear guidance on what to improve next based on real usage signals.
