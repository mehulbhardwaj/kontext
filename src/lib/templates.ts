export const createIndexTemplate = (date: string, projectName: string = 'My Project') => `---
type: index
last_updated: ${date}
priority_files:
  - ./architecture.md
  - ./constraints.md
  - ./decisions/*.md
---
# Context Map: ${projectName}

This folder contains the authoritative state of the project.
`;

export const createArchitectureTemplate = () => `---
type: architecture
status: draft
---
# Architecture

Describe the high-level architecture of your system here.
`;

export const createConstraintsTemplate = () => `---
type: constraints
status: draft
---
# Constraints

List the hard constraints and patterns (e.g., tech stack, forbidden libraries).
`;

export const createSetupTemplate = () => `---
type: setup
status: draft
---
# Setup

Instructions on how to run and build the project.
`;

export const createDecisionTemplate = (id: string, date: string, title: string, status: string = 'proposed') => `---
type: decision
id: ${id}
status: ${status}
date: ${date}
tags: []
---
# ${title}

## Context
Why are we making this change?

## Decision
What is the change?

## Consequences
What becomes easier or harder?
`;
