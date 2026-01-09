# Kontext
> **"RAM for your AI"** (Project Memory Primitive)

Kontext is a **Semantic Compiler** for AI-Assisted Development.
It fights **Context Entropy** by compiling your project's architectural intent into optimized "Context Packs" that fit into your AI's context window.

---

## 🧠 The Thesis: "Context is Compute"
Today's AI coding agents suffer from **Context Entropy**:
*   **The Disease:** As codebases grow, the "Why" is lost. Agents regress, hallucinate, and break rules because they can't see the full history.
*   **The Cure:** **Upstream Authority**. Kontext acts as the single source of truth that feeds sanitized memory to downstream tools (Cursor, Windsurf, Copilot).

**Kontext is not just a documentation tool.**
It is an **Operating System for Context** that manages the lifecycle of knowledge.

---

### Workflow Example
1.  **Initialize**: `kontext init`
2.  **Think**: Write a raw note `idea.txt`.
3.  **Formalize**: `kontext format idea.txt`
4.  **Broadcast**: `kontext sync` (Now Cursor knows about it).
5.  **Code**: Write code.
6.  **Verify**: `kontext check` (Ensures you followed the plan).

---

## 🔄 The Agentic Lifecycle
Kontext works through 4 specialized stages to manage knowledge:

### 1. The Scribe (`kontext suggest`)
*   **Goal:** Active Observation.
*   **Action:** Watches your staged changes and **proposes** new ADRs or updates to existing ones if it detects architectural significance.
*   **Agentic:** It acts as a "Senior Architect" looking over your shoulder.
```bash
# Analyze staged changes
kontext suggest
```

### 2. The Structurer (`kontext format`)
*   **Goal:** Input Standardization.
*   **Action:** Turns messy meeting notes or brain dumps into canonical "Architectural Decision Records" (ADRs).
*   **Agentic:** It uses an LLM to extract "Context", "Decision", and "Consequences" and generate a graph-friendly ID.
```bash
# Import unstructured notes
kontext format meeting_notes.txt
# -> Creates .kontext/decisions/adr-004-feature-name.md
```

### 3. The Broadcaster (`kontext sync`)
*   **Goal:** Passive Injection.
*   **Action:** Compiles the current truth into a high-density Markdown block and **injects** it into your AI's native memory files.
*   **Supported:** `.cursorrules`, `.windsurfrules`, `CLAUDE.md`.
```bash
# Syncs only relevant context (e.g. for frontend agents)
kontext sync --focus frontend
```

### 4. The Pruner (`kontext distill`)
*   **Goal:** Context Compression.
*   **Action:** Identifies duplicate or overlapping decisions and merges them into a **Canonical ADR**.
*   **Tombstone Strategy:** Instead of deleting old files (which breaks links), it replaces them with lightweight **Tombstones** (Summaries + Pointers), reducing token usage by 95% while preserving history.
```bash
# Interactive mode (safe)
kontext distill
```

### 5. The Guard (`kontext check`)
*   **Goal:** Active Enforcement.
*   **Action:** Semantically analyzes staged code (`git diff`) against your constraints.
*   **Agentic:** It understands *intent*, not just syntax. (e.g., "No console.log in production" defined in an ADR will block the commit).
```bash
# Run in pre-commit hook
kontext check
```

---

## ⚡ Integration

### Pre-Commit Hook (Recommended)
To ensure your context is always chemically pure and your architecture is enforced, add this to your `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 1. Block Drift
npx kontext check || exit 1

# 2. Offer Suggestions (Optional, interactive)
# npx kontext suggest --yes
```

---

## 🚀 Getting Started

### Installation
```bash
npm install
npm run build
npm link
```

### Configuration
Kontext uses Gemini 3 Flash to reason about your architecture.
```bash
export GEMINI_API_KEY=your_key_here
```



---

## 🔮 Vision
We are building the standard for **Machine-Readable Architectural Intent**.
In the future, every autonomous agent will start its day by querying `kontext` to understand the laws of the universe it operates in.

## 🛠️ Development
See [CONTRIBUTING.md](./CONTRIBUTING.md).

### Directory Structure
*   `.kontext/decisions/`: The immutable log of truth (ADRs).
*   `.kontext/constraints.md`: Hard rules (tech stack, patterns).
*   `src/`: The TypeScript implementation of the Agent Squad.
