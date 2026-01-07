# Technical Specification: Kontext State (Active)

**Scope:** The Agentic "Gardening" System.
**Current Version:** 0.3.0

## 1. System Architecture
Kontext is a CLI tool that acts as a **"Context Nerve"** for the repository. It uses a squad of local Agents to maintain documentation as code evolves.

### 1.1 The Agent Squad
The core of the system is the interactive loop triggered by git hooks.

#### A. The Scribe (`kontext suggest`)
- **Role:** Creative input.
- **Trigger:** Pre-commit / Manual.
- **Input:** `git diff --staged` + `.kontext/templates/decision.md`.
- **Logic:** Uses LLM (Gemini) to infer architectural intent and draft new ADRs.
- **Output:** New `.md` files in `.kontext/decisions/`.

#### B. The Broadcaster (`kontext sync`)
- **Role:** Context Bridge.
- **Trigger:** Post-commit / Manual.
- **Logic:** Reads `index.md` (source of truth).
- **Output:** Updates `.cursorrules` (and others) with a minimal pointer block (`<!-- KONTEXT_START -->`).

#### C. The Structurer (`kontext format`)
- **Role:** Compliance/Librarian.
- **Trigger:** Manual / CI.
- **Logic:** Reads all `.md` files and enforces `templates/*` structure.
- **Output:** Rewritten, compliant markdown files.

#### D. The Pruner (`kontext distill`)
- **Role:** Garbage Collector.
- **Trigger:** Manual (Periodic).
- **Logic:** Analyzes full decision graph for duplicates/obsolescence.
- **Output:** Interactive "Merge Proposal" (Safe Delete).

## 2. Data Schema & Templates

### 2.1 The Template Engine
Structure is defined by **Templates** in `.kontext/templates/`.
- `decision.md`: Defines ADR format (ID, Status, Context, Decision, Consequences).
- `architecture.md`: Defines the Map format.
- **Enforcement:** `kontext format` agentically rewrites content to match these templates.

### 2.2 Directory Structure
```text
/root
  ├── .kontext/
  │   ├── index.md             # Manifest / Entry
  │   ├── strategy.md          # Meta-Strategy
  │   ├── architecture.md      # High-level map
  │   ├── constraints.md       # Hard rules
  │   ├── decisions/           # Immutable Log
  │   ├── templates/           # Schema Definitions
  │   └── actions/             # Git Hooks
```

## 3. Libraries & Stack
- **Runtime:** Node.js (TypeScript).
- **CLI:** `commander` + `inquirer`.
- **LLM:** `@google/generative-ai` (Gemini Ultra/Flash).
- **FileOps:** `fs-extra` (Atomic writes).
