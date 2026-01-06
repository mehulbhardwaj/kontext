---
type: decision
id: adr-005
status: accepted
date: 2026-01-06
tags: [architecture, workflow, automation]
---
# Commit-Time Actions & Strategy Elevation

## Context
Reflecting on the "Strategy & PMF" goals, we realized that for `kontext` to effectively fight entropy, it cannot just be a passive documentation store. It must be active in the developer's workflow (Commit Hooks).
Additionally, `strategy.md` was buried in `.kontext/specs/`, but it acts as the primary guiding compass for the project. It needs higher visibility.

## Decision
1.  **Introduce `.kontext/actions/`**: A directory for executable scripts (hooks) that enforce context.
    - These scripts serve as reference implementations for `pre-commit` checks.
    - Enforced citation: Checks if architectural changes overlap with existing constraints.
    - Zero-Effort Capture: Interactive prompts during commit flow.
2.  **Elevate Strategy**: Move `.kontext/specs/strategy.md` to `.kontext/strategy.md`.
    - Strategy is effectively "Meta-Architecture" and deserves root-level placement alongside `architecture.md`.

## Consequences
- **Positive**: `kontext` becomes an active participant in development cycles, not just a passive reference.
- **Positive**: Strategy is immediately visible to both Humans and Agents entering the `.kontext` directory.
- **Negative**: Requires maintenance of shell scripts (portability concerns). We will target POSIX sh/bash for widespread compatibility initially.
