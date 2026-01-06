---
type: decision
id: adr-006
status: accepted
date: 2026-01-06
tags: [agent, automation, workflow]
---
# Agentic Context Maintenance (Active Agent Pivot)

## Context
Originally, `kontext` was conceived as a "RAM" or "State Layer" that humans maintained (or AI suggested edits to).
However, for widespread adoption (PMF), the friction of manually running `kontext remember` or `kontext validate` is too high.
The "Fastest Path to PMF" is to make `kontext` an **Active Agent** that runs at commit time (or effectively replaces the commit workflow) to *automatically* groom the context.

## Decision
1.  **Shift Responsibility:** The AI Agent (powered by `kontext`) is now responsible for maintaining `.kontext/*.md`. The human's role shifts to **Approver**.
2.  **Commit-Time Workflow:**
    - On `git commit` (via hook or `kontext commit` wrapper):
    - Agent scans the staged `diff`.
    - Agent reads existing `.kontext`.
    - Agent proposes patches to `.kontext` (e.g., updating `architecture.md`, creating `adr-*.md`).
    - Human reviews a concise summary.
    - If approved, patches are applied and committed together with code.
3.  **LLM Integration:**
    - The tool will require an LLM Provider (initially user's API key, later potentially a hosted service or leveraging local models/IDE context).

## Consequences
- **Positive:** Zero-friction documentation. It happens as a side-effect of coding.
- **Positive:** Documentation never drifts because the Agent catches it at the commit gate.
- **Negative:** Complexity of managing LLM keys/costs in a local CLI tool.
- **Negative:** Risk of "trash docs" if the Agent hallucinates and user auto-approves. We must emphasize *concise* and *structured* updates.
