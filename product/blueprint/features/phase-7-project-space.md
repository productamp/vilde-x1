# Phase 7 — Project space

Replace the sidebar workspace panel with a full-screen projects view. Feature-flag the panel approach so 1Code mode keeps working.

## Current state

### Layout (ProductVibe mode, sidebar open)

```
┌─────────────────────────────────────────────────────────┐
│ ProductVibe                                   (header)  │
├──────────┬──────────────────┬───────────────────────────┤
│ Sidebar  │ Chat             │ Preview                   │
│ 160-300  │ (active-chat)    │ (agent-preview)           │
│          │                  │                           │
│ Search   │                  │                           │
│ + New WS │                  │                           │
│ ws list  │                  │                           │
│          │                  │                           │
│ footer   │                  │                           │
└──────────┴──────────────────┴───────────────────────────┘
```

- **Sidebar** — `AgentsSidebar` in `agents-layout.tsx` L318-342. Resizable (160-300px). Contains search, "New Workspace" button, workspace list (pinned + recent), footer with settings/help/archive.
- **Chat** — `ChatView` in `agents-content.tsx` L1061-1069. Main chat area.
- **Preview** — Inside `ChatView`. Preview iframe, files tab.

### Key files

| File | What |
|------|------|
| `agents-layout.tsx` | Outer shell. Renders `ResizableSidebar` > `AgentsSidebar` + `AgentsContent`. |
| `agents-content.tsx` | Switches between chat, new-chat, settings, automations based on `desktopViewAtom`. |
| `agents-sidebar.tsx` | ~3500 LOC. Workspace list, search, creation, archive/pin, footer nav. |
| `atoms/index.ts` L1022 | `DesktopView = "automations" \| "automations-detail" \| "inbox" \| "settings" \| null` |
| `product-vibe-header.tsx` | Global header bar with traffic lights + "ProductVibe" label. |
| `select-repo-page.tsx` | Full-screen "no project selected" page (create/open/clone). |
| `product-vibe.ts` | `productVibeModeAtom` — the main feature flag. |

### Navigation model

Atom-driven, no URL router:

- `selectedProjectAtom = null` → `SelectRepoPage` (full-screen takeover in `App.tsx`)
- `selectedProjectAtom != null` → `AgentsLayout`
- `desktopViewAtom = "settings"` → `SettingsContent` replaces chat area
- `desktopViewAtom = null` + `selectedAgentChatIdAtom != null` → `ChatView`
- `desktopViewAtom = null` + `selectedAgentChatIdAtom = null` → `NewChatForm`

## Target state

### Feature flag

New atom: `projectsScreenModeAtom`

```typescript
// In product-vibe.ts or a new file
export const projectsScreenModeAtom = atomWithStorage<boolean>(
  "preferences:projects-screen-mode",
  false, // default off — toggled on by productVibeMode derived logic
  undefined,
  { getOnInit: true },
)
```

Derived behaviour:
- `productVibeMode === true` → `projectsScreenMode` defaults to `true`
- `productVibeMode === false` → `projectsScreenMode` defaults to `false`
- Either can be overridden independently for testing

All new changes in this phase gate on `projectsScreenMode`, not `productVibeMode` directly.

### Layout (projects screen mode ON)

```
No chat selected — Projects screen:
┌─────────────────────────────────────────────────────────┐
│ ProductVibe                                   (header)  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│         ┌─────────────────────────────────┐             │
│         │ 🔍 Search projects...           │             │
│         ├─────────────────────────────────┤             │
│         │ + New Project                   │             │
│         │─────────────────────────────────│             │
│         │ 🌐 My Yoga Studio        2m    │             │
│         │ 🌐 Airbnb Landing       15m    │             │
│         │ 🌐 Portfolio Site         1h   │             │
│         └─────────────────────────────────┘             │
│                                                         │
└─────────────────────────────────────────────────────────┘

Chat selected — Chat + Preview (no sidebar):
┌─────────────────────────────────────────────────────────┐
│ ProductVibe                                   (header)  │
├────────────────────────┬────────────────────────────────┤
│ Chat                   │ Preview                        │
│ ← Projects  🕐  +     │                                │
│                        │                                │
└────────────────────────┴────────────────────────────────┘
```

- No sidebar panel. Full width for content.
- Projects screen is the home view when no chat is active.
- "← Projects" button in chat header navigates back.

### Layout (projects screen mode OFF — 1Code default)

No change. Sidebar panel works exactly as before.

## New atom value

Add `"projects"` to `DesktopView`:

```typescript
export type DesktopView = "automations" | "automations-detail" | "inbox" | "projects" | "settings" | null
```

When `desktopViewAtom === "projects"`, `AgentsContent` renders the new `ProjectsScreen` component.

## New component: `ProjectsScreen`

**File:** `app/src/renderer/features/agents/ui/projects-screen.tsx`

A full-page centered view. Not a sidebar — it replaces the entire content area.

### Data

- `trpc.chats.list.useQuery({})` — all workspaces (same as sidebar)
- `trpc.projects.list.useQuery()` — all projects (for name/path lookup)
- Join chats to projects via `chat.projectId → project`

### Display

- Centered card (max-width ~480px)
- Search input at top (filters by project name or chat name)
- "New Project" action (reuses `trpc.projects.createFromTemplate` flow from `SelectRepoPage`)
- Project list sorted by `updatedAt DESC`
- Each item shows: project name, time since last activity
- Click → sets `selectedAgentChatIdAtom` to the most recent chat for that project, clears `desktopViewAtom` to `null`

### Empty state

If no projects exist, show a friendly empty state with "Create your first project" button.

### Settings access

Gear icon in the header or footer of the projects screen. Sets `desktopViewAtom = "settings"`.

## Build steps

### Step 1 — Feature flag atom

**File:** `app/src/renderer/lib/product-vibe.ts`

Add `projectsScreenModeAtom`:

```typescript
const projectsScreenModeStorageAtom = atomWithStorage<boolean>(
  "preferences:projects-screen-mode",
  false,
  undefined,
  { getOnInit: true },
)

// Derived: follows productVibeMode by default, can be overridden
export const projectsScreenModeAtom = atom(
  (get) => {
    const stored = get(projectsScreenModeStorageAtom)
    const productVibe = get(productVibeModeAtom)
    // If productVibe is on and user hasn't explicitly toggled, default to true
    return stored || productVibe
  },
  (_get, set, value: boolean) => set(projectsScreenModeStorageAtom, value),
)
```

Note: the exact derivation logic may need tuning. The simple approach is: `productVibeMode` implies `projectsScreenMode` unless explicitly overridden. Consider whether the stored value should be `null | boolean` to distinguish "user chose" from "default".

### Step 2 — Extend `DesktopView` type

**File:** `app/src/renderer/features/agents/atoms/index.ts` L1022

```diff
- export type DesktopView = "automations" | "automations-detail" | "inbox" | "settings" | null
+ export type DesktopView = "automations" | "automations-detail" | "inbox" | "projects" | "settings" | null
```

### Step 3 — Create `ProjectsScreen` component

**New file:** `app/src/renderer/features/agents/ui/projects-screen.tsx`

- Centered layout with constrained width
- Search input (local filter, no debounce needed for small lists)
- "New Project" row/button
- Project list items: name, relative time, click handler
- Reuse existing tRPC queries (`chats.list`, `projects.list`)
- On project select:
  1. `setSelectedAgentChatId(mostRecentChatForProject)`
  2. `setSelectedProject(project)`
  3. `setDesktopView(null)` — returns to chat view
- On "New Project":
  1. Show name input (inline or small dialog)
  2. Call `trpc.projects.createFromTemplate`
  3. Call `trpc.chats.createForNewProject`
  4. Set atoms, navigate to chat view
- Settings gear icon (if no other access point is available)

### Step 4 — Wire `ProjectsScreen` into `AgentsContent`

**File:** `app/src/renderer/features/agents/ui/agents-content.tsx`

In the desktop layout switch (L1053-1082), add the `"projects"` case:

```diff
  {desktopView === "settings" ? (
    <SettingsContent />
+ ) : desktopView === "projects" ? (
+   <ProjectsScreen />
  ) : betaAutomationsEnabled && desktopView === "automations" ? (
```

### Step 5 — Hide sidebar in projects-screen mode

**File:** `app/src/renderer/features/layout/agents-layout.tsx`

Gate the `ResizableSidebar` wrapping `AgentsSidebar` on `!projectsScreenMode`:

```diff
+ const projectsScreenMode = useAtomValue(projectsScreenModeAtom)
  ...
- <ResizableSidebar
-   isOpen={!isMobile && sidebarOpen}
-   ...
- >
-   {isSettingsView ? <SettingsSidebar /> : <AgentsSidebar ... />}
- </ResizableSidebar>
+ {!projectsScreenMode ? (
+   <ResizableSidebar
+     isOpen={!isMobile && sidebarOpen}
+     ...
+   >
+     {isSettingsView ? <SettingsSidebar /> : <AgentsSidebar ... />}
+   </ResizableSidebar>
+ ) : isSettingsView ? (
+   <ResizableSidebar ...>
+     <SettingsSidebar />
+   </ResizableSidebar>
+ ) : null}
```

Note: `SettingsSidebar` still needs to render when `desktopView === "settings"` even in projects-screen mode. Consider whether settings should use the sidebar or render as a full-page view in projects-screen mode. Simplest: keep `SettingsSidebar` as a full-page view when `projectsScreenMode` is on.

### Step 6 — Auto-route to projects screen

**File:** `app/src/renderer/features/agents/ui/agents-content.tsx`

When `projectsScreenMode` is on and no chat is selected, auto-set `desktopView = "projects"`:

```typescript
useEffect(() => {
  if (projectsScreenMode && !selectedChatId && !desktopView) {
    setDesktopView("projects")
  }
}, [projectsScreenMode, selectedChatId, desktopView])
```

Also: when a chat is archived/deleted and `selectedChatId` becomes null, this effect kicks in and returns the user to the projects screen.

### Step 7 — "Back to projects" in chat header

**File:** `app/src/renderer/features/agents/ui/sub-chat-selector.tsx` or `active-chat.tsx`

When `projectsScreenMode` is on, replace the hamburger (sidebar toggle) with a "← Projects" back button:

- On click: `setDesktopView("projects")` + `setSelectedChatId(null)`
- This is the primary navigation to get back to the projects list

### Step 8 — Remap `Cmd+B`

**File:** `app/src/renderer/features/agents/lib/agents-hotkeys-manager.ts`

When `projectsScreenMode` is on:
- `Cmd+B` navigates to/from projects screen instead of toggling sidebar
- If on projects screen: no-op or focus search
- If on chat view: `setDesktopView("projects")` + `setSelectedChatId(null)`

### Step 9 — Terminology pass

Rename user-facing strings from "Workspace" to "Project" across:

| Location | Current | New |
|----------|---------|-----|
| Sidebar search placeholder | "Search workspaces..." | "Search projects..." |
| Sidebar "New Workspace" button | "New Workspace" | "New Project" |
| Quick-switch dialog title | (implicit) | Reference "projects" |
| Chat selector dialog | "New Chat" | Keep (it's sub-chats, not projects) |
| Archive toast messages | "Workspace archived" | "Project archived" |
| Settings > Projects tab | (already "Projects") | Keep |

Note: Internal code naming (`chats`, `agentChats`, `AgentsSidebar`) stays unchanged. Only user-visible strings change.

### Step 10 — Verify and test

**Projects screen mode ON (ProductVibe):**
- [ ] App starts → projects screen (no sidebar)
- [ ] Projects list shows all projects sorted by recency
- [ ] Search filters projects
- [ ] "New Project" creates project + first chat, navigates to chat view
- [ ] Clicking a project navigates to its most recent chat
- [ ] Chat view has no sidebar, "← Projects" button in header
- [ ] "← Projects" returns to projects screen
- [ ] `Cmd+B` returns to projects screen from chat view
- [ ] Archiving last chat in a project returns to projects screen
- [ ] Settings accessible from projects screen
- [ ] Quick-switch (`Ctrl+Tab`) still works between workspaces

**Projects screen mode OFF (1Code):**
- [ ] Everything works exactly as before — sidebar panel, no projects screen
- [ ] No regressions in sidebar, chat, preview, sub-chats

## Files changed

| File | Change |
|------|--------|
| `lib/product-vibe.ts` | Add `projectsScreenModeAtom` |
| `features/agents/atoms/index.ts` | Add `"projects"` to `DesktopView` type |
| `features/agents/ui/projects-screen.tsx` | **New.** Full-page projects list with search + create + select. |
| `features/agents/ui/agents-content.tsx` | Add `"projects"` case, auto-route effect |
| `features/layout/agents-layout.tsx` | Gate sidebar behind `!projectsScreenMode` |
| `features/agents/ui/sub-chat-selector.tsx` | "← Projects" back button in `projectsScreenMode` |
| `features/agents/lib/agents-hotkeys-manager.ts` | Remap `Cmd+B` in `projectsScreenMode` |
| `features/sidebar/agents-sidebar.tsx` | Terminology: "Workspace" → "Project" in user-facing strings |
| Various dialogs/toasts | Terminology pass |

## Dependencies

- shadcn `Command` — already in `components/ui/command.tsx`
- `productVibeModeAtom` — already available
- `trpc.chats.list`, `trpc.projects.list`, `trpc.projects.createFromTemplate`, `trpc.chats.createForNewProject` — all existing

## Not in scope

- Changing the database schema (chats table stays as-is)
- Modifying `AgentsSidebar` internals (it keeps working for 1Code mode)
- Project thumbnails/previews in the list (stretch goal for later)
- Multi-window project isolation
- `SelectRepoPage` changes (still handles the "no project at all" case)
- Message view simplification (Phase 11)
- Settings simplification (Phase 11)
