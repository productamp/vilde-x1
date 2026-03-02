# Phase 7 — Project space

The projects dashboard is the app's home page. It has its own sidebar (`MainSidebar`) with nav links and footer icons. The workspace sidebar (`AgentsSidebar`) is feature-flagged out in ProductVibe mode. New projects go straight to the chat view.

## Architecture

### Three sidebars, context-switched in `agents-layout.tsx`

| Context | Sidebar | Condition |
|---------|---------|-----------|
| Home (projects view) | `MainSidebar` | `!selectedChatId` (default) |
| Inside a workspace | `AgentsSidebar` | `selectedChatId && !productVibeMode` |
| Settings | `SettingsSidebar` | `desktopView === "settings"` |
| ProductVibe + workspace | *Hidden* | `productVibeMode && selectedChatId` |

The entire `ResizableSidebar` is unmounted when in ProductVibe mode with a chat selected — no sidebar at all inside a workspace.

### Navigation model (atom-driven, no URL router)

```
desktopView === "projects"  →  ProjectsScreen (card grid)
desktopView === "settings"  →  SettingsContent
desktopView === null + selectedChatId  →  ChatView
desktopView === null + !selectedChatId  →  auto-routes to "projects"
```

### Feature flags

- `productVibeModeAtom` — main ProductVibe toggle
- `projectsScreenModeAtom` — projects-screen feature flag (auto-enabled when productVibeMode is on, can be overridden independently)

## Layout

### Home — Projects dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ ProductVibe                                       (header)  │
├───────────┬─────────────────────────────────────────────────┤
│ Main      │ Projects    Recents│All│Archived    🔍          │
│ Sidebar   │─────────────────────────────────────────────────│
│           │ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ + New     │ │          │ │          │ │          │         │
│           │ │  (thumb) │ │  (thumb) │ │  (thumb) │         │
│ Recents   │ │          │ │          │ │          │         │
│ All       │ └──────────┘ └──────────┘ └──────────┘         │
│ Archived  │ My Yoga       Airbnb       Portfolio            │
│           │ Edited 2m     Edited 15m   Edited 1h            │
│ ──────    │                                                 │
│ ⚙ ? 📦   │                                                 │
│ Feedback  │                                                 │
└───────────┴─────────────────────────────────────────────────┘
```

### Workspace — Chat + Preview (ProductVibe mode)

```
┌─────────────────────────────────────────────────────────────┐
│ ProductVibe                                       (header)  │
├────────────────────────────┬────────────────────────────────┤
│ ← Projects   🕐  +        │ Preview                        │
│ Chat                       │                                │
│                            │                                │
└────────────────────────────┴────────────────────────────────┘
```

No sidebar. Full width for chat + preview.

## Key files

| File | Role |
|------|------|
| `features/sidebar/main-sidebar.tsx` | **New.** Home sidebar — logo, "New Project" button, nav links (Recents/All/Archived), footer (Settings, Help, Archive, Feedback) |
| `features/agents/ui/projects-screen.tsx` | **New.** Card grid — Paper-style design with filter tabs in header, neutral thumbnail cards, title/subtitle below cards |
| `features/layout/agents-layout.tsx` | Sidebar context-switch: MainSidebar / AgentsSidebar / SettingsSidebar / hidden |
| `features/agents/atoms/index.ts` | `DesktopView` type, `ProjectsFilter` type, `projectsFilterAtom` |
| `lib/product-vibe.ts` | `projectsScreenModeAtom` feature flag |
| `features/agents/ui/agents-content.tsx` | Routes `desktopView === "projects"` → `ProjectsScreen`, auto-route effect |
| `features/agents/ui/sub-chat-selector.tsx` | "← Projects" back button when `projectsScreenMode` is on |

## Design decisions

### ProjectsScreen (Paper-inspired)

- **Header toolbar** (`h-12`): title left, pill-style filter tabs center (`bg-muted/50` track, `bg-background shadow-sm` active), collapsible search icon right
- **Card grid**: `grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5`
- **Cards**: neutral `bg-muted/40 rounded-xl border border-border` thumbnail (aspect 4:3), title + timestamp *below* the card (not inside). Hover: border lightens + `shadow-sm`
- **No create UI in the grid** — "New Project" lives only in the sidebar
- **Filter tabs duplicate sidebar nav links** — sidebar links navigate to the projects view AND set the filter; header tabs switch filter while already on the view

### MainSidebar

- **Header**: Logo + "ProductVibe" label (no traffic lights — those are in ProductVibeHeader above)
- **"New Project" button**: Primary-styled, creates an "Untitled" project + chat via `createFromTemplate` + `createForNewProject` and navigates straight to the chat view (the "What do you want to get done?" page)
- **Nav links**: Recents (default, sorted by activity), All (alphabetical), Archived (archived chats grouped by project). Clicking navigates to projects view + sets filter
- **Footer**: Settings (with hotkey tooltip), Help (`AgentsHelpPopover`), Archive (`ArchivePopover`, hidden when count=0), Feedback button. Exact same icon styling as workspace sidebar: `h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50`

### AgentsSidebar gating

- `AgentsSidebar` is fully feature-flagged out in ProductVibe mode: condition is `selectedChatId && !productVibeMode`
- In 1Code mode (productVibeMode off), `AgentsSidebar` works exactly as before when a chat is selected
- `Cmd+\` toggles the sidebar normally (the Phase 7 override that navigated to projects was reverted)

### Terminology

User-facing "Workspace" → "Project" across sidebar, kanban, archive, hotkeys, details panel (~9 files). Internal code names (`chats`, `agentChats`, `AgentsSidebar`) unchanged.

## Filter logic (`projectsFilterAtom`)

```typescript
type ProjectsFilter = "recents" | "all" | "archived"
```

| Filter | Data source | Sort |
|--------|------------|------|
| `recents` | `trpc.chats.list` (non-archived) grouped by project | `updatedAt DESC` |
| `all` | Same as recents | `projectName ASC` (alphabetical) |
| `archived` | `trpc.chats.listArchived` grouped by project | `archivedAt DESC` |

## Verification

**ProductVibe mode ON:**
- [x] App starts → projects screen with MainSidebar
- [x] Card grid shows projects with neutral thumbnails
- [x] Filter tabs (Recents/All/Archived) filter the grid
- [x] Sidebar nav links match filter tabs
- [x] "New Project" in sidebar creates project and navigates to chat view
- [x] Clicking a project card navigates to its most recent chat
- [x] Chat view has no sidebar, "← Projects" button in header
- [x] "← Projects" returns to projects screen with MainSidebar
- [x] Settings accessible from sidebar footer
- [x] `Cmd+\` toggles sidebar visibility

**ProductVibe mode OFF (1Code):**
- [x] Sidebar panel works exactly as before
- [x] No MainSidebar or projects screen appears
- [x] No regressions

## Not in scope

- Project thumbnails/previews (stretch goal — currently neutral `bg-muted/40`)
- Database schema changes
- Multi-window project isolation
- Message view simplification (future phase)
