# Feature — Guided First Version Generation

Add a feature to improve how the first website version is generated.

This feature is for non-technical small business owners:
- They are not prompt experts.
- They should be able to talk naturally about their business and goals.
- The product should translate that conversation into a clear plan and first website version.

This is a simple product feature:
- Before generation starts, the product runs a short pre-prompt chat with the user.
- The system turns that conversation into a structured brief document.
- The website is generated from that brief.
- The user can open the brief, edit it, and regenerate if needed.

## User flow

1. User starts a new project.
2. Product opens a guided pre-prompt chat ("what do you want to build?").
3. Product generates a clear brief document from the answers.
4. User reviews the brief.
5. User can click and edit the brief directly.
6. Product generates the first website version based on the brief.
7. If needed, user updates the brief and regenerates.

## Brief structure

- Business/context summary
- Website goals
- Target audience
- Pages/sections needed
- Content and tone direction
- Visual direction preferences
- Optional constraints (timeline, must-haves, exclusions)

## Behavior

- The brief is project-specific.
- The brief is visible and editable by the user.
- Generation should always reference the latest saved brief.
- Chat and brief stay aligned (chat answers feed the brief; brief edits affect generation).

## Goal

Improve first-generation quality and reduce back-and-forth by creating a shared, editable brief before building the first version of the website.

## Primary user

Small business owners who are not tech-savvy and do not know how to prompt effectively, but know what outcome they want.
