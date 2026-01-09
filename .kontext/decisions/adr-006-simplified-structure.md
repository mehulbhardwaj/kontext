---
id: adr-006
status: accepted
date: 2026-01-10
tags: ["structure", "hooks"]
title: Simplified Structure and Guard Hook
---
# ADR-006: Simplified Structure and Guard Hook

## Context
ADR-002 mandated a complex folder structure (`.kontext/specs/`) and a "Suggest" hook.
Experience shows that:
1.  Specs are often redundant with ADRs and create "Context Entropy".
2.  The "Suggest" hook is too intrusive for every commit. A "Check" (Guard) hook is safer and faster.

## Decision
1.  **Structure**: We will delete `.kontext/specs/`. The PRD lives at `.kontext/PRD.md`.
2.  **Hook**: The `pre-commit` hook will run `kontext check` (The Guard). `kontext suggest` (The Scribe) is opt-in.
3.  **Supersedes**: ADR-002 (Strategic Pivot) regarding structure/hooks.

## Consequences
*   **Simpler Context**: Less noise for the AI.
*   **Faster Commits**: `check` is faster than `suggest` (and non-interactive).
