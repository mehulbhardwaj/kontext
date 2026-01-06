# Architecture Map: Kontext State

## Core Logic
Kontext is a CLI tool designed to maintain a 'Context Nerve' within a repository. It operates on the principle that architectural intent should be versioned alongside code.

## Components

### 1. The State Store (`.kontext/`)
- **index.md**: The entry point and summary of project truth.
- **decisions/**: A directory of ADRs (Architectural Decision Records) following the `adr-XXX-slug.md` format.

### 2. The Agentic Loop
- **Git Hooks**: A `pre-commit` hook that acts as a trigger for context validation and suggestion.
- **Suggest Engine**: Uses LLMs (currently Google Gemini) to identify 'drift' between staged code and documented architecture.

### 3. CLI Commands
- `init`: Bootstraps the `.kontext` structure.
- `remember`: Manually records a decision.
- `suggest`: The AI-driven analysis tool.
- `validate`: Ensures ADR integrity and schema compliance.

## Infrastructure
- **Runtime**: Node.js >= 18.0.0
- **Language**: TypeScript
- **Cache**: Redis (introduced in ADR-001) for state persistence across distributed environments.