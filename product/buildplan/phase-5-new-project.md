# Phase 5 — New Project Flow

**Status: Implemented**

End-to-end flow for starting a new project. User clicks "Create new project" → app scaffolds template → installs deps → starts dev server → preview shows the site.

## Design decisions

- **No `node_modules` in template copy.** The bundled template has 352MB of `node_modules`. We copy only source files (~500KB). The existing `ensureDepsInstalled()` in `vite-dev-server.ts` runs `npm install` automatically when the preview starts.
- **Auto-create first chat.** Preview requires a `chatId` + `worktreePath`. To show the starter site immediately, we create the first chat automatically when the project is created and navigate straight to it.
- **Local mode (no worktree).** Template projects have no git repo. Chat is created with `useWorktree: false`, which sets `worktreePath = project.path`. Git can be initialized later if needed.
- **Fixed project location.** Projects go to `~/.21st/projects/{name}`. Non-technical users shouldn't need to pick a folder.
- **Template path resolution.** Dev: `app.getAppPath()/resources/templates/default`. Production: `process.resourcesPath/templates/default`.

## What was built

### 1. `projects.createFromTemplate` endpoint (`src/main/lib/trpc/routers/projects.ts`)

New tRPC mutation that takes `{ name }` and:

1. Sanitizes the name for filesystem use (lowercase, hyphens, strip special chars)
2. Resolves template source path (dev vs production)
3. Creates target directory at `~/.21st/projects/{sanitized-name}`
4. Copies all template files using `fs.cp()` with a filter that skips `node_modules/`, `package-lock.json`, `.git/`
5. Inserts a project record in the DB with the display name and filesystem path
6. Returns the project record
7. Errors if a project with the same sanitized name already exists

### 2. `chats.createForNewProject` endpoint (`src/main/lib/trpc/routers/chats.ts`)

New tRPC mutation that takes `{ projectId }` and creates a minimal chat:

- Local mode (no git worktree) — `worktreePath` set to `project.path` directly
- No initial message — empty `messages: "[]"`
- Agent mode by default
- Creates the chat + sub-chat records
- Tracks workspace creation

### 3. Template bundled in electron-builder (`package.json`)

Added to `extraResources`:
```json
{
  "from": "resources/templates/default",
  "to": "templates/default",
  "filter": ["!node_modules", "!node_modules/**", "!package-lock.json", "!.git", "!.git/**"]
}
```

### 4. "Create new project" UI (`src/renderer/features/onboarding/select-repo-page.tsx`)

Redesigned SelectRepoPage with three options (previously two):

1. **"Create new project"** (primary button, top position) — new
2. **"Open folder"** (secondary) — existing
3. **"Clone from GitHub"** (secondary) — existing

The create flow shows a name input page (matching the existing Clone page style). On submit:

1. Calls `projects.createFromTemplate` with the name
2. Calls `chats.createForNewProject` with the new project ID
3. Updates the projects list cache
4. Sets `lastSelectedWorkModeAtom` to `"local"` (no git in template projects)
5. Sets `selectedProjectAtom` and `selectedAgentChatIdAtom` to navigate directly to the chat view

Error handling: displays inline error for duplicate names or template-not-found.

Header copy changed from "Select a repository" to "Get started" with updated subtitle.

## End-to-end flow

```
SelectRepoPage
  └─ "Create new project" button
       └─ Show name input page
            └─ Enter name, click "Create"
                 ├─ projects.createFromTemplate({ name })
                 │    └─ Copy template → ~/.21st/projects/{name}/
                 │    └─ Insert project in DB
                 │    └─ Return project
                 ├─ chats.createForNewProject({ projectId })
                 │    └─ Insert chat (local mode, no worktree)
                 │    └─ worktreePath = project.path
                 │    └─ Return chat + subChat
                 └─ Navigate to chat view
                      └─ preview.ensureForChat triggers automatically
                           ├─ hasViteConfig() → true
                           ├─ ensureDepsInstalled() → npm install (~30-60s first time)
                           └─ createViteDevServer() → preview iframe shows starter site
```

### 5. "Create new project" in project selector dropdown (`src/renderer/features/agents/components/project-selector.tsx`)

The SelectRepoPage is only visible on first launch (no project selected). Returning users access projects via the project selector dropdown in the bottom bar. Added:

- "Create new project" button as the **first** action in the dropdown's action section (above "Add repository" and "Add from GitHub")
- A dialog (matching the existing GitHub clone dialog pattern) with name input, error display, and cancel/create buttons
- Handler wires `createFromTemplate` → `createForNewProject` → sets work mode to local → navigates to chat view

## Files modified

| File | Action |
|------|--------|
| `src/main/lib/trpc/routers/projects.ts` | **Modified** — added `createFromTemplate` mutation |
| `src/main/lib/trpc/routers/chats.ts` | **Modified** — added `createForNewProject` mutation |
| `package.json` | **Modified** — added template to `extraResources` |
| `src/renderer/features/onboarding/select-repo-page.tsx` | **Modified** — added create project UI, redesigned landing |
| `src/renderer/features/agents/components/project-selector.tsx` | **Modified** — added "Create new project" button + dialog to dropdown |

## Out of scope (later phases)

- UI polish: loading states during npm install, progress indication (Phase 6)
- Simplified onboarding for non-technical users (Phase 7)
- Publishing to live URL (Phase 8)
- Smarter prompt-aware templates (Phase 9)

## Verification

1. `cd app && bun run dev` — start the Electron app
2. On SelectRepoPage, click "Create new project"
3. Enter a name (e.g., "my-yoga-site"), click Create
4. Verify: directory created at `~/.21st/projects/my-yoga-site/` with template files (no `node_modules` initially)
5. Verify: app navigates to chat view with preview pane
6. Verify: preview starts — `npm install` runs, then Vite dev server starts, starter site appears
7. Verify: user can type a message and Claude starts editing the project
8. Verify: creating a project with a duplicate name shows an error
9. Verify: HMR works when Claude edits files
