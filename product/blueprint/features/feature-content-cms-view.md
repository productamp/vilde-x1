# Feature — Project Content (CMS) View

Add a content management feature for each individual project.

This is a major product feature:
- A new `Content` button appears after `Preview` (alongside other project views).
- `Blog` is the default content type in this CMS.
- Users can also create and manage additional content types.
- Users can view, edit, and publish content directly in ProductVibe.
- Chat can generate and edit CMS content in the same workflow.
- Optional `Autopilot` workflows (Pro) can schedule and automate content generation/adaptation.

## User flow

1. Open a project.
2. Click `Content` (after `Preview`).
3. See content collections (default `Blog` plus optional additional content types).
4. Open any content item.
5. View and edit content directly.
6. Save and publish updates.

## Content view structure

- Collection list panel (`Blog` by default, plus other content types)
- Content item list panel (title, status, date, language/category if available)
- Content editor panel (read/edit mode)
- Actions: create item, edit item, save, publish/draft state
- Search/filter for quickly finding content

## Chat integration

- Chat can create new content items directly
- Chat can update existing content items directly
- Manual edits and chat edits stay in sync
- Users can prompt chat for content tasks (for example: "write a new post", "rewrite this section", "change tone")

## Editorial sub-view (inside Content)

Each content collection/item can have editorial controls:

- Style (for example: simple, premium, technical, friendly)
- Tone (for example: professional, casual, bold, warm)
- Voice guidelines
- Audience level
- Length/depth preferences
- SEO/editorial preferences (headings, summary style, CTA style, etc.)

## Behavior

- Always project-specific (not global across projects)
- Reads/writes from the real content source used by the website
- If content files change, this view refreshes
- If users edit in Content view, source files update
- If chat edits or creates content, this view reflects those changes
- If Autopilot workflows run, generated/adapted content appears in this same CMS workflow

## Goal

Give users an integrated website + CMS workflow in one interface, with blog as the default entry point and flexible content expansion beyond blog.
