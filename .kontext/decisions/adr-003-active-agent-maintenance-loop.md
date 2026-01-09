---
id: adr-003
status: superseded
superseded_by: adr-005
date: 2026-01-10
tags: [agent, automation, workflow, gardening]
---
# [Superseded] Active Agent Maintenance Loop (Scribe & Gardener)

> ⚠️ **This ADR is superseded by [ADR-005](./adr-005-context-compilation.md).**

**Summary:**
Originally proposed a "Minimal Pointer" strategy for `.cursorrules`. This has been replaced by the "Context Compilation" strategy in ADR-005.

**Original Content (Superseded):**
Manual invocation of documentation tools is high-friction and prone to drift. Furthermore, context entropy is caused not just by missing information, but by 'noise' and duplicate data within context windows.