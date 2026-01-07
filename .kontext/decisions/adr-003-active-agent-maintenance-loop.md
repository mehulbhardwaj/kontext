---
id: ADR-003
status: accepted
date: 2026-01-06
tags: [agent, automation, workflow, gardening]
---
# ADR-003: Active Agent Maintenance Loop (Scribe & Gardener)

## Context
Manual invocation of documentation tools is high-friction and prone to drift. Furthermore, context entropy is caused not just by missing information, but by 'noise' and duplicate data within context windows.

## Decision
We are implementing an **Active Agent Maintenance Loop** via Git hooks:
1.  **Shift to Approver Model**: The AI Agent is responsible for maintaining `.kontext/*.md`. Humans review and approve patches during the commit flow.
2.  **Scribe & Suggestion Mode**: Using Gemini/LLMs to scan `git diff --staged` and automatically propose ADRs or architectural updates.
3.  **Gardening & Pruning**: The agent doesn't just add info; it also distills and deletes duplicate or low-signal information to keep the 'Context RAM' high-signal.
4.  **Minimal IDE Bridge**: `.cursorrules` will only contain pointers to `kontext` commands rather than carrying the full data payload.

## Consequences
- **Pros**: Zero-friction documentation; documentation never drifts from code; high-signal-to-noise ratio in context.
- **Cons**: Requires `GEMINI_API_KEY` (or LLM provider); risk of 'trash docs' if the agent hallucinates and the user auto-approves without review.