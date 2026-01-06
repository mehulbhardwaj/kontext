---
type: decision
id: adr-003
status: proposed
date: 2026-01-06
tags: []
---
# Agent-First Decision Detection

## Context
A user asked: *"Why not just build an agent that identifies these decisions automatically?"*
Currently, `kontext remember` requires manual invocation, which is high friction.
Users often realize they made a decision *after* the fact (during commit or PR).

## Decision
We will prioritize building **"Suggestion Mode"** (Agent-First Detection).
Instead of forcing humans to write valid YAML/Markdown:
1.  An Agent (LLM) will scan `git diff --staged`.
2.  It will identify architectural changes (e.g., "Added generic repository pattern").
3.  It will *propose* a structured ADR to the user.
4.  The user simply says "Yes" (Reviewer flow).

## Consequences
- **Easier:** Adoption friction drops to near zero.
- **Harder:** Requires an LLM call in the CLI/CI pipeline (API keys, cost).

