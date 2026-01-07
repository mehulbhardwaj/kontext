# Kontext
> **"Project Memory Primitive"**

Kontext is a CLI tool that fights **Context Entropy** in AI-assisted development. It ensures your AI (Cursor, Windsurf, Copilot) always understands the *current* architectural reality of your project by maintaining a structured "Project Brain" inside your repository.

---

## 🚀 Working Now

### 1. Installation
```bash
# Clone and link locally
npm install
npm run build
npm link
```

### 2. Configuration
Kontext uses Gemini 2.0 (specifically `gemini-2.0-flash-exp`) for its reasoning engine. You must provide an API key:
```bash
export GEMINI_API_KEY=your_key_here
```

### 3. Zero-Config Start
```bash
kontext init
```
This scaffolds the `.kontext/` directory and optionally appends instructions to your IDE rule files (`.cursorrules`, `.windsurfrules`).

### 3. The Agentic Loop
The core of Kontext is the **Agentic Loop**, which orchestrates multiple agents to maintain your context window:
- **Scribe** (`kontext suggest`): Active on `git commit`. Analyzes diffs and drafts **Architectural Decision Records (ADRs)**.
- **Structurer** (`kontext format`): Enforces a strict schema (defined in `.kontext/templates/`) on all your docs.
- **Pruner** (`kontext distill`): Identifies and merges duplicate or obsolete contexts.
- **Broadcaster** (`kontext sync`): Injects minimal pointers into your IDE rules so your AI always knows where to find the "Truth".

### 4. Example Use
Just code as usual. When you commit, the Scribe wakes up:
```bash
git add .
git commit -m "feat: switch to redis for caching"
# 🤖 [Kontext Agent] Drafting ADR-001: Introduce Redis...
```

---

## 🔮 Vision (Future)

We are building Kontext to be the industry standard for AI-Repo collaboration.
- **AI Drafting**: Deep integration with LLMs to auto-generate entire technical specs.
- **Cross-Repo Mapping**: A "Kontext Hub" to share constraints across microservices.
- **Dashboard UX**: A visual graph interface (`kontext graph`) to browse your project's architectural history.
- **Enterprise Guard**: CI/CD integration to prevent PRs that violate architectural constraints.

---

## 🛠️ Development
Check out [CONTRIBUTING.md](./CONTRIBUTING.md) to get involved.

### Directory Structure
- `.kontext/`:
  - `decisions/`: Immutable log of choices (ADRs).
  - `templates/`: Custom formats for your documentation.
  - `index.md`: The entry point for the Project Memory.
- `src/`: Core implementation of the Agent Squad.
