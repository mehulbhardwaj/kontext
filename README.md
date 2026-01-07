# Kontext
> **"RAM for your AI Agents"**

Kontext is a CLI tool that fights **Context Entropy** in AI-assisted development. It ensures your AI (Cursor, Windsurf, Copilot) always understands the *current* architectural reality of your project.

## The Problem
Codebases rot because the "Why" is lost. AI accelerates this rot by generating code without understanding architectural constraints.

## The Solution: The Agent Squad
Kontext deploys a squad of local agents to maintain your documentation automatically.

1.  **The Scribe** (`kontext suggest`): Active on `git commit`. It watches your diffs and drafts **Architectural Decision Records (ADRs)** for you.
2.  **The Broadcaster** (`kontext sync`): Tells your IDE (Cursor) exactly where to find the "Truth" (Docs), so it never hallucinates.
3.  **The Structurer** (`kontext format`): Enforces a strict schema (defined in Templates) on all your docs.
4.  **The Pruner** (`kontext distill`): Merges duplicate decisions to keep your context window high-signal.

## Usage
### 1. Zero-Config Start
```bash
npx kontext init
```

### 2. The Flow
Just code. When you commit, Kontext wakes up:
```bash
git commit -m "feat: switch to redis"
# 🤖 [Kontext Agent] Drafting ADR-001: Introduce Redis...
```

### 3. Maintenance
```bash
# Conform all docs to templates
npx kontext format

# Merge duplicates
npx kontext distill
```

## Directory Structure (`.kontext/`)
- `decisions/`: Immutable log of choices.
- `index.md`: Connection point.
- `templates/`: Custom formats for your docs.
