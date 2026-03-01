# How 1Code calls Claude — and what we should do instead

## What the Claude Agent SDK actually is

`@anthropic-ai/claude-agent-sdk` (v0.2.45) is a minified JS bundle (~376KB) that **spawns the Claude CLI binary as a child process**. It's not an API client — it's a wrapper around the same `claude` binary the user installs on their machine.

The SDK's `query()` function:
1. Finds or receives a `claude` binary path via `pathToClaudeCodeExecutable`
2. Spawns it as a child process with `child_process`
3. Passes env vars for auth (`CLAUDE_CODE_OAUTH_TOKEN`, `ANTHROPIC_API_KEY`, etc.)
4. Streams messages back as an async generator

**The SDK docs say auth is just `ANTHROPIC_API_KEY` env var.** That's the intended/supported method.

## How 1Code does auth (the complicated way)

1Code routes auth through their cloud (`21st.dev`) to broker Anthropic OAuth:

1. User clicks "Connect" → `POST 21st.dev/api/auth/claude-code/start` → creates a CodeSandbox
2. Sandbox generates Anthropic OAuth URL → user authenticates in browser → pastes code back
3. Sandbox exchanges auth code for OAuth token → polls → stores token encrypted in local SQLite
4. Token is decrypted at runtime and passed as `CLAUDE_CODE_OAUTH_TOKEN` env var to the SDK

**Why the cloud?** Because Anthropic OAuth requires a server-side callback. The CodeSandbox acts as a temporary OAuth server. This lets 1Code/21st.dev users authenticate with their claude.ai subscription instead of needing an API key.

**Cloud dependencies:**
- `21st.dev/api/auth/claude-code/start` — create sandbox
- `21st.dev/api/auth/desktop/exchange` — desktop app auth
- `21st.dev/api/auth/desktop/refresh` — token refresh

## What our ProductVibe feature flag does

We bypassed all of the above by reading the token from the Claude CLI's macOS Keychain entry. This worked because:
- User already has `claude` installed and authenticated
- The CLI stores its OAuth token in the system keychain
- We just read it and pass it as `CLAUDE_CODE_OAUTH_TOKEN`

**Why it broke:** Claude CLI v2.x changed its keychain storage format. The `claudeAiOauth` key no longer exists — only `mcpOAuth` is stored there now. The access token is stored elsewhere (or differently).

## The simpler approach we should use

The SDK already supports the user's **locally installed Claude CLI with its existing auth**. The resolution order in 1Code is:

```
1. Bundled binary in app/resources/bin/{platform}-{arch}/claude
2. System-installed binary via `which claude`
```

1Code doesn't ship a bundled binary in dev mode (the `resources/bin/` dir doesn't exist). So it already falls back to the system `claude`.

**The key insight:** when the SDK spawns the system `claude` binary, that binary already has its own auth. It reads its own keychain/credentials. We don't need to extract the token and pass it as an env var at all.

What we actually need:
- User has `claude` CLI installed and authenticated (they already do — that's our target user)
- SDK spawns the system `claude` binary (already works — no bundled binary exists)
- Don't pass `CLAUDE_CODE_OAUTH_TOKEN` — let the binary use its own auth
- Remove the entire 1Code cloud auth flow

## What about `ANTHROPIC_API_KEY`?

The SDK docs say auth is `ANTHROPIC_API_KEY`. This is for API-key-based auth (pay-per-token via console.anthropic.com). This is separate from the OAuth flow (claude.ai subscription).

Both work. The SDK/binary accepts either:
- `ANTHROPIC_API_KEY` — direct API key
- `CLAUDE_CODE_OAUTH_TOKEN` — OAuth token (what 1Code passes)
- Nothing — binary uses its own stored credentials

For ProductVibe, "nothing" is the right answer. Let the binary handle its own auth.

## Recommendation

1. **Remove the keychain-reading hack** (`claude-token.ts` ProductVibe path)
2. **Remove the 1Code cloud auth UI** (connect to Claude, sandbox OAuth, etc.) — hide behind feature flag or delete
3. **Don't pass any auth token** to the SDK — let the system `claude` binary use its own credentials
4. **Require `claude` CLI to be installed and authenticated** as a prerequisite (Phase 7 onboarding can guide this)
5. **Keep `ANTHROPIC_API_KEY` support** as an optional override for power users

This eliminates:
- Cloud dependency on 21st.dev
- Keychain format brittleness
- Token refresh logic
- The entire OAuth brokering flow

## The CLAUDE_CONFIG_DIR trap (Phase 4a finding)

### Problem

"Let the binary use its own auth" sounds simple but doesn't work out of the box. The SDK's `query()` accepts an `env:` option that **replaces** the child process environment entirely (it does not merge). 1Code constructs a full env via `buildClaudeEnv()` (in `src/main/lib/claude/env.ts`) and passes it to the SDK:

```
queryOptions.options.env = finalEnv   // replaces child's entire env
```

Additionally, 1Code sets `CLAUDE_CONFIG_DIR` to an isolated per-session directory. Each chat gets its own config dir at:

```
{userData}/claude-sessions/{subChatId}/
```

The binary reads all its config — including auth credentials — from `CLAUDE_CONFIG_DIR` instead of the default `~/.claude/`. The isolated dir has symlinks for operational config (skills, commands, agents, plugins, settings.json) but was **missing the auth credentials file**.

### Why CLAUDE_CONFIG_DIR isolation exists

The Claude binary stores **session state** (conversation history, tool approvals, resume data) inside its config directory, keyed by the working directory (`cwd`). Without isolation, all chats pointing at the same project folder would read and write the same session files. This causes cross-chat contamination: Chat B picks up Chat A's conversation context, tool results bleed across, and resume breaks.

1Code solves this by giving each subChat its own `CLAUDE_CONFIG_DIR`. The binary thinks it has a fresh config directory and creates independent session state. The tradeoff: anything the binary normally finds in `~/.claude/` must be explicitly symlinked in — skills, commands, agents, plugins, settings, and (the one that was missed) credentials.

### Where the binary stores auth

The binary stores OAuth credentials in `~/.claude/.credentials.json` (hidden file, dot prefix):

```json
{
  "claudeAiOauth": {
    "accessToken": "sk-ant-oat01-...",
    "refreshToken": "sk-ant-ort01-...",
    "expiresAt": 1772336236846,
    "scopes": ["user:inference", "user:mcp_servers", ...],
    "subscriptionType": "max"
  },
  "mcpOAuth": { ... }
}
```

This is NOT in the macOS Keychain (contrary to earlier assumptions). It's a plain JSON file in the config directory. When `CLAUDE_CONFIG_DIR` points to the isolated dir, the binary looks there for `.credentials.json`, finds nothing, and fails with `authentication_failed`.

### The stale env var red herring

A second issue masked the real cause: the user's shell had `CLAUDE_CODE_OAUTH_TOKEN` set to a stale/expired token. `buildClaudeEnv()` copies all of `process.env` (line 265-268 in env.ts), so this stale token leaked into the child env. The binary tried to use it (env var takes precedence over credentials file) and failed. Fix: explicitly `delete claudeEnv.CLAUDE_CODE_OAUTH_TOKEN` when no token is being passed.

### The fix

Symlink `.credentials.json` from `~/.claude/` into the isolated config dir, alongside the existing symlinks:

```
~/.claude/.credentials.json  →  {isolated-dir}/.credentials.json  (NEW)
~/.claude/settings.json      →  {isolated-dir}/settings.json      (existing)
~/.claude/skills/             →  {isolated-dir}/skills/            (existing)
~/.claude/commands/           →  {isolated-dir}/commands/          (existing)
~/.claude/agents/             →  {isolated-dir}/agents/            (existing)
~/.claude/plugins/            →  {isolated-dir}/plugins/           (existing)
```

This lets the binary find its own credentials while maintaining session isolation. The binary handles its own token refresh using the `refreshToken` in the credentials file.

### Result

**Confirmed working.** After symlinking `.credentials.json`, the binary authenticates using its own credentials and API calls succeed. No token extraction, no keychain reading, no cloud auth needed.

### Summary of all auth changes (ProductVibe mode)

1. `getClaudeCodeToken()` returns `null` — skip 1Code DB token lookup
2. `delete claudeEnv.CLAUDE_CODE_OAUTH_TOKEN` — strip stale token from shell env
3. Symlink `.credentials.json` into isolated config dir — binary finds its own auth
4. Auth errors emit `AUTH_FAILURE` not `AUTH_FAILED_SDK` — prevents modal loop
5. `claude-code.ts` gates (`getIntegration`, `getToken`, `authenticateLocalCli`) — short-circuit in ProductVibe mode
