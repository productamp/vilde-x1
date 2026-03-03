# Feature — Website Migration

Add a migration feature to import an existing website into ProductVibe.

This is a major product feature:
- User enters an existing website URL.
- Product automatically captures screenshots and structural snapshots.
- Product converts the result into our React application structure.
- User can continue editing in chat and product views after migration.

## User flow

1. User opens `Migrate Website`.
2. User enters a live website URL.
3. Product runs automated capture (screenshots + snapshots).
4. Product generates a React version inside the project.
5. User reviews and continues editing/refining.

## Behavior

- Designed for fast import of existing sites.
- Migration output should be editable immediately in normal project workflow.
- Keep the process simple for non-technical users (URL in, project out).
- Under the hood, this uses a Vercel agent-browser approach to drive capture and extraction.

## Goal

Let users bring an existing website into ProductVibe quickly, so they can modernize and iterate without rebuilding from scratch.
