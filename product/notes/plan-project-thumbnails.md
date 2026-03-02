# Plan: Project Thumbnail Screenshots

## Overview
Auto-generate thumbnail screenshots of project websites for display in the Projects grid cards.

## Approach: Lazy capture via Electron offscreen BrowserWindow
Generate thumbnails when the preview is already running (user opens a project). The main process creates a hidden BrowserWindow, navigates to the preview URL, captures the page, saves as PNG.

## Steps

### 1. Add `thumbnailPath` to DB schema
**File:** `app/src/main/lib/db/schema/index.ts`
- Add `thumbnailPath: text("thumbnail_path")` to projects table (same pattern as `iconPath`)
- Run `bun run db:push` to apply

### 2. Add `captureThumbnail` tRPC mutation
**File:** `app/src/main/lib/trpc/routers/projects.ts`
- New mutation: `captureThumbnail({ projectId, previewUrl })`
- Creates offscreen `BrowserWindow({ show: false, width: 1280, height: 800 })`
- Navigates to `previewUrl`, waits for `did-finish-load`
- Calls `webContents.capturePage()` → resize to thumbnail size
- Saves PNG to `app.getPath("userData")/project-thumbnails/{projectId}.png`
- Updates `thumbnailPath` in DB
- Destroys the window

### 3. Trigger capture from preview component
**File:** `app/src/renderer/features/agents/ui/agent-preview.tsx`
- After iframe `onLoad` fires, call `captureThumbnail` mutation with the previewBaseUrl and project ID
- Debounce/throttle: only capture once per session or if thumbnail doesn't exist yet

### 4. Display thumbnails in ProjectsScreen
**File:** `app/src/renderer/features/agents/ui/projects-screen.tsx`
- Pass full project objects to card items (currently only passes projectId/projectName)
- Load thumbnail via `file://{thumbnailPath}?t={updatedAt}` (same pattern as project icons)
- Fallback to current gray placeholder when no thumbnail exists
- Show `<img>` with `object-cover` in the aspect-[3/2] container
