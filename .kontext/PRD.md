# Product Requirements Document (PRD): Kontext

**Mission:** Build the "Semantic Compiler" that allows Autonomous Agents to understand Architectural Intent without reading 10,000 files.

## 1. Business Strategy & The Wedge
*   **The Disease:** "Context Entropy" (Codebases rot because Intent is lost).
*   **The Wedge:** **Cost & Compliance**. We sell the immediate pain relief:
    1.  **Cost (The Pruner):** "Stop burning tokens on irrelevant files."
    2.  **Compliance (The Guard):** "Stop Agents from breaking architecture rules."
*   **The Value Prop:** "Kontext is **RAM for your Repo's AI**. It acts as a Semantic Compiler to prune noise and enforce signal."

## 2. Market Landscape & The "Gap"

| Segment | Tools | Why they fail for Agents | Kontext Integration (The "Upstream Authority") |
| :--- | :--- | :--- | :--- |
| **Active Context Managers** | `Git-Context-Controller` (Research), `GitHub Copilot CLI` | Good for *human* interaction, but lack a persistent, structured "Brain" for *autonomous* agents. | **Kontext Sync:** Auto-generates high-signal config files (`.cursorrules`, `CLAUDE.md`) from the Graph. |
| **Memory / Vector DBs** | `Mem0`, `Redis`, `Pinecone` | Great for *facts* but unaware of *structure* (repository architecture). "Long-term memory without executive function." | **Kontext MCP:** Agents query `kontext` for specific constraints ("Auth Pattern") before coding. |
| **Frameworks** | `LangChain`, `LlamaIndex` | Orchestrators, not State Managers. They *need* a tool like Kontext to feed them the right state. | **Kontext Distill:** Provides a "Compiled Context Pack" to the Orchestrator to reduce token cost. |

**The Gap:** A **Repo-Native Knowledge Graph** that unifies Code, Decisions, and Constraints into a format agents can query *deterministically*.

## 3. User Personas (No Change)

## 4. Core Functional Requirements & Verification Plans

### A. "The Structurer" (Input Standardization)
*   **Feature:** `kontext format <file>`
*   **Behavior:** Reads unstructured text -> Generates Canonical ADR in `.kontext/decisions/` -> Uses Tagging Taxonomy.
*   **Phase:** 1
*   **Test Plan:**
    1.  Create `temp_notes.txt` with sloppy text: "We decided to use Redis for caching because it's fast."
    2.  Run `kontext format temp_notes.txt`.
    3.  Assert `.kontext/decisions/adr-XXX-redis-caching.md` exists.
    4.  Assert content has sections: Context, Decision ("Use Redis"), Consequences ("Fast").

### B. "The Broadcaster" (Context Compilation)
*   **Feature:** `kontext sync [--focus <topic>]`
*   **Behavior:** Reads ADRs -> Tag Filtering -> **Appends** (Does NOT Overwrite) to `.cursorrules` / `CLAUDE.md`.
*   **Phase:** 1
*   **Test Plan:**
    1.  Create dummy `.cursorrules` with "User Rule: Always smile."
    2.  Have 2 ADRs: `ADR-001 (backend)` and `ADR-002 (frontend)`.
    3.  Run `kontext sync --focus backend`.
    4.  Assert `.cursorrules` contains "User Rule: Always smile" (Preserved).
    5.  Assert `.cursorrules` contains `ADR-001` content but **NOT** `ADR-002`.

### C. "The Pruner" (Context Compression)
*   **Feature:** `kontext distill`
*   **Behavior:** Scans Graph -> Merges Duplicates -> Preserves ID History.
*   **Phase:** 2
*   **Test Plan:**
    1.  Create `ADR-001: Use Postgres` and `ADR-002: Decisions on DB (Postgres)`.
    2.  Run `kontext distill`.
    3.  Assert `ADR-002` is marked "Superseded by ADR-001" or merged into a new `ADR-003`.

### D. "The Gatekeeper" (Enforcement)
*   **Feature:** `kontext check`
*   **Behavior:** `pre-commit` hook -> Checks Staged Code vs Constraints.
*   **Phase:** 3
*   **Test Plan:**
    1.  Define constraint: "No `axios` allowed."
    2.  Stage a file with `import axios from 'axios';`.
    3.  Run `kontext check`.
    4.  Assert Exit Code 1.

## 5. Success Metrics
*   **Efficiency:** Context Pack size < 10% of Raw Repo size.
*   **Quality:** 0 Architectural Violations in CI.
*   **Trust:** Agents cite `ADR-XXX` in >50% of PRs.
