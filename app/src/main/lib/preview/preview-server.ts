import { createServer, type IncomingMessage, type Server, type ServerResponse } from "http"
import { stat, readFile } from "fs/promises"
import path from "path"

export interface PreviewServerResult {
  baseUrl: string
  port: number
  rootPath: string
}

type PreviewServerInfo = PreviewServerResult & {
  server: Server
}

const MIME_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".htm": "text/html; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
}

const servers = new Map<string, PreviewServerInfo>()
const pendingServers = new Map<string, Promise<PreviewServerResult>>()

function sendError(res: ServerResponse, status: number, message: string): void {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  })
  res.end(message)
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const fileStat = await stat(filePath)
    return fileStat.isFile()
  } catch {
    return false
  }
}

async function resolveRequestPath(rootPath: string, pathname: string): Promise<string | null> {
  const root = path.resolve(rootPath)
  const normalizedPath = pathname === "/" ? "/index.html" : pathname
  const candidatePath = path.resolve(root, `.${normalizedPath}`)

  if (candidatePath !== root && !candidatePath.startsWith(`${root}${path.sep}`)) {
    return null
  }

  try {
    const stats = await stat(candidatePath)
    if (stats.isDirectory()) {
      const indexPath = path.join(candidatePath, "index.html")
      return (await fileExists(indexPath)) ? indexPath : null
    }
    if (stats.isFile()) {
      return candidatePath
    }
  } catch {
    // Fall through to clean URL fallback.
  }

  if (!path.extname(candidatePath)) {
    const htmlFallback = `${candidatePath}.html`
    if (await fileExists(htmlFallback)) {
      return htmlFallback
    }
  }

  return null
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  rootPath: string,
): Promise<void> {
  try {
    const requestUrl = new URL(req.url || "/", "http://127.0.0.1")
    const resolvedPath = await resolveRequestPath(rootPath, decodeURIComponent(requestUrl.pathname))

    if (!resolvedPath) {
      sendError(res, 404, "Not found")
      return
    }

    const body = await readFile(resolvedPath)
    const ext = path.extname(resolvedPath).toLowerCase()

    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    })
    res.end(body)
  } catch (error) {
    console.error("[PreviewServer] Request failed:", error)
    sendError(res, 500, "Preview server error")
  }
}

async function createPreviewServer(rootPath: string): Promise<PreviewServerResult> {
  const resolvedRoot = path.resolve(rootPath)
  const rootStat = await stat(resolvedRoot)

  if (!rootStat.isDirectory()) {
    throw new Error(`Preview root is not a directory: ${resolvedRoot}`)
  }

  return await new Promise<PreviewServerResult>((resolve, reject) => {
    const server = createServer((req, res) => {
      void handleRequest(req, res, resolvedRoot)
    })

    server.once("error", reject)
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject)
      const address = server.address()
      if (!address || typeof address === "string") {
        reject(new Error("Preview server failed to bind to a TCP port"))
        return
      }

      const result: PreviewServerInfo = {
        baseUrl: `http://127.0.0.1:${address.port}`,
        port: address.port,
        rootPath: resolvedRoot,
        server,
      }
      servers.set(resolvedRoot, result)
      console.log(`[PreviewServer] Serving ${resolvedRoot} at ${result.baseUrl}`)
      resolve(result)
    })
  })
}

export async function ensurePreviewServer(rootPath: string): Promise<PreviewServerResult> {
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

  const creation = createPreviewServer(resolvedRoot)
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

export async function cleanupPreviewServers(): Promise<void> {
  await Promise.all(
    Array.from(servers.values()).map(
      (info) =>
        new Promise<void>((resolve) => {
          info.server.close(() => resolve())
        }),
    ),
  )
  servers.clear()
  pendingServers.clear()
}
