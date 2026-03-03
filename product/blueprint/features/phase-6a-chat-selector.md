# Phase 6a — Chat selector dialog

Replace the persistent chats panel (column 2) with a `CommandDialog` overlay triggered by the clock icon.

## Current state

### Layout (4 columns)

```
┌──────────┬───────────┬──────────────────┬──────────────────┐
│ Sidebar  │ Sub-chats │ Chat             │ Preview          │
│ (layout) │ (content) │ (active-chat)    │ (agent-preview)  │
└──────────┴───────────┴──────────────────┴──────────────────┘
```

- **Column 1** — `AgentsSidebar` in `agents-layout.tsx` L312-336. Resizable (160-300px). Contains workspace/project selector and main chat list.
- **Column 2** — `AgentsSubChatsSidebar` in `agents-content.tsx` L1018-1044. Resizable (160-300px). Contains sub-chat list within a workspace. Can collapse to tabs in the chat header via `agentsSubChatsSidebarModeAtom` ("sidebar" | "tabs").
- **Column 3** — `ChatView` in `agents-content.tsx` L1061-1069. Main chat area.
- **Column 4** — Preview, terminal, diff, details sidebars inside `ChatView`.

### Clock icon

- **File:** `sub-chat-selector.tsx` L79-166 (`SearchHistoryPopover`)
- **Currently:** opens a `SearchCombobox` popover listing **sub-chats** (tabs within a workspace)
- **Trigger:** clock icon button, disabled when `allSubChatsLength === 0`
- **Data:** `sortedSubChats` from `useAgentSubChatStore`
- **Selection handler:** `onSwitchFromHistory` — opens the sub-chat tab

### Sub-chat selector header

- **File:** `sub-chat-selector.tsx` L184-1067 (`SubChatSelector`)
- **Contains:** hamburger menu, open-sidebar button, scrollable tabs, plus button, clock icon, diff button, terminal button, preview button
- **Props:** `onCreateNew`, `onOpenPreview`, `onOpenDiff`, `onOpenTerminal`, `chatId`

## Target state (ProductVibe mode)

### Layout (2 columns, 3 when sidebar open)

```
When sidebar closed:
┌──────────────────────┬──────────────────────────────┐
│ Chat                 │ Preview                      │
└──────────────────────┴──────────────────────────────┘

When sidebar open:
┌──────────┬───────────────────┬──────────────────────┐
│ Sidebar  │ Chat              │ Preview              │
└──────────┴───────────────────┴──────────────────────┘
```

### Chat header (ProductVibe mode)

```
┌───────────────────────────────────────────────────────────┐
│ ☰  🕐  +            Chat title        [diff] [term]  🌐  │
└───────────────────────────────────────────────────────────┘
```

- Left: hamburger (workspaces toggle, unchanged), clock icon (opens chat selector dialog), plus button (new sub-chat, unchanged)
- Center: current chat title
- Right: diff, terminal, preview buttons (unchanged — hiding these is a separate Phase 6 step)
- Hidden: scrollable sub-chat tabs, open-sidebar button

### Chat selector dialog

A `CommandDialog` from shadcn. Reuses the existing chat list UI — no new design.

```
┌─────────────────────────────┐
│ 🔍 Search chats...          │
├─────────────────────────────┤
│ + New Chat                  │
│─────────────────────────────│
│ 🤖 make the hero red    2m │
│ 🤖 change the nav      15m │
│ 🤖 first chat           1h │
└─────────────────────────────┘
```

- **Search:** filters sub-chats by name (reuse `SearchCombobox` filter logic)
- **"New Chat":** first item, calls `onCreateNew`
- **Chat items:** reuse `SearchHistoryPopover.renderItem` layout (icon + name + time ago)
- **Selection:** switches to sub-chat, closes dialog
- **Dismiss:** Esc, click outside

## Build steps

### Step 1 — Create `ChatSelectorDialog` component

**New file:** `app/src/renderer/features/agents/ui/chat-selector-dialog.tsx`

Extract and adapt from `SearchHistoryPopover` in `sub-chat-selector.tsx`:

- Use shadcn `CommandDialog` (dialog + command) instead of `SearchCombobox` (popover + command)
- Props: `open`, `onOpenChange`, `sortedSubChats`, `loadingSubChats`, `subChatUnseenChanges`, `pendingQuestionsMap`, `pendingPlanApprovals`, `onSelect`, `onCreateNew`
- Reuse the existing `renderItem` logic from `SearchHistoryPopover` (icon + name + time ago)
- Add "New Chat" as first `CommandItem` with `Plus` icon
- Wire `onSelect` to switch sub-chat and close dialog
- Wire `onCreateNew` to create new sub-chat and close dialog

### Step 2 — Wire clock icon to dialog in ProductVibe mode

**File:** `sub-chat-selector.tsx`

In `SubChatSelector`:

- Import `productVibeModeAtom`
- When `productVibeMode`:
  - Clock icon toggles a `ChatSelectorDialog` (state: `isChatSelectorOpen`)
  - Pass sub-chat data + handlers to the dialog
- When not `productVibeMode`:
  - Keep existing `SearchHistoryPopover` behaviour (no change)

### Step 3 — Hide sub-chat tabs in ProductVibe mode

**File:** `sub-chat-selector.tsx`

In `SubChatSelector`, when `productVibeMode`:

- Hide scrollable tabs container (L680-913) — sub-chat navigation moves to the dialog
- Hide open-sidebar button (L660-678) — sub-chats sidebar is hidden (step 4)
- Keep hamburger button — toggles workspaces sidebar (not changing)
- Keep plus button — quick new sub-chat action
- Hide terminal button — not for end users
- Keep diff button — separate Phase 6 step
- Keep preview button

### Step 4 — Hide sub-chats sidebar in ProductVibe mode

**File:** `agents-content.tsx`

In desktop layout (L1014-1082):

- When `productVibeMode`, don't render the `ResizableSidebar` wrapping `AgentsSubChatsSidebar` (L1018-1044)
- Or: set `isOpen={false}` and skip the toggle logic

### Step 5 — Verify and test

- Toggle `productVibeMode` on:
  - Sub-chats sidebar (column 2) is gone
  - Chat header shows only clock icon + chat title
  - Clock icon opens `ChatSelectorDialog`
  - "New Chat" creates a new sub-chat
  - Selecting a chat switches to it
  - Esc closes the dialog
- Toggle `productVibeMode` off:
  - Everything works as before (no regression)

## Files changed

| File | Change |
|------|--------|
| `features/agents/ui/chat-selector-dialog.tsx` | **New.** `CommandDialog` with search + "New Chat" + chat list. |
| `features/agents/ui/sub-chat-selector.tsx` | Wire clock icon to dialog in ProductVibe mode. Hide dev icons. |
| `features/agents/ui/agents-content.tsx` | Hide sub-chats sidebar in ProductVibe mode. |

## Dependencies

- shadcn `CommandDialog` — should already exist in `components/ui/command.tsx` (check for `CommandDialog` export, may need to add it)
- `productVibeModeAtom` — already available

## Not in scope

- Hiding column 1 (workspaces sidebar) — kept as-is per plan
- Hiding terminal/diff/details sidebars — separate Phase 6 step
- Message simplification — separate Phase 6 step
- Chat input simplification — separate Phase 6 step
