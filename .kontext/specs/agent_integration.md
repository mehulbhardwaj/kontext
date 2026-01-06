# Agent Integration Strategy

How to make `.kontext` the brain for every agent.

## The Universal Adapter Pattern
`kontext` acts as the source of truth. We "bridge" this truth to agent-specific config files.

| Agent | Config File | Strategy |
| :--- | :--- | :--- |
| **Cursor** | `.cursorrules` | Append "Read .kontext/index.md" to system prompt. |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Create/Append instruction to read context. |
| **Claude (CLI)** | `claude.md` (Convention) | Maintain a "Context Scratchpad" or config if available. |
| **Windsurf** | `.windsurfrules` | Same as Cursor. |
| **Antigravity** | `(Implicit)` | Just looks at file system. |

## Implementation Plan (Phase 2)
The `kontext init` command should detect *all* of these files and offer to inject the bridge.
