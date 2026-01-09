---
type: constraints
status: accepted
last_updated: 2026-01-10
---
# Constraints & Tech Stack

## 1. AI Stack
*   **Reasoning Engine:** `gemini-3-flash-preview` (Selected for speed/cost balance in CI/CD).
*   **Provider:** Google Generative AI.

## 2. Dependencies
*   **Runtime:** Node.js >= 18.0.0.
*   **Language:** TypeScript.
*   **Forbidden:** `axios` (Use `fetch` or SDKs).

## 3. Architecture
*   **State:** Architecture MUST be stored in `.kontext/`.
*   **Hooks:** `check` runs on `pre-commit`.
