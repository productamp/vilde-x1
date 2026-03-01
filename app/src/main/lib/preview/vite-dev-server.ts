import { spawn, execFile, type ChildProcess } from "node:child_process"
import { access } from "fs/promises"
import path from "path"
import type { PreviewServerResult } from "./preview-server"

interface ViteServerInfo {
  process: ChildProcess
  baseUrl: string
  port: number
  rootPath: string
}

const servers = new Map<string, ViteServerInfo>()
const pendingServers = new Map<string, Promise<PreviewServerResult>>()
const intentionalKills = new Set<string>()
const restartCounts = new Map<string, number>()

const VITE_STARTUP_TIMEOUT_MS = 30_000
const MAX_AUTO_RESTARTS = 5
const AUTO_RESTART_DELAY_MS = 1_000
const VITE_URL_REGEX = /Local:\s+http:\/\/(?:localhost|127\.0\.0\.1):(\d+)/

/**
 * Check whether a project directory contains a Vite config file.
 */
export async function hasViteConfig(rootPath: string): Promise<boolean> {
  const candidates = ["vite.config.ts", "vite.config.js", "vite.config.mjs"]
  for (const name of candidates) {
    try {
      await access(path.join(rootPath, name))
      return true
    } catch {
      // Continue checking
    }
  }
  return false
}

function killProcessTree(child: ChildProcess): void {
  if (!child.pid) return
  try {
    // Negative PID kills the entire process group (npm -> sh -> vite)
    process.kill(-child.pid, "SIGTERM")
  } catch {
    // Process may have already exited
    try {
      child.kill("SIGTERM")
    } catch {
      // Already dead
    }
  }
}

async function ensureDepsInstalled(rootPath: string): Promise<void> {
  try {
    await access(path.join(rootPath, "node_modules"))
    return
  } catch {
    // node_modules missing — need to install
  }

  // Check that package.json exists before attempting install
  try {
    await access(path.join(rootPath, "package.json"))
  } catch {
    throw new Error(
      `[ViteDevServer] No package.json found in ${rootPath}`,
    )
  }

  console.log(`[ViteDevServer] Installing dependencies in ${rootPath}...`)

  await new Promise<void>((resolve, reject) => {
    execFile("npm", ["install"], { cwd: rootPath, timeout: 120_000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`[ViteDevServer] npm install stderr: ${stderr}`)
        reject(new Error(`[ViteDevServer] npm install failed: ${error.message}`))
      } else {
        console.log(`[ViteDevServer] Dependencies installed in ${rootPath}`)
        resolve()
      }
    })
  })
}

async function createViteDevServer(rootPath: string): Promise<PreviewServerResult> {
  const resolvedRoot = path.resolve(rootPath)

  await ensureDepsInstalled(resolvedRoot)

  return new Promise<PreviewServerResult>((resolve, reject) => {
    const child = spawn("npx", ["vite"], {
      cwd: resolvedRoot,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
    })

    // Detach from parent's reference count so the child doesn't prevent
    // the parent from exiting, but we still track it for cleanup.
    child.unref()

    let settled = false
    let stdoutBuffer = ""

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true
        killProcessTree(child)
        reject(
          new Error(
            `[ViteDevServer] Timed out waiting for Vite to start in ${resolvedRoot}`,
          ),
        )
      }
    }, VITE_STARTUP_TIMEOUT_MS)

    child.stdout?.on("data", (data: Buffer) => {
      const chunk = data.toString()
      stdoutBuffer += chunk

      if (!settled) {
        const match = VITE_URL_REGEX.exec(stdoutBuffer)
        if (match) {
          settled = true
          clearTimeout(timeout)

          const port = parseInt(match[1], 10)
          const baseUrl = `http://localhost:${port}`

          const info: ViteServerInfo = {
            process: child,
            baseUrl,
            port,
            rootPath: resolvedRoot,
          }
          servers.set(resolvedRoot, info)
          restartCounts.delete(resolvedRoot)

          console.log(`[ViteDevServer] Serving ${resolvedRoot} at ${baseUrl}`)
          resolve({ baseUrl, port, rootPath: resolvedRoot })
        }
      }
    })

    child.stderr?.on("data", (data: Buffer) => {
      const text = data.toString().trim()
      if (text) {
        console.error(`[ViteDevServer] stderr: ${text}`)
      }
    })

    child.on("error", (error) => {
      if (!settled) {
        settled = true
        clearTimeout(timeout)
        reject(new Error(`[ViteDevServer] Failed to spawn: ${error.message}`))
      }
    })

    child.on("exit", (code, signal) => {
      servers.delete(resolvedRoot)
      if (!settled) {
        settled = true
        clearTimeout(timeout)
        reject(
          new Error(
            `[ViteDevServer] Process exited unexpectedly (code=${code}, signal=${signal})`,
          ),
        )
      } else if (intentionalKills.has(resolvedRoot)) {
        intentionalKills.delete(resolvedRoot)
        console.log(
          `[ViteDevServer] Process killed intentionally for ${resolvedRoot}`,
        )
      } else {
        // Unexpected crash — auto-restart
        const count = (restartCounts.get(resolvedRoot) ?? 0) + 1
        restartCounts.set(resolvedRoot, count)
        if (count <= MAX_AUTO_RESTARTS) {
          console.warn(
            `[ViteDevServer] Process crashed for ${resolvedRoot} (code=${code}, signal=${signal}). Auto-restarting (${count}/${MAX_AUTO_RESTARTS})...`,
          )
          setTimeout(() => {
            ensureViteDevServer(resolvedRoot).catch((err) => {
              console.error(`[ViteDevServer] Auto-restart failed:`, err)
            })
          }, AUTO_RESTART_DELAY_MS)
        } else {
          console.error(
            `[ViteDevServer] Process crashed for ${resolvedRoot} — max restarts (${MAX_AUTO_RESTARTS}) reached. Use refresh to restart manually.`,
          )
        }
      }
    })
  })
}

export async function ensureViteDevServer(
  rootPath: string,
): Promise<PreviewServerResult> {
  const resolvedRoot = path.resolve(rootPath)

  const existing = servers.get(resolvedRoot)
  if (existing) {
    return {
      baseUrl: existing.baseUrl,
      port: existing.port,
      rootPath: existing.rootPath,
    }
  }

  const pending = pendingServers.get(resolvedRoot)
  if (pending) {
    return pending
  }

  const creation = createViteDevServer(resolvedRoot)
    .then((result) => ({
      baseUrl: result.baseUrl,
      port: result.port,
      rootPath: result.rootPath,
    }))
    .finally(() => {
      pendingServers.delete(resolvedRoot)
    })

  pendingServers.set(resolvedRoot, creation)
  return creation
}

/**
 * Check if a Vite dev server is tracked and its process is still alive.
 */
export function isViteServerAlive(rootPath: string): boolean {
  const resolvedRoot = path.resolve(rootPath)
  const info = servers.get(resolvedRoot)
  if (!info) return false
  // Check if process is still alive by sending signal 0
  try {
    if (info.process.pid) {
      process.kill(info.process.pid, 0)
      return true
    }
  } catch {
    // Process is dead but still in our map — clean up
    servers.delete(resolvedRoot)
  }
  return false
}

export async function killViteDevServer(rootPath: string): Promise<void> {
  const resolvedRoot = path.resolve(rootPath)
  const info = servers.get(resolvedRoot)
  if (!info) return

  intentionalKills.add(resolvedRoot)
  killProcessTree(info.process)
  servers.delete(resolvedRoot)
  console.log(`[ViteDevServer] Killed server for ${resolvedRoot}`)
}

export async function cleanupViteDevServers(): Promise<void> {
  for (const info of servers.values()) {
    killProcessTree(info.process)
  }
  servers.clear()
  pendingServers.clear()
}
