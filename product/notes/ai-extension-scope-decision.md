# AI Extension Scope Decision (Claude + Codex)

## Decision

For ProductVibe, use **repo-scoped** setup as the default.

Why:
- Avoids global side effects
- Keeps behavior specific to this product
- Easier team onboarding and reproducibility

Add a **product-local private overlay** only when needed:
- `./.productvibe/` (gitignored) for personal/private additions

Avoid relying on global config except for personal defaults.

## Mental model

There are two separate axes:

1. **Scope** (where config/extensions live)
- Global
- Repo
- Product-local (`.productvibe`, gitignored)

2. **Runtime** (tool model)
- Claude Code: agents + plugins
- Codex: skills + MCP (no direct Claude-style plugin dir)

## Recommended setup

### Shared for team (repo)
- Keep shared skill/plugin/bootstrap files in repo
- Provide one launcher script so everyone runs the same way

### Private for this product (local only)
- Keep sensitive or personal extras in `./.productvibe/`
- Do not commit this directory

## Product-local examples

### Codex
```bash
export CODEX_HOME="$PWD/.productvibe/codex"
codex
```

### Claude Code
```bash
claude \
  --settings "$PWD/.productvibe/claude/settings.json" \
  --plugin-dir "$PWD/.productvibe/claude/plugins"
```

## Rule of thumb

- Default: **repo-scoped**
- Use `.productvibe` only for private overrides
- Use global only for personal defaults that should apply everywhere
