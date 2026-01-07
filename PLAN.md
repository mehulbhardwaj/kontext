# Project Plan & Workflows

## Current Status: Phase 1 Complete (The Agent Squad)
The "Gardening" Agents are active and self-maintaining.

## Workflows (How to use)

### 1. The Daily Loop (Coding)
- **Goal:** Write code, keep context fresh.
- **Workflow:**
    1.  User: `git commit -m "feat: added login"`
    2.  **Scribe** (`pre-commit`): Intercepts. "I see you added Auth. Drafting ADR..."
    3.  User: Approves (Y).
    4.  **Broadcaster**: Updates rules.
    5.  Result: Code + ADR committed. Typescript Error prevented in next file because Cursor knows about Auth.

### 2. The Gardening Loop (Maintenance)
- **Goal:** Clean up the chaos.
- **Workflow:**
    1.  User runs `kontext format`.
        - **Structurer**: Rewrites all ADRs to match `.kontext/templates/decision.md`.
    2.  User runs `kontext distill`.
        - **Pruner**: "ADR-005 duplicates ADR-001. Merge?"
        - User: Approves.

## Roadmap (Next Steps)

### Phase 2: The Enterprise Guard
- [ ] **GitHub Action:** Implement `kontext-action` to run validation on PRs.
- [ ] **Visual Graph:** Implement `kontext graph` to visualize dependencies (`supersedes`).
- [ ] **Multi-Repo:** "Kontext Hub" to share constraints across repos.

### Phase 3: The Intelligence Layer
- [ ] **Query:** `kontext ask "Why did we choose Postgres?"` (RAG on top of decisions).
- [ ] **Proactive:** Agent suggests refactors based on *Constraint Violations* in legacy code.

## Archive
- `technical_spec_phase1.md`: Initial CLI Design (Legacy).
- `technical_spec_phase2.md`: Early ideas on Graphs (Partial Implementation).
