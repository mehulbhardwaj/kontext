---
id: adr-005
status: accepted
date: 2026-01-10
tags: ["strategy", "broadcaster"]
title: Context Compilation and Injection
---
# ADR-005: Context Compilation and Injection

## Context
Previous strategies (ADR-003) advocated for a "Minimal Pointer" approach where `.cursorrules` only contained a link to `kontext`.
However, we found that Agents (Cursor, Windsurf) perform significantly better when high-signal "Compiled Context" (summaries of active ADRs, architecture) is directly present in their system prompt.

## Decision
We will use a **Broadcaster** strategy (`kontext sync`) that:
1.  **Compiles** active decisions and architecture into a compact Markdown block.
2.  **Injects** this block directly into `.cursorrules` and `CLAUDE.md`.
3.  Replaces the "Pointer Only" constraint.

## Consequences
*   **Pros:** Agents have immediate access to architectural constraints without needing to run tools first.
*   **Cons:** `.cursorrules` file size increases (mitigated by `distill` pruning).
*   **Supersedes:** ADR-003 (Pointer Constraint).
