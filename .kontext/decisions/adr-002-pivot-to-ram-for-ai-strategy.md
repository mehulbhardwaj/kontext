---
type: decision
id: adr-002
status: proposed
date: 2026-01-06
tags: []
---
# Pivot to "RAM for AI" Strategy

## Context
Initially, the project was framed as a "Documentation Tool" or "Project Brain".
However, "Documentation" has negative entropy (people hate writing it).
We realized the core pain point is "Context Entropy" — AI agents forgetting the "Why" and generating legacy code.

## Decision
We are rebranding and focusing the product strategy on **"RAM for the AI"**.
This means:
1.  **Zero Friction:** Steps must be automated or suggested (e.g., Pre-commit, Agent suggestions).
2.  **Active Guardrails:** State must be actionable (linters, CI checks), not just readable.
3.  **Context Bridge:** Primary integration is with Agent Context Windows (Cursor, Claude), not human web portals.

## Consequences
- **Positive:** Higher PMF potential as it solves an urgent pain (AI Hallucination).
- **Negative:** Harder technical challenge (needs deep integration with Agent workflows).

