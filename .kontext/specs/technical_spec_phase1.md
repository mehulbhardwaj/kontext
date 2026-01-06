# Technical Specification: Kontext State (Phase 1 MVP)

**Version:** 0.1.1 (Refined)
**Scope:** CLI implementation for local scaffolding, ADR creation, and "Context Bridge" management.
**Objective:** Enable the "Prove the Primitive" workflow: `init` → `remember` → AI Agent Consumption.

## 1. System Architecture
The application is a lightweight Node.js CLI tool. It operates entirely locally on the user's file system.

### 1.1 Core Components
1.  **CLI Entry Point (`bin/kontext`)**: Parses arguments using `commander`.
2.  **File System Manager**: Handles safe writing, reading, and directory creation.
3.  **Template Engine**: Injects dynamic variables (dates, IDs) into static Markdown templates.
4.  **Schema Validator**: Uses `zod` to ensure front-matter integrity.
5.  **Context Bridge**: A module dedicated to injecting/updating external context files (`.cursorrules`, `claude.md`).

## 2. Data Schema (The Primitive)
The source of truth is the `.kontext/` directory.

### 2.1 Directory Structure
```text
/root
  ├── .cursorrules          # (External) High-intent context file
  ├── .kontext/
  │   ├── index.md          # Entry point / Manifest
  │   ├── decisions/        # Immutable log of ADRs
  │       ├── adr-001.md
  │       └── ...
```

### 2.2 Selected Libraries
- **Front-Matter Parsing:** `gray-matter` (Industry standard, robust, supports custom engines).
- **Validation:** `zod` (TypeScript-first validation).
- **CLI:** `commander` + `inquirer`.

### 2.3 Locked Schemas (Zod Definitions)

**Shared Types:**
```typescript
const StatusSchema = z.enum(['proposed', 'accepted', 'deprecated', 'rejected']);
const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD
```

**Index Schema (`index.md`):**
```typescript
const IndexSchema = z.object({
  type: z.literal('index'),
  last_updated: DateSchema,
  priority_files: z.array(z.string()),
});
```

**Decision Schema (`decisions/adr-XXX.md`):**
```typescript
const DecisionSchema = z.object({
  type: z.literal('decision'),
  id: z.string().regex(/^adr-\d{3}$/), // e.g., adr-001
  status: StatusSchema.default('proposed'),
  date: DateSchema,
  tags: z.array(z.string()).optional(),
  // Flexible for future growth
}).passthrough();
```

## 3. Functional Requirements (CLI Commands)

### 3.1 Command: `init`
Scaffolds the directory structure and bridges context.
*   **Usage:** `npx kontext init`
*   **Logic:**
    1.  Create `.kontext` directory structure.
    2.  Write default `index.md` (Manifest).
    3.  **Context Bridge:**
        *   Check for `.cursorrules` or `.windsurfrules`.
        *   Prompt: *"Add Kontext instruction to .cursorrules?"* (Default: Yes).
        *   **Action:** Append the "High Intent" instruction block to the file.
            ```markdown
            
            # Kontext State
            This project uses Kontext State for architectural decisions.
            - Read .kontext/index.md for context.
            - Check .kontext/decisions/ for history.
            ```

### 3.2 Command: `remember`
Captures intent and updates the context bridge.
*   **Usage:** `npx kontext remember "Switching to Postgres"`
*   **Logic:**
    1.  **Create ADR:**
        *   Generate `decisions/adr-XXX-switching-to-postgres.md`.
        *   Write front-matter and H1 title.
    2.  **Context Bridge Update (Simulated Graph):**
        *   It does NOT rewrite the whole `.cursorrules` (that would be invasive).
        *   Instead, it updates `.kontext/index.md` to update the `last_updated` field, signaling agents to re-read.
        *   *Optionally:* If the user has a `claude.md` (which often acts as a "scratchpad"), append a one-line log:
            `- [2026-01-06] recorded decision: adr-005 (Switching to Postgres)`

### 3.3 Command: `validate`
*   **Logic:**
    *   Walks through `.kontext/**/*.md`.
    *   Extracts front-matter using `gray-matter`.
    *   Runs `ZodSchema.parse()`.
    *   Reports structural errors (missing fields, invalid enums).

## 4. Implementation Details
### 4.1 Slugification Strategy
Use `slugify` package with:
*   `lower: true`
*   `strict: true` (strips special characters)
*   `trim: true`

### 4.2 File System
Use `fs-extra` for atomic writes and `ensureDir`.

## 5. Evaluation & Critique
### Strengths
- **Locked Schema:** Using Zod guarantees we don't drift.
- **Context Bridge:** Directly addressing the "User's Local Context" (Cursor/Claude) ensures high adoptability.

### Risks
- **Over-writing User Configs:** Creating/Editing `.cursorrules` is sensitive. We must always `append` and never `overwrite` without explicit force flags.
