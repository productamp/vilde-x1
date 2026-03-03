# Feature — Feedback & Feature Requests

Add a simple feedback/request feature so users can quickly report issues and request new features.

This is a simple product feature:
- A `Feedback` / `Request Feature` entry is available in the product.
- Clicking it jumps directly to the project's GitHub Issues flow.
- User can fill in and submit feedback or feature requests without friction.

## User flow

1. User clicks `Feedback` or `Request Feature`.
2. Product opens GitHub Issues (new issue form/templates).
3. User fills details and submits.

## Behavior

- Keep this flow very lightweight and direct.
- Route users to the right issue type (bug report vs feature request) when possible.
- Useful for both feedback and reporting new issues.

## Goal

Create a fast feedback loop from users to product team by sending users directly to GitHub issue submission.
