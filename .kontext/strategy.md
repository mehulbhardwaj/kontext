# Strategy & PMF: Tapping the "Context Nerve"

You are building **Kontext State** to solve **"Context Entropy"** in AI-assisted development.
The thesis: *Codebases rot because the "Why" is lost. AI accelerates this rot by generating code without understanding the "Why".*

To find PMF fast and become an industry standard (like `.gitignore` or `prettier`), you must solve the **Friction vs. Value** equation.

## 1. The Core Problem: "Documentation Rot" is now Fatal
**Old World:** Stale docs were annoying. Humans could ask other humans.
**New World:** Stale docs are fatal. Agents *trust* them and build entirely wrong features.
**The Nerve:** Developers are terrified that AI is generating legacy code at 100x speed. They feel a loss of control. Kontext restores that control.

## 2. Friction is the Enemy
If `kontext remember` feels like "writing docs," it will fail.
**Goal:** It must feel like *saving a checkpoint* or *git commit*.

### PMF Accelerators (Features to Build)

#### A. The "Zero-Effort" Capture (The Hook)
*Current:* `kontext remember "foo"` (High friction)
*Better:* **Pre-commit Hook / PR Integration.**
- When I run `git commit`, `kontext` asks: "Did you make an architectural decision?"
- If yes, it pops a quick CLI prompt (or blocks merge if `package.json` changed without an ADR).
- **Implementation:** `.kontext/actions/pre-commit` script checking for drift.

#### B. The "Active Guardrail" (The Value)
*Current:* I have to ask the AI to validte.
*Better:* **Linter Integration (ESLint for Architecture).**
- If `constraints.md` says "No Lodash", and I import `lodash`, `kontext` should scream in my IDE.
- **"Architecture as Code"**: Make the `.md` files executable by a linter.

#### C. The "Citation" Loop (The Reward)
*Current:* AI answers "Postgres".
*Better:* **Enforced Citations.**
- The AI Agent must say: "I chose Postgres **because of ADR-001 (Accepted)**."
- This reinforces to the human that *writing the ADR was worth it*.

## 3. Path to Standard (Adoption Strategy)

### Phase 1: The "Local Savior" (Indie Devs)
**Target:** Solo founders using Cursor/lovable.
**Pitch:** "Stop your AI from forgetting your stack."
**Feature:** `kontext init` -> Auto-generates `.cursorrules` (We just did this!).
**Metric:** "Does the AI stop trying to install libraries I banned?"

### Phase 2: The "Team Brain" (Small Teams)
**Target:** 3-5 person teams.
**Pitch:** "Onboard a new Junior (or AI Agent) in 5 minutes."
**Feature:** `kontext graph`. Visualizing the decision tree.
**Metric:** "Did the new hire ask fewer questions?"

### Phase 3: The "Repo Standard" (Infrastructure)
**Target:** Open Source Repos / Enterprise.
**Pitch:** "This repo comes with its own brain."
**Feature:** GitHub Badge `[State: Valid]`.
**Metric:** `kontext.json` becomes as common as `package.json`.

## 4. Immediate "Next Moves" for Engineering
To hit that "Nerve" hard:

1.  **Commit-Time Actions (Active):**
    - Implement `.kontext/actions/pre-commit` to detect drift (e.g., `package.json` changed but no ADR).
    - Reduce friction by prompting *at the moment of action*.
2.  **Context Bridge 2.0 (Auto-Sync):**
    - Don't just append to `.cursorrules` once.
    - Make `kontext` *own* a section of `.cursorrules`. When `architecture.md` changes, `kontext sync` updates the rules automatically.
3.  **"Suggestion" Mode:**
    - Use LLM to *read* the git diff and *suggest* the ADR text.
    - `kontext suggest` -> "It looks like you added Redis. Want to create an ADR for 'Adding Caching Layer'?" -> User types "Y". **(Magic Moment)**.

## 5. Risks / Known Problems in this Area
- **"Another Tool" Fatigue:** Developers hate installing new CLI tools.
    - *Mitigation:* Make it work with `npx` (zero install) or extend existing tools (VS Code Extension).
- **Schema Rigidity:** If the schema is too strict, people bail.
    - *Mitigation:* Keep `zod.passthrough()` forever. Let people add `author: "Dave"` if they want.
- **Sync Drift:** Code changes, but `kontext` doesn't.
    - *Mitigation:* **CI Failures**. If `package.json` adds a dependency but `architecture.md` didn't change, warn the user.

## Summary
You are not building a "Documentation Tool".
You are building **"RAM for the AI"**.
Position it that way, and you will win.
