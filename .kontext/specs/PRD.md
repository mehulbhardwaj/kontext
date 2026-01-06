# Kontext State — Product Requirements Document (Final Draft)

## 0. Executive Summary
Software is increasingly written by humans + AI agents working together.
But both are operating blind because:
- project knowledge is scattered
- architecture lives in tribal memory
- “docs” drift and die
- AI tools hallucinate context
- decisions get lost
- onboarding becomes painful

There is no canonical, structured, version-controlled truth layer inside the codebase.
**Kontext State** introduces that layer.

It is:
- repo-native
- open standard
- written in Markdown
- structured via YAML front-matter
- validated automatically
- read by humans + AI
- reviewed alongside code
- intentionally boring, stable, and trustworthy

Kontext State creates the “project brain” — grounded in Git — that AI agents and humans can share.
This is a primitive, not a feature.

## 1. Mission & Philosophy
### Mission
Create a canonical, versioned, structured representation of project truth inside the repository — so humans and agents can collaborate safely.

### Core beliefs
1. **Truth should live with the code**
2. **Truth must be inspectable, diffable, reviewable**
3. **AI should read truth — not invent it**
4. **Automation should assist, not override**
5. **Standards emerge by being open, simple, and boring**
6. **If it feels like “documentation work,” it will fail**
7. **If it becomes part of CI, it becomes infrastructure**

## 2. Target Users
### Primary
- Staff / Senior Engineers, Platform Engineers
- maintain large systems
- worry about consistency and architecture drift
- use AI tools but don’t trust them fully

### Secondary
- Small AI-heavy development teams (2–10 engineers)
- high velocity
- decision churn
- onboarding complexity
- lots of Cursor / Claude usage

### Later
- CTOs
- Engineering Managers
- Companies rolling out internal coding agents
- Multi-service platforms

## 3. Core Problems
Developers repeatedly face:
- ❌ stale READMEs
- ❌ tribal decisions disappearing
- ❌ AI tools hallucinating rules
- ❌ confusion about patterns & constraints
- ❌ PRs focused on syntax instead of intent
- ❌ lost architectural history
- ❌ fragile onboarding
- ❌ lack of shared “ground truth”

AI coding agents amplify this:
Agents build confidently… on wrong assumptions.
The cost compounds across time, people, and repositories.

## 4. The Solution — The “Primitive”
Introduce a minimal, structured “state layer” inside the repo:

```
/kontext/
  index.md
  architecture.md
  constraints.md
  setup.md
  decisions/
    adr-001.md
```

Each file has two layers:
1. **Structured front-matter (machine truth)**
   YAML, predictable, schema-validated.
2. **Body text (human narrative)**
   Readable, explainable.

**Example:**
```markdown
---
type: decision
id: adr-002
status: proposed
topic: database
---
# Switching to Postgres

We standardized on Postgres for reliability and tooling alignment.
```

Agents read the front-matter.
Humans read everything.
State becomes a first-class citizen.

## 5. Open Source Strategy
Kontext State must be open source.
Because this is:
- a standard
- an infrastructure layer
- something developers must trust deeply

Open-source unlocks:
- ✔ transparency
- ✔ contribution
- ✔ safety
- ✔ community momentum
- ✔ ecosystem integrations
- ✔ long-term credibility

**Business model later:**
- dashboards
- analytics
- enterprise controls
- hosted visibility
- governance tools
- integrations
- state orchestration

Primitive = open. Platform = monetized.

## 6. Technical Decisions
### Language
👉 **TypeScript (Node.js)**
Reasons:
- easy install (`npm i -g`)
- familiar to dev tools ecosystem
- fast iteration
- portable
- plays nicely with CI and GitHub Actions

### Distribution
👉 **NPM CLI tool**
- `kontext init`
- `kontext validate`
- `kontext remember`

### Document Format
👉 **Markdown + YAML front-matter**
Why?
- AI loves markdown
- human-readable
- diffable in Git
- schema-enforceable
- boring and durable

### Repository Principle
👉 **Truth always lives inside each repo**
No centralized “truth server.”

### Extensibility
Front-matter schema must:
- ✔ be versionable
- ✔ allow optional fields
- ✔ support custom extensions

## 7. The Primitive Structure (Schema v0)

### index.md
Controls read/load priority.
```yaml
---
type: index
priority:
  - ./architecture.md
  - ./constraints.md
  - ./decisions
---
```

### architecture.md
```yaml
---
type: architecture
services:
  - name: api
    depends_on: [db]
status: inferred | canonical | draft
---
```

### constraints.md
```yaml
---
type: constraints
banned_patterns: []
required_patterns: []
status: draft | canonical
---
```

### decisions / ADR
```yaml
---
type: decision
id: adr-001
status: proposed | accepted | deprecated
topic: ""
date: 2026-01-03
---
```

## 8. Phase-Based Product Goals

### 🚀 Phase 1 — “Prove the Primitive Exists”
**Goal**
Show that:
AI agents now have ground truth — and they actually use it.

**Demo outcome we want:**
1. Create new repo
2. Run:
   `kontext init`
   `kontext remember "Switching to Postgres"`
3. Open Cursor or Claude Code
   Ask:
   “What database does this project use?”
   Expected response:
   “Postgres — per /kontext/decisions/adr-00X.md”

**What we want users to say**
- 💬 “Oh — this is actually useful.”
- 💬 “Feels like my project finally has a memory.”
- 💬 “Claude stopped guessing.”
- 💬 “This is easier than docs.”

**What we do NOT want to see**
- 🚫 “This feels like more work.”
- 🚫 “I don’t know when to use it.”
- 🚫 “I’ll ignore it.”
- 🚫 “It broke my repo.”

**Requirements (Phase 1)**
- ✔ `kontext init` scaffolds inferred state AND optionally appends to `.cursorrules` / `.windsurfrules`
- ✔ `kontext remember "<text>"` creates ADR and logs to `index.md`
- ✔ Cursor / Claude integration guidance (Context Bridge)
- ✔ Clean UX
- ✔ No CI yet
- ✔ No blocking flows

**Success metric**
- → Demo works repeatably
- → 3–5 users voluntarily keep using it

### 🚀 Phase 2 — “Become Infrastructure”
**Goal:**
Move from local utility → CI pipeline primitive.

**Expected flow (real demo)**
*Setup*
Junior dev opens PR changing core API.

*Action*
PR includes:
- code change
- updated ADR generated with Kontext help

*Guard Layer*
GitHub Action runs:
`kontext validate`
Result:
✅ Kontext State Valid

*Review Layer*
Reviewer opens Files Changed:
- Left: old architecture / decision
- Right: new architecture / decision

Reviewer comment example:
“Decision makes sense. Please update status to accepted.”

**Magic moment:**
They are reviewing architecture, not just code.

**What we want users to say**
- 💬 “Finally — code review includes intent.”
- 💬 “This caught something important.”
- 💬 “Feels like infrastructure.”
- 💬 “We should keep using this.”

**What we do NOT want:**
- 🚫 Blocking nags about prose
- 🚫 Over-validation
- 🚫 Noisy ADR spam
- 🚫 “Feels like bureaucracy”

**Requirements (Phase 2)**
- ✔ GitHub Action for `kontext validate`
- ✔ Schema validation only
- ✔ CI errors only for structural issues
- ✔ State diffs appear cleanly
- ✔ No heavy governance
- ✔ Suggested ADRs — never auto-written

**Success metric**
- → Teams review state in PRs
- → PR comments reference Kontext files
- → Removing it would feel like losing guardrails

## 9. Future (Post-MVP, Not Required Now)
Later, carefully:
- AI-generated suggestions (human-approved)
- multi-repo mapping
- auto-derived structural facts
- dashboards
- org governance
- policy layers
- onboarding bots
- architecture visualization

But only once the primitive wins.

## 10. What Success Ultimately Looks Like
People say:
- “Add it to the repo — otherwise the AI messes things up.”
- “PR isn't complete unless state is updated.”
- “Where’s the ADR for this?”

Agents begin with:
- “Let me check Kontext first.”

CI includes it by default.
Standards emerge around it.
This becomes normal.

## 🎯 Final Statement of Intent
Kontext State is the missing “project brain” in the age of AI-assisted development.
It is structured, governed, diffable truth — versioned in Git — shared between humans and agents.

Start small. Make it useful. Become infrastructure.
Then build the ecosystem around it.
