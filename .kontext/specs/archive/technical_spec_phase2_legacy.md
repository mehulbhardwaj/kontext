# Technical Specification: Kontext State (Phase 2 - Infrastructure)

**Version:** 0.2.0
**Scope:** CI/CD Integration, Decision Graphs, and Advanced Validation.
**Objective:** Move from "Local Tool" to "Repo Infrastructure" (The Guard Rails).

## 1. Core Features

### 1.1 The Decision Graph (Relations)
Transform the flat list of ADRs into a graph structure.

**Schema Update (`decisions/adr-XXX.md`):**
```yaml
type: decision
id: adr-005
status: accepted
# New Fields
supersedes: []       # List of ADR IDs this replaces
amends: []           # List of ADR IDs this modifies
related_to: []       # List of related ADR IDs
requires: []         # List of ADR IDs that must be accepted for this to work
```

**CLI Update (`kontext validate`):**
- **Graph Integrity Check:** 
    - Error if `supersedes` points to a non-existent ID.
    - Warning if `supersedes` points to a deprecated decision.
    - Error if "Cycles" are detected (A supersedes B, B supersedes A).

### 1.2 CI/CD Integration (`kontext-action`)
A GitHub Action to enforce state validity.

**Inputs:**
- `strict_mode`: (boolean) Fail on warnings?
- `allowed_status`: (array) Which statuses are allowed in `architecture.md`?

**Logic:**
1.  Checkout code.
2.  Run `kontext validate`.
3.  **Diff Check:** If `kontext/decisions` has changes but `kontext/index.md` (last_updated) wasn't touched, warn the PR.
4.  **Auto-Comment:** (Optional) Post a summary of the "State Diff" to the PR.
    > "This PR adds 1 Decision and modifies Architecture."

### 1.3 Interactive `remember`
Improve the UX of creating decisions.

**Command:** `kontext remember` (no args)
**Flow:**
1.  Prompts for Title.
2.  Prompts: "Does this supersede an existing decision?" (Select from list).
3.  Prompts: "Add to Context Bridge?" (Default: Yes).
4.  Opens `$EDITOR` with the pre-filled template.

## 2. Updated Data Schemas

### 2.1 `architecture.md` (Enhanced)
Allow mapping code paths to architecture components.
```yaml
type: architecture
components:
  - name: api
    path: ./src/api/**   # <--- Link to real code
    owner: @backend-team
```

### 2.2 `constraints.md` (Lintable)
Make constraints actionable.
```yaml
type: constraints
banned_dependencies:
  - name: lodash
    reason: "Use native array methods"
```
*Future thought: `kontext check` could actually scan package.json for these.*

## 3. Technology Stack Additions
- **Graph Algo Library:** `dagre` or simple custom DFS for cycle detection.
- **GitHub Actions SDK:** `@actions/core`, `@actions/github`.
- **Diffing Library:** `diff` or `jest-diff` for pretty-printing state changes in CI.

## 4. Phase 2 Success Metrics
1.  **Graph Valid:** Can run `kontext validate` on a repo with 50+ interlinked ADRs in under 1s.
2.  **CI Catch:** The GitHub Action fails a PR that deletes an active ADR without marking it `deprecated`.
3.  **Navigable:** Agents can answer "Why did we stop using MongoDB?" by traversing `supersedes` links from the current DB ADR back to the original MongoDB ADR.
