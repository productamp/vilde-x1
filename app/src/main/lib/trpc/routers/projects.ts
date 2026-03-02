import { z } from "zod"
import { router, publicProcedure } from "../index"
import { getDatabase, projects } from "../../db"
import { eq, desc } from "drizzle-orm"
import { dialog, BrowserWindow, app } from "electron"
import { basename, join } from "path"
import { exec } from "node:child_process"
import { promisify } from "node:util"
import { existsSync } from "node:fs"
import { mkdir, copyFile, unlink, cp, writeFile, readFile } from "node:fs/promises"
import { extname } from "node:path"
import { getGitRemoteInfo } from "../../git"
import { trackProjectOpened } from "../../analytics"
import { getLaunchDirectory } from "../../cli"

const execAsync = promisify(exec)

/**
 * Sanitize a project name for filesystem use.
 * Lowercase, hyphens for spaces, strip special chars, max 50 chars.
 */
function sanitizeName(name: string): string {
  const sanitized = name
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\-.]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
  return sanitized || "project"
}

/**
 * Resolve the path to the bundled default template.
 * Dev: {appPath}/resources/templates/default
 * Production: {resourcesPath}/templates/default
 */
function getTemplatePath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, "templates", "default")
  }
  return join(app.getAppPath(), "resources", "templates", "default")
}

/** Filter for fs.cp: skip node_modules, lockfiles, .git */
function templateCopyFilter(source: string): boolean {
  const name = basename(source)
  if (name === "node_modules" || name === "package-lock.json" || name === "bun.lock" || name === "bun.lockb" || name === ".git") {
    return false
  }
  return true
}

export const projectsRouter = router({
  /**
   * Get launch directory from CLI args (consumed once)
   * Based on PR #16 by @caffeinum
   */
  getLaunchDirectory: publicProcedure.query(() => {
    return getLaunchDirectory()
  }),

  /**
   * List all projects
   */
  list: publicProcedure.query(() => {
    const db = getDatabase()
    return db.select().from(projects).orderBy(desc(projects.updatedAt)).all()
  }),

  /**
   * Get a single project by ID
   */
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const db = getDatabase()
      return db.select().from(projects).where(eq(projects.id, input.id)).get()
    }),

  /**
   * Create a new project from the bundled template.
   * Copies source files (no node_modules) to ~/.21st/projects/{sanitized-name}.
   */
  createFromTemplate: publicProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ input }) => {
      const sanitized = sanitizeName(input.name)
      const homePath = app.getPath("home")
      const projectsDir = join(homePath, ".21st", "projects")
      const targetPath = join(projectsDir, sanitized)

      // Check for duplicate
      if (existsSync(targetPath)) {
        throw new Error(`A project named "${sanitized}" already exists`)
      }

      // Resolve template
      const templatePath = getTemplatePath()
      if (!existsSync(templatePath)) {
        throw new Error("Template not found. The app may need to be reinstalled.")
      }

      // Create projects directory and copy template
      await mkdir(projectsDir, { recursive: true })
      await cp(templatePath, targetPath, { recursive: true, filter: templateCopyFilter })

      // Insert DB record
      const db = getDatabase()
      const project = db
        .insert(projects)
        .values({
          name: input.name,
          path: targetPath,
        })
        .returning()
        .get()

      return project
    }),

  /**
   * Open folder picker and create project
   */
  openFolder: publicProcedure.mutation(async ({ ctx }) => {
    const window = ctx.getWindow?.() ?? BrowserWindow.getFocusedWindow()

    if (!window) {
      console.error("[Projects] No window available for folder dialog")
      return null
    }

    // Ensure window is focused before showing dialog (fixes first-launch timing issue on macOS)
    if (!window.isFocused()) {
      console.log("[Projects] Window not focused, focusing before dialog...")
      window.focus()
      // Small delay to ensure focus is applied by the OS
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    const result = await dialog.showOpenDialog(window, {
      properties: ["openDirectory", "createDirectory"],
      title: "Select Project Folder",
      buttonLabel: "Open Project",
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const folderPath = result.filePaths[0]!
    const folderName = basename(folderPath)

    // Get git remote info
    const gitInfo = await getGitRemoteInfo(folderPath)

    const db = getDatabase()

    // Check if project already exists
    const existing = db
      .select()
      .from(projects)
      .where(eq(projects.path, folderPath))
      .get()

    if (existing) {
      // Update the updatedAt timestamp and git info (in case remote changed)
      const updatedProject = db
        .update(projects)
        .set({
          updatedAt: new Date(),
          gitRemoteUrl: gitInfo.remoteUrl,
          gitProvider: gitInfo.provider,
          gitOwner: gitInfo.owner,
          gitRepo: gitInfo.repo,
        })
        .where(eq(projects.id, existing.id))
        .returning()
        .get()

      // Track project opened
      trackProjectOpened({
        id: updatedProject!.id,
        hasGitRemote: !!gitInfo.remoteUrl,
      })

      return updatedProject
    }

    // Create new project with git info
    const newProject = db
      .insert(projects)
      .values({
        name: folderName,
        path: folderPath,
        gitRemoteUrl: gitInfo.remoteUrl,
        gitProvider: gitInfo.provider,
        gitOwner: gitInfo.owner,
        gitRepo: gitInfo.repo,
      })
      .returning()
      .get()

    // Track project opened
    trackProjectOpened({
      id: newProject!.id,
      hasGitRemote: !!gitInfo.remoteUrl,
    })

    return newProject
  }),

  /**
   * Create a project from a known path
   */
  create: publicProcedure
    .input(z.object({ path: z.string(), name: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDatabase()
      const name = input.name || basename(input.path)

      // Check if project already exists
      const existing = db
        .select()
        .from(projects)
        .where(eq(projects.path, input.path))
        .get()

      if (existing) {
        return existing
      }

      // Get git remote info
      const gitInfo = await getGitRemoteInfo(input.path)

      return db
        .insert(projects)
        .values({
          name,
          path: input.path,
          gitRemoteUrl: gitInfo.remoteUrl,
          gitProvider: gitInfo.provider,
          gitOwner: gitInfo.owner,
          gitRepo: gitInfo.repo,
        })
        .returning()
        .get()
    }),

  /**
   * Rename a project
   */
  rename: publicProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(({ input }) => {
      const db = getDatabase()
      return db
        .update(projects)
        .set({ name: input.name, updatedAt: new Date() })
        .where(eq(projects.id, input.id))
        .returning()
        .get()
    }),

  /**
   * Delete a project and all its chats
   */
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const db = getDatabase()
      return db
        .delete(projects)
        .where(eq(projects.id, input.id))
        .returning()
        .get()
    }),

  /**
   * Refresh git info for a project (in case remote changed)
   */
  refreshGitInfo: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDatabase()

      // Get project
      const project = db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id))
        .get()

      if (!project) {
        return null
      }

      // Get fresh git info
      const gitInfo = await getGitRemoteInfo(project.path)

      // Update project
      return db
        .update(projects)
        .set({
          updatedAt: new Date(),
          gitRemoteUrl: gitInfo.remoteUrl,
          gitProvider: gitInfo.provider,
          gitOwner: gitInfo.owner,
          gitRepo: gitInfo.repo,
        })
        .where(eq(projects.id, input.id))
        .returning()
        .get()
    }),

  /**
   * Clone a GitHub repo and create a project
   */
  cloneFromGitHub: publicProcedure
    .input(z.object({ repoUrl: z.string() }))
    .mutation(async ({ input }) => {
      const { repoUrl } = input

      // Parse the URL to extract owner/repo
      let owner: string | null = null
      let repo: string | null = null

      // Match HTTPS format: https://github.com/owner/repo
      const httpsMatch = repoUrl.match(
        /https?:\/\/github\.com\/([^/]+)\/([^/]+)/,
      )
      if (httpsMatch) {
        owner = httpsMatch[1] || null
        repo = httpsMatch[2]?.replace(/\.git$/, "") || null
      }

      // Match SSH format: git@github.com:owner/repo
      const sshMatch = repoUrl.match(/git@github\.com:([^/]+)\/(.+)/)
      if (sshMatch) {
        owner = sshMatch[1] || null
        repo = sshMatch[2]?.replace(/\.git$/, "") || null
      }

      // Match short format: owner/repo
      const shortMatch = repoUrl.match(/^([^/]+)\/([^/]+)$/)
      if (shortMatch) {
        owner = shortMatch[1] || null
        repo = shortMatch[2]?.replace(/\.git$/, "") || null
      }

      if (!owner || !repo) {
        throw new Error("Invalid GitHub URL or repo format")
      }

      // Clone to ~/.21st/repos/{owner}/{repo}
      const homePath = app.getPath("home")
      const reposDir = join(homePath, ".21st", "repos", owner)
      const clonePath = join(reposDir, repo)

      // Check if already cloned
      if (existsSync(clonePath)) {
        // Project might already exist in DB
        const db = getDatabase()
        const existing = db
          .select()
          .from(projects)
          .where(eq(projects.path, clonePath))
          .get()

        if (existing) {
          trackProjectOpened({
            id: existing.id,
            hasGitRemote: !!existing.gitRemoteUrl,
          })
          return existing
        }

        // Create project for existing clone
        const gitInfo = await getGitRemoteInfo(clonePath)
        const newProject = db
          .insert(projects)
          .values({
            name: repo,
            path: clonePath,
            gitRemoteUrl: gitInfo.remoteUrl,
            gitProvider: gitInfo.provider,
            gitOwner: gitInfo.owner,
            gitRepo: gitInfo.repo,
          })
          .returning()
          .get()

        trackProjectOpened({
          id: newProject!.id,
          hasGitRemote: !!gitInfo.remoteUrl,
        })
        return newProject
      }

      // Create repos directory
      await mkdir(reposDir, { recursive: true })

      // Clone the repo
      const cloneUrl = `https://github.com/${owner}/${repo}.git`
      await execAsync(`git clone "${cloneUrl}" "${clonePath}"`)

      // Get git info and create project
      const db = getDatabase()
      const gitInfo = await getGitRemoteInfo(clonePath)

      const newProject = db
        .insert(projects)
        .values({
          name: repo,
          path: clonePath,
          gitRemoteUrl: gitInfo.remoteUrl,
          gitProvider: gitInfo.provider,
          gitOwner: gitInfo.owner,
          gitRepo: gitInfo.repo,
        })
        .returning()
        .get()

      trackProjectOpened({
        id: newProject!.id,
        hasGitRemote: !!gitInfo.remoteUrl,
      })

      return newProject
    }),

  /**
   * Open folder picker to locate an existing clone of a specific repo
   * Validates that the selected folder matches the expected owner/repo
   */
  locateAndAddProject: publicProcedure
    .input(
      z.object({
        expectedOwner: z.string(),
        expectedRepo: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const window = ctx.getWindow?.() ?? BrowserWindow.getFocusedWindow()

      if (!window) {
        return { success: false as const, reason: "no-window" as const }
      }

      // Ensure window is focused
      if (!window.isFocused()) {
        window.focus()
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const result = await dialog.showOpenDialog(window, {
        properties: ["openDirectory"],
        title: `Locate ${input.expectedOwner}/${input.expectedRepo}`,
        buttonLabel: "Select",
      })

      if (result.canceled || !result.filePaths[0]) {
        return { success: false as const, reason: "canceled" as const }
      }

      const folderPath = result.filePaths[0]
      const gitInfo = await getGitRemoteInfo(folderPath)

      // Validate it's the correct repo
      if (
        gitInfo.owner !== input.expectedOwner ||
        gitInfo.repo !== input.expectedRepo
      ) {
        return {
          success: false as const,
          reason: "wrong-repo" as const,
          found:
            gitInfo.owner && gitInfo.repo
              ? `${gitInfo.owner}/${gitInfo.repo}`
              : "not a git repository",
        }
      }

      // Create or update project
      const db = getDatabase()
      const existing = db
        .select()
        .from(projects)
        .where(eq(projects.path, folderPath))
        .get()

      if (existing) {
        // Update git info in case it changed
        const updated = db
          .update(projects)
          .set({
            updatedAt: new Date(),
            gitRemoteUrl: gitInfo.remoteUrl,
            gitProvider: gitInfo.provider,
            gitOwner: gitInfo.owner,
            gitRepo: gitInfo.repo,
          })
          .where(eq(projects.id, existing.id))
          .returning()
          .get()

        return { success: true as const, project: updated }
      }

      const project = db
        .insert(projects)
        .values({
          name: basename(folderPath),
          path: folderPath,
          gitRemoteUrl: gitInfo.remoteUrl,
          gitProvider: gitInfo.provider,
          gitOwner: gitInfo.owner,
          gitRepo: gitInfo.repo,
        })
        .returning()
        .get()

      return { success: true as const, project }
    }),

  /**
   * Open folder picker to choose where to clone a repository
   */
  pickCloneDestination: publicProcedure
    .input(z.object({ suggestedName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const window = ctx.getWindow?.() ?? BrowserWindow.getFocusedWindow()

      if (!window) {
        return { success: false as const, reason: "no-window" as const }
      }

      // Ensure window is focused
      if (!window.isFocused()) {
        window.focus()
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Default to ~/.21st/repos/
      const homePath = app.getPath("home")
      const defaultPath = join(homePath, ".21st", "repos")
      await mkdir(defaultPath, { recursive: true })

      const result = await dialog.showOpenDialog(window, {
        properties: ["openDirectory", "createDirectory"],
        title: "Choose where to clone",
        defaultPath,
        buttonLabel: "Clone Here",
      })

      if (result.canceled || !result.filePaths[0]) {
        return { success: false as const, reason: "canceled" as const }
      }

      const targetPath = join(result.filePaths[0], input.suggestedName)
      return { success: true as const, targetPath }
    }),

  /**
   * Upload a custom icon for a project (opens file picker for images)
   */
  uploadIcon: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const window = ctx.getWindow?.() ?? BrowserWindow.getFocusedWindow()
      if (!window) return null

      if (!window.isFocused()) {
        window.focus()
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const result = await dialog.showOpenDialog(window, {
        properties: ["openFile"],
        title: "Select Project Icon",
        buttonLabel: "Set Icon",
        filters: [
          { name: "Images", extensions: ["png", "jpg", "jpeg", "svg", "webp", "ico"] },
        ],
      })

      if (result.canceled || !result.filePaths[0]) return null

      const sourcePath = result.filePaths[0]
      const ext = extname(sourcePath)
      const iconsDir = join(app.getPath("userData"), "project-icons")
      await mkdir(iconsDir, { recursive: true })

      const destPath = join(iconsDir, `${input.id}${ext}`)
      await copyFile(sourcePath, destPath)

      const db = getDatabase()
      return db
        .update(projects)
        .set({ iconPath: destPath, updatedAt: new Date() })
        .where(eq(projects.id, input.id))
        .returning()
        .get()
    }),

  /**
   * Remove custom icon for a project
   */
  removeIcon: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDatabase()
      const project = db.select().from(projects).where(eq(projects.id, input.id)).get()

      if (project?.iconPath && existsSync(project.iconPath)) {
        try { await unlink(project.iconPath) } catch {}
      }

      return db
        .update(projects)
        .set({ iconPath: null, updatedAt: new Date() })
        .where(eq(projects.id, input.id))
        .returning()
        .get()
    }),

  /**
   * Read a project's thumbnail as a base64 data URL.
   * Looks for public/thumbnail.png inside the project folder.
   */
  getThumbnail: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const db = getDatabase()
      const project = db.select().from(projects).where(eq(projects.id, input.projectId)).get()
      if (!project) return null
      const thumbPath = join(project.path, ".productvibe", "thumbnail.png")
      if (!existsSync(thumbPath)) return null
      const buf = await readFile(thumbPath)
      return `data:image/png;base64,${buf.toString("base64")}`
    }),

  /**
   * Capture a thumbnail screenshot of the project's live preview.
   * Saves to public/thumbnail.png inside the project folder.
   */
  captureThumbnail: publicProcedure
    .input(z.object({ projectId: z.string(), previewUrl: z.string().url() }))
    .mutation(async ({ input }) => {
      const db = getDatabase()
      const project = db
        .select()
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .get()
      if (!project) throw new Error("Project not found")

      const metaDir = join(project.path, ".productvibe")
      await mkdir(metaDir, { recursive: true })
      const thumbPath = join(metaDir, "thumbnail.png")

      // Create offscreen window
      const win = new BrowserWindow({
        show: false,
        width: 1280,
        height: 800,
        webPreferences: {
          offscreen: true,
          javascript: true,
        },
      })

      try {
        await win.loadURL(input.previewUrl)
        // Give the page a moment to render (CSS, images, fonts)
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const image = await win.webContents.capturePage()
        const resized = image.resize({ width: 640 })
        await writeFile(thumbPath, resized.toPNG())

        return { thumbPath }
      } finally {
        win.destroy()
      }
    }),
})
