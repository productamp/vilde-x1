# Codex Integration Research

## Architecture: Two Separate Binaries

Codex uses **two completely different binaries** for different purposes:

### 1. `codex-acp` — Chat engine (npm package)
- **Package:** `@zed-industries/codex-acp` (platform-specific, e.g. `@zed-industries/codex-acp-darwin-arm64`)
- **Resolved via:** `require.resolve()` from node_modules — always available as npm dep
- **Used for:** Actual chat streaming via ACP (Agent Communication Protocol) over stdio
- **SDK:** `@mcpc-tech/acp-ai-provider` wraps it as a Vercel AI SDK provider, then `streamText()` from `ai` package streams the chat
- **This always works** because it's an npm dependency installed with `bun install`

### 2. `codex` CLI — Management tool (standalone binary)
- **Resolved via:** `resolveBundledCodexCliPath()` in `codex.ts`
- **Download:** `bun run codex:download` fetches it to `app/resources/bin/{platform}-{arch}/codex`
- **Used for:** MCP server management (`codex mcp list --json`, `codex mcp add/remove`), login (`codex login`), auth status (`codex login status`), logout
- **NOT used for chat** — only management/tooling operations
- **Can fail** if binary not downloaded and not installed on system

## CLI Resolution Order

**Rule: system-installed first, bundled second.**

Both Claude and Codex follow the same pattern:

```
1. Check system PATH (which claude / which codex)
   → Use if found (user's own install, likely up-to-date)
2. Check bundled binary (resources/bin/{platform}-{arch}/)
   → Use if found (shipped with packaged app)
3. Throw error if neither found
```

Rationale: If the user already has the CLI installed and working, don't add complexity by forcing a bundled version. The bundled binary is a fallback for users who don't have it installed system-wide (typical for the packaged app distribution).

**Files:**
- Claude: `app/src/main/lib/claude/env.ts` → `resolveClaudeCodeExecutablePath()`
- Codex: `app/src/main/lib/trpc/routers/codex.ts` → `resolveBundledCodexCliPath()`

## Codex Chat Flow

```
User sends message
  → codex.ts chat subscription
    → resolveCodexMcpSnapshot() — uses codex CLI for `codex mcp list --json`
      (non-fatal if fails — chat works without MCP)
    → getOrCreateProvider() — creates/reuses ACPProvider
      → resolveCodexAcpBinaryPath() — resolves codex-acp from node_modules
      → createACPProvider({ command: codex-acp, session: { cwd, mcpServers } })
    → streamText({ model: provider.languageModel(modelId), ... })
    → Stream chunks back via tRPC subscription
```

## Codex vs Claude Comparison

| Aspect | Claude | Codex |
|--------|--------|-------|
| Chat SDK | `@anthropic-ai/claude-agent-sdk` | Vercel AI SDK (`ai`) + `@mcpc-tech/acp-ai-provider` |
| Chat binary | Claude Code CLI (same as management) | `codex-acp` (separate from management CLI) |
| Management CLI | `claude` binary | `codex` binary |
| Streaming | `for await (const msg of stream)` iterator | `reader.read()` loop on ReadableStream |
| MCP | Passed to SDK `queryOptions.mcpServers` | Passed to `createACPProvider` session config |
| Provider caching | No caching — fresh SDK call each time | `providerSessions` Map caches by subChatId |
| Session resume | `resumeSessionId` in SDK options | `existingSessionId` in ACPProvider |
| Auth | Claude OAuth or API key | ChatGPT login, CODEX_API_KEY, or OPENAI_API_KEY |

## Known Non-Fatal Errors (Pre-existing)

These appear in Codex chat logs and are not caused by our changes:

1. **`[acp-ai-provider] Warning: No authMethodId specified`** — Auth method not configured in ACPProvider settings. Non-fatal warning.
2. **`ERROR rmcp::transport::worker: Connection refused`** — MCP transport can't connect. Happens when MCP server setup fails.
3. **`Error handling notification session/update Invalid params`** — Protocol mismatch in session update notifications.
4. **`codex_core::rollout::list: state db missing rollout path`** — Codex internal state DB issue for old threads.

These don't prevent chat from working — they affect MCP tooling and session management only.
