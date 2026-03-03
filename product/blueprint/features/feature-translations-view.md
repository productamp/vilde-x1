# Feature — Project Translations View

Add a translations feature for each individual project.

This is a simple product feature:
- A new `Translations` button appears next to `Preview` (and alongside other project views).
- Clicking it opens a structured translations view.
- The view shows all languages available for the website in one place.
- It links to the translation library used by the project.
- It makes manual translation changes easy when needed.

## User flow

1. Open a project.
2. Click `Translations` (next to `Preview`).
3. See all translated languages and their content status.
4. Open any language and edit values manually.
5. Save changes and see them reflected in the website.

## View structure

- Language list (for example: English, Spanish, French, Arabic)
- Status per language (for example: complete, partial, missing)
- Structured keys/sections for easier navigation
- Search/filter to quickly find specific translation entries
- Clear manual edit inputs for each translation value

## Behavior

- Always project-specific (not global across projects)
- Reads from the real translation source used by the website
- If translations are updated in project files, this view refreshes
- If user edits translations in this view, project translation files are updated
- Keeps translation library linkage visible so users know where translations are coming from

## Goal

Give users a clean, non-technical way to review and edit multilingual website content without digging through code files.
