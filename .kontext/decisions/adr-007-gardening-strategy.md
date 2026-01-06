---
type: decision
id: adr-007
status: accepted
date: 2026-01-06
tags: [agent, strategy, pruning]
---
# The Gardening Strategy (Structure & Prune)

## Context
We initially thought "Broadcasting" full context to `.cursorrules` was the win.
However, context windows are small, and "Context Entropy" isn't just about *missing* info, it's about *too much noise*.
We need agents that don't just "Add" (Scribe), but "Maintain" (Gardener) and "Delete" (Pruner).

## Decision
1.  **Minimal Bridge**: `.cursorrules` should only contain *pointers* to usage (`kontext suggest`, `kontext remember`). It should not carry the payload.
2.  **The Gardening Loop**:
    - **Structure Agent**: Enforces opinionated structure defined in `index.md` (Schema).
    - **Pruning Agent**: Distills duplicate info into a cleaner "Decision Graph".
3.  **Workflow**:
    - Commit -> Scribe (Add) -> Structure (Format) -> Prune (Distill).

## Consequences
- **Positive**: `.kontext` remains a high-signal "Diamond", not a dump.
- **Positive**: IDE interaction remains lightweight.
- **Negative**: "Pruning" is dangerous. Agents deleting text requires high trust/verification.
