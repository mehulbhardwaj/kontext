---
status: accepted
date: 2023-10-27
contact: Senior Technical Architect
---
# ADR-002: Agentic Suggestion Loop via Git Hooks

## Status
Accepted

## Context
To minimize the friction of maintaining 'Architecture Decision Records' (ADRs) and prevent documentation rot, we need a way to intercept the developer workflow and prompt for context capture when significant changes occur. 

## Decision
We are implementing an automated suggestion loop using a Git `pre-commit` hook. 

1.  **Trigger**: The hook is installed via `.kontext/actions/install-hooks`.
2.  **Analysis**: The `pre-commit` hook executes `kontext suggest`, which reads the staged git diff.
3.  **Intelligence**: We use the Gemini LLM (`@google/generative-ai`) to compare the diff against the current `.kontext` state.
4.  **Action**: If the AI detects a significant architectural shift, it prompts the user to generate and stage a new ADR file before the commit completes.

## Consequences
- **Friction**: Adds a brief latency to the `git commit` process due to LLM analysis.
- **Dependencies**: Requires `GEMINI_API_KEY` to be present in the environment for full functionality.
- **Automation**: Greatly reduces the manual overhead of remembering to run documentation commands.
- **Bypass**: Users can still bypass the check using `git commit --no-verify` if necessary.