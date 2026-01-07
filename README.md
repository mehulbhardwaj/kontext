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
Kontext uses Gemini for its reasoning engine. You must provide an API key:
```bash
export GEMINI_API_KEY=your_key_here
```

### 3. Usage
#### Core Commands (The Humans)
These commands are stable and ready for daily use.

- **Initialize**: Scaffold the `.kontext` directory.
  ```bash
  kontext init
  ```
- **Remember**: Manually record a decision.
  ```bash
  # Creates .kontext/decisions/adr-00X-use-redis.md
  kontext remember "Use Redis for Caching"
  ```
- **Validate**: Check the integrity of your decision log (useful for CI).
  ```bash
  # Verifies schema compliance and ID matching
  kontext validate
  ```

#### The Agent Squad (The Bots)
The core of Kontext is the **Agentic Loop**. These agents typically run automatically via `pre-commit` hooks, but you can run them manually:

- **Scribe** (`kontext suggest`): Analyzes your staged code diff and drafts an ADR.
  ```bash
  # Requires GEMINI_API_KEY
  kontext suggest
  ```
- **Structurer** (`kontext format`): Enforces a strict schema on all docs.
  ```bash
  kontext format
  ```
- **Pruner** (`kontext distill`): Identifies and merges duplicate contexts (interactive).
  ```bash
  kontext distill
  ```
- **Broadcaster** (`kontext sync`): Injects minimal pointers into `.cursorrules` / `.windsurfrules`.
  ```bash
  kontext sync
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
