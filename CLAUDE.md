
<!-- KONTEXT_BLOCK_START -->
# 🧠 Kontext Memory (Auto-Generated)
# Do not edit this block manually. Run "npx kontext sync" to update.
# Source of Truth: .kontext/

## Active Architectural Decisions

| ID | Status | Title | Tags |
| :--- | :--- | :--- | :--- |
| ADR-001 | accepted | Untitled |  |
| ADR-002 | accepted | Untitled | strategy, organization, pmf |
| adr-005 | accepted | Context Compilation and Injection | strategy, broadcaster |
| adr-006 | accepted | Simplified Structure and Guard Hook | structure, hooks |

### Decision Summaries

**ADR-001**: We are introducing Redis as the primary caching and state management layer. It is selected for being fast and reliable. The `RedisCache` service will serve as the abstraction layer for interacting with the Redis store.

**ADR-002**: We are rebranding and refocusing the product as **'RAM for the AI'**. This involves:
1.  **Unified State**: All documentation and specifications are absorbed into `.kontext/` (moving `docs/` to `.kontext/specs/`). `.kontext/index.md` is now the single entry point.
2.  **Strategy Elevation**: `strategy.md` is moved from `specs/` to the root of `.kontext/` to reflect its role as 'Meta-Architecture'.
3.  **Active Guardrails**: Introducing `.kontext/actions/` for executable scripts that enforce architectural constraints at commit-time.
4.  **Integration Focus**: Primary integration is with Agent Context Windows (Cursor, Claude) rather than human web portals.

**adr-005**: We will use a **Broadcaster** strategy (`kontext sync`) that:
1.  **Compiles** active decisions and architecture into a compact Markdown block.
2.  **Injects** this block directly into `.cursorrules` and `CLAUDE.md`.
3.  Replaces the "Pointer Only" constraint.

**adr-006**: 1.  **Structure**: We will delete `.kontext/specs/`. The PRD lives at `.kontext/PRD.md`.
2.  **Hook**: The `pre-commit` hook will run `kontext check` (The Guard). `kontext suggest` (The Scribe) is opt-in.
3.  **Supersedes**: ADR-002 (Strategic Pivot) regarding structure/hooks.


# 🤖 Agent Instructions:
# 1. Respect the constraints in the table above.
# 2. If you propose changes that conflict with an Accepted ADR, you MUST ask the user.
# 3. New architectural choices? Run "npx kontext suggest".
<!-- KONTEXT_BLOCK_END -->
