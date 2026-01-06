---
type: decision
id: adr-004
status: proposed
date: 2026-01-06
tags: []
---
# Unified State (Absorbing Docs into Kontext)

## Context
We previously had a split between `.kontext/` (machine state) and `docs/` (human specs, strategy).
This created two sources of truth. The user (and future agents) asked: "Shouldn't we absorb all of docs into .kontext to be the RAM?"
We also identified a need to distinguish between **Permanent** (Architecture, Specs) and **Temporal** (Plans) information.

## Decision
1.  **Absorb Docs:** We moved `docs/` into `.kontext/specs/` (and potentially `.kontext/knowledge/`).
2.  **Single Entry Point:** `.kontext/index.md` is the absolute root. If it's not linked there, it doesn't exist for the Agent.
3.  **Temporal Separation:** We will use `.kontext/plans/` for ephemeral execution plans, separated from long-term truths.

## Consequences
- **Easier:** Agents only need to scan `.kontext` to understand *everything* (History, Strategy, Specs).
- **Cleaner:** `root` directory is less cluttered.

