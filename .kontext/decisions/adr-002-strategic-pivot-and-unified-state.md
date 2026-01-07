---
id: ADR-002
status: accepted
date: 2026-01-06
tags: [strategy, organization, pmf]
---
# ADR-002: Strategic Pivot to 'RAM for AI' and Unified State

## Context
Initially, the project was framed as a 'Documentation Tool'. However, we identified that manual documentation maintenance has negative entropy. The core pain point is 'Context Entropy'—AI agents forgetting the 'Why'. We also had a split between machine state (`.kontext/`) and human specs (`docs/`), creating fragmented truth.

## Decision
We are rebranding and refocusing the product as **'RAM for the AI'**. This involves:
1.  **Unified State**: All documentation and specifications are absorbed into `.kontext/` (moving `docs/` to `.kontext/specs/`). `.kontext/index.md` is now the single entry point.
2.  **Strategy Elevation**: `strategy.md` is moved from `specs/` to the root of `.kontext/` to reflect its role as 'Meta-Architecture'.
3.  **Active Guardrails**: Introducing `.kontext/actions/` for executable scripts that enforce architectural constraints at commit-time.
4.  **Integration Focus**: Primary integration is with Agent Context Windows (Cursor, Claude) rather than human web portals.

## Consequences
- **Pros**: Higher PMF potential by solving AI hallucination; cleaner root directory; single source of truth for agents.
- **Cons**: Requires deeper integration with agent workflows; maintenance of shell scripts for actions/hooks.