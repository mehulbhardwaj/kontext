# Evaluation & Gap Analysis

## 1. The "Decision Graph" Question
**User Question:** "So remember becomes some kind of a decision graph?"

**Answer:** 
In **Phase 1 (MVP)**, it is **not yet a graph**; it is a **linear log** (like a git history of decisions). You have `adr-001`, `adr-002`, etc., which are sequential.

 However, the *intent* is for it to become a graph. In **Phase 2**, we should explicitly introduce "graph edges" via front-matter relationships:
```yaml
type: decision
id: adr-005
status: accepted
supersedes: [adr-001]     # <-- The Edge
related_to: [adr-003]     # <-- The Edge
```
This transforms the folder from a list of files into a **Directed Acyclic Graph (DAG)** of decisions, where agents can trace the "Why" backwards.

## 2. Evaluation of PRD and Tech Spec (Phase 1)

### Are the requirements clear?
**Yes, mostly.** 
- **Clear:** The file structure, the CLI command inputs/outputs, and the "Primitive" philosophy.
- **Ambiguous:** 
    - **Editor Interaction:** `kontext remember` takes a string argument. Does it just write a one-line file? Or does it open `$$EDITOR` (vim/code) for the user to write the body? *Recommendation: For Phase 1, just write the file with the argument as H1/Summary to keep it simple (non-interactive).*
    - **Validation Logic:** "Ensure type field matches filename conventions" is vague in the spec. *Clarification: It means if filename is `decisions/xxx`, type must be `decision`.*

### Can they be improved?
**Yes.**
1.  **Testing:** The Tech Spec mentions "AI Test" as a metric, but lacks a *functional* test plan for the CLI itself (e.g., unit tests for the template engine).
2.  **Context Bridge:** The spec asks the user to manually copy text to `.cursorrules`. **Improvement:** `kontext init` should optionally *append* this to `.cursorrules` automatically (with permission).
3.  **Default Content:** The default `architecture.md` templates are empty. They should probably contain commented-out examples to teach the user *how* to write them.

### Missing Pre-work?
1.  **`TECH.md`?**
    - You asked if we need a `TECH.md`.
    - **Verdict:** No. `kontext/architecture.md` + `kontext/setup.md` **IS** your `TECH.md`. Creating a separate `TECH.md` would duplicate the "Single Source of Truth" you are trying to build.
    - *However*, we do need a `CONTRIBUTING.md` for *this* repo (kontextState itself) to tell developers how to build the CLI.

2.  **License:** We need to decide on a license (MIT/Apache) since it's an "Open Standard".

## 3. Recommendations for "Ready to Work"
Before coding, we should:
1.  **Lock the Schema:** Define the exact Zod schema for Phase 1 `index.md`, `decision`, etc. to avoid rewriting validator logic.
2.  **Pick a Library for Front-matter:** `gray-matter` is good, but we need to ensure it handles array preservation correctly for the future "Graph" features.
