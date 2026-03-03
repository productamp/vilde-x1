# Feature — Content Autopilot

Add an automation layer for recurring, blog-first CMS output.
This runs through a dedicated web portal (auth + scheduler backend), while the app is the primary user interface for setup, connection, and control.

This is a **Pro** feature:
- Create scheduled workflows for automatic content generation.
- Auto-adapt existing content based on performance or freshness rules.
- Use approval modes (auto-publish or review-before-publish).
- Keep website and content operations in one workflow.
- Connect the app to a secure portal account where schedules and workflow jobs run behind the scenes.

## User flow

1. Open a project.
2. Click `Autopilot` inside `Content`.
3. Upgrade to Pro (if needed), then connect or create portal login (one-time auth).
4. Configure a workflow:
   - Content type (default Blog)
   - Frequency/schedule
   - Topic/source inputs
   - Voice/style/SEO constraints
   - Publish mode (draft, review, auto-publish)
5. Save and activate workflow.
6. Autopilot runs on schedule in the portal backend and generates or adapts content.
7. User reviews outputs, approves if required, and tracks results in the app.

## Portal and app connector model

- Web portal responsibilities:
  - User authentication and account/session management
  - Job scheduler and workflow runner
  - Workflow history, run logs, and retry handling
- App responsibilities:
  - Primary workflow setup/edit UX
  - Connection status and auth handoff
  - Approval/review actions and performance monitoring
- Integration contract:
  - Project-level secure token/session link between app and portal
  - Bi-directional sync of workflow config, run state, and output artifacts

## Behavior

- Pro-only capability.
- Login/auth is only required when Pro workflows are activated.
- Works on top of the existing Content (CMS) system.
- Supports both net-new content generation and updates to existing posts/pages.
- Every automated run logs what changed and why.
- Users can pause, edit, or disable workflows at any time.
- Safe defaults: review-before-publish unless explicitly switched to auto-publish.
- If portal auth expires or disconnects, workflows pause safely and prompt reconnect in app.
- App remains the canonical UI entry point; portal exists as the execution/control backend.

## Workflow primitives

- Triggers: schedule-based (daily/weekly/monthly) and manual run-now.
- Rules: target collections, topic categories, audience intent, content length.
- Actions: generate draft, update stale content, regenerate headlines/CTAs, localize variants.
- Output destinations: CMS draft queue, direct publish (if enabled), review inbox.

## Analytics loop integration

- Can consume analytics signals as optional inputs.
- Uses performance data to suggest:
  - which topics to create next,
  - which pages to refresh,
  - what format/tone adjustments to test.

## Open design/workflow decisions

- Minimum cadence controls and guardrails for automation volume.
- Cost/message budgeting per workflow.
- Multi-language autopilot behavior with translation dependencies.
- Brand/compliance checks before publish.
- Auth model (email/password, social auth, SSO for teams).
- Tenant isolation and data retention for portal job data.

## Goal

Turn content from ad-hoc manual production into a repeatable growth engine by combining portal-backed scheduling/execution with app-first workflow control and controlled publishing.
