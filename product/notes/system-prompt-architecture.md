# System Prompt Architecture — How Prompts Work in Vilda

## How the AI receives instructions

The Claude SDK is invoked in `app/src/main/lib/trpc/routers/claude.ts` (line ~1759). The system prompt is configured as:

```typescript
const systemPromptConfig = {
  type: "preset",
  preset: "claude_code",        // SDK's built-in system prompt (not editable)
  append: "...",                 // Our custom content appended to it
}
```

### Key behaviour of `systemPrompt.append`

- **Present for every message** — set once when the chat subscription starts, passed to the SDK's `query()` call
- **Survives context compaction** — it's system prompt, not conversation history. Never evicted.
- **Invisible to the user** — not in the project files, not in the chat
- This is how v0, Lovable, and Bolt implement their master prompts

### Current layers

| Layer | File | How it reaches the AI | Editable by user |
|-------|------|-----------------------|------------------|
| SDK preset | Built into `@anthropic-ai/claude-agent-sdk` | `systemPrompt.preset: "claude_code"` | No |
| `systemPrompt.append` | Currently only `AGENTS.md` content | Appended to preset at `claude.ts:1759` | No (runtime inject) |
| `AGENTS.md` | `<project>/AGENTS.md` | Read by our code, passed via `append` | Yes (in project) |
| `CLAUDE.md` | `<project>/CLAUDE.md` | Read natively by the Claude SDK | Yes (in project) |
| Skills | `~/.claude/skills/<name>/SKILL.md` | SDK loads via `settingSources` | Yes |
| Agents | `~/.claude/agents/<name>.md` | Registered via `options.agents` | Yes |
| Plugins | `~/.claude/plugins/marketplaces/...` | Contribute skills, agents, MCP servers | Yes |

### Injection point for master prompt

The `systemPromptConfig` at `claude.ts:1759` is the place to inject a Vilda master prompt. Currently it only appends AGENTS.md. We can prepend our master prompt before the AGENTS.md content:

```typescript
const systemPromptConfig = {
  type: "preset",
  preset: "claude_code",
  append: `\n\n${vildaMasterPrompt}\n\n# AGENTS.md\n${agentsMdContent}`,
}
```

### Access to productVibeMode

`getProductVibeMode()` from `app/src/main/lib/app-mode.ts` is available in the main process. Can be imported into `claude.ts` to gate the master prompt injection — only inject when `productVibeMode === true`.

## Recommended architecture for Phase 8b

**Three-layer approach:**

1. **`vilda-system.md`** (runtime inject via `systemPrompt.append`) — light index: defines role, way of working, points to CLAUDE.md. ~20 lines. Applied to every message. User never sees it.

2. **Template `CLAUDE.md`** (per-project, in project directory) — all specifics: stack rules, design quality, component discipline, image handling, accessibility, file structure, tone. Editable by advanced users.

3. **Template `AGENTS.md`** (per-project) — one-line redirect: "Read CLAUDE.md for all instructions." Exists only for Codex compatibility (Codex reads AGENTS.md, Claude reads CLAUDE.md).

See `product/notes/phase-8b-master-prompt.md` for full build plan.
