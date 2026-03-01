# Phase 4a — Auth cleanup

**Status: Done**

Stop managing Claude auth ourselves. Let the system `claude` binary handle its own credentials. Remove the 1Code cloud auth dependency and the keychain-reading hack.

See `product/notes/claude-auth-research.md` for full background.

## Why

The Claude Agent SDK spawns the `claude` binary as a child process. That binary already knows how to authenticate — it reads its own credentials from `~/.claude/.credentials.json`. We don't need to extract a token and pass it as an env var.

Our initial approach (read token from keychain, pass as `CLAUDE_CODE_OAUTH_TOKEN`) broke because Claude CLI v2.x changed its keychain storage format. The 1Code cloud OAuth flow (via 21st.dev) is unnecessary for ProductVibe.

## What actually worked

The core problem had two layers:

### Layer 1: Stale `CLAUDE_CODE_OAUTH_TOKEN` in the environment

`buildClaudeEnv()` copies all of `process.env` into the child env. The user's shell had a stale/expired `CLAUDE_CODE_OAUTH_TOKEN` set. The binary uses env var tokens over its own credentials file, so it tried the stale token and failed.

**Fix:** Explicitly `delete claudeEnv.CLAUDE_CODE_OAUTH_TOKEN` when ProductVibe mode returns no token.

### Layer 2: Missing `.credentials.json` in isolated config dir

1Code sets `CLAUDE_CONFIG_DIR` to a per-session isolated directory to prevent cross-chat session contamination. The isolated dir had symlinks for operational config (skills, commands, agents, plugins, settings.json) but was missing `.credentials.json` — the file the binary reads for OAuth credentials.

The binary started fine (session-init doesn't need auth) but failed on the first API call with `authentication_failed` because it couldn't find its credentials in the isolated config dir.

**Fix:** Symlink `~/.claude/.credentials.json` into the isolated config dir, alongside the existing symlinks.

## Changes made

### `src/main/lib/trpc/routers/claude.ts`

1. **`getClaudeCodeToken()` returns `null` in ProductVibe mode** — skip 1Code DB token lookup, don't pass any `CLAUDE_CODE_OAUTH_TOKEN`
2. **Delete stale `CLAUDE_CODE_OAUTH_TOKEN` from env** — `delete claudeEnv.CLAUDE_CODE_OAUTH_TOKEN` when no token is being passed, prevents stale shell env var from leaking through
3. **Symlink `.credentials.json`** into isolated config dir — binary finds its own auth credentials
4. **Auth errors emit `AUTH_FAILURE` not `AUTH_FAILED_SDK`** — prevents the auth modal from opening in a loop (modal opens → authenticateLocalCli succeeds because binary exists → retry → auth fails → modal opens again)
5. **Removed `getExistingClaudeToken` import** — keychain hack no longer used

### `src/main/lib/trpc/routers/claude-code.ts`

1. **`getIntegration`** — checks `isClaudeCliInstalled()` instead of keychain token in ProductVibe mode
2. **`getToken`** — returns `{ token: null, error: null }` in ProductVibe mode
3. **`authenticateLocalCli`** — returns success immediately if binary exists in ProductVibe mode
4. **`importSystemToken`** — short-circuits in ProductVibe mode

## What was NOT changed

- 1Code auth flow stays behind feature flag — vanilla 1Code still works
- `claude-token.ts` not deleted — used by `claude-code.ts` for non-ProductVibe path
- SDK calling pattern unchanged — `query()`, streaming, sessions all the same
- `ANTHROPIC_API_KEY` support preserved — power users can still use env vars
- `buildClaudeEnv()` in `env.ts` not modified — env construction stays the same

## Verification

1. `cd app && bun run dev`
2. Ensure `claude` CLI is installed and authenticated (`claude auth status`)
3. Open a project, start a chat, send a message
4. Claude responds — auth handled by the binary via symlinked `.credentials.json`
5. Logs show: `CLAUDE_CODE_OAUTH_TOKEN` is NOT set in the auth debug block
6. No calls to `21st.dev` in network/logs
