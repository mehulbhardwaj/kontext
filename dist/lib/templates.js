"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDecisionTemplate = exports.createSetupTemplate = exports.createConstraintsTemplate = exports.createArchitectureTemplate = exports.createIndexTemplate = void 0;
const createIndexTemplate = (date, projectName = 'My Project') => `---
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
exports.createIndexTemplate = createIndexTemplate;
const createArchitectureTemplate = () => `---
type: architecture
status: draft
---
# Architecture

Describe the high-level architecture of your system here.
`;
exports.createArchitectureTemplate = createArchitectureTemplate;
const createConstraintsTemplate = () => `---
type: constraints
status: draft
---
# Constraints

List the hard constraints and patterns (e.g., tech stack, forbidden libraries).
`;
exports.createConstraintsTemplate = createConstraintsTemplate;
const createSetupTemplate = () => `---
type: setup
status: draft
---
# Setup

Instructions on how to run and build the project.
`;
exports.createSetupTemplate = createSetupTemplate;
const createDecisionTemplate = (id, date, title, status = 'proposed') => `---
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
exports.createDecisionTemplate = createDecisionTemplate;
