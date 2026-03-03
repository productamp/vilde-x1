# Feature — Project Design View

Add a design feature for each individual project.

This is a simple product feature:
- A new `Design` button appears after `Preview` (alongside other project views).
- Clicking it opens a structured design view.
- The design view has two parts (Lovable-style):
  - `Design System` (tokens and system settings)
  - `Visual Edits` (direct visual changes on UI)
- Users can make direct manual changes without editing code files.

## User flow

1. Open a project.
2. Click `Design` (after `Preview`).
3. Choose between `Design System` and `Visual Edits`.
4. Edit token values or make direct visual changes.
5. Save changes and see updates reflected across the website.

## View structure

### 1) Design System

- Token categories (colors, typography, spacing, borders/radius, effects)
- Token list with current values
- Clear edit controls for each token (value input/picker)
- Search/filter to quickly find tokens

### 2) Visual Edits

- Visual editing canvas/preview for direct UI changes
- Click-to-select elements and edit styling in context
- Common controls (spacing, font, color, radius, layout alignment)
- Undo/redo for safe iterative edits
- Live preview of visual changes before saving

## Behavior

- Always project-specific (not global across projects)
- Reads from the real design token source used by the website
- If token files change, this view refreshes
- If users edit tokens in this view, token source files are updated
- Changes propagate across pages/components using those tokens
- Visual edits should map back to the same underlying design system/style source

## Goal

Give users a simple, non-technical way to manage and update design consistency across their website by editing tokens directly.
