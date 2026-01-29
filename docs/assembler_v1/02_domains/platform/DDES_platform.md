# Domain Design & Entity Specification (DDES) — Platform

## Overview
**Domain Slug:** platform
**Domain Prefix:** platform
**Domain Type:** business

## Purpose
The Platform domain defines the core entities and business rules for Roshi Studio. It owns the canonical definitions for Run, Project, User, and other foundational objects.

## Entities

| Entity | Description | Owner |
|--------|-------------|-------|
| User | A user of the system (optional for MVP - no auth required) | platform |
| Project | A collection of runs (optional for MVP) | platform |
| Run | A single pipeline execution with idea, status, and artifacts | platform |
| DomainPack | Generated documentation for a single domain | platform |
| Artifact | A file created or modified during pipeline execution | platform |
| VerifyResult | Result of verification checks for a domain | platform |
| ERC | Execution Readiness Contract - gates for locking | platform |
| Bundle | The final zip package for agent handoff | platform |
| TemplatePack | Versioned set of documentation templates | platform |
| SourceRef | Citation to a known input/source document | platform |

## Key Responsibilities
- Define entity schemas and validation rules
- Enforce business rules (no invention, no overwrite)
- Maintain entity state machines
- Provide canonical definitions for all domains

## Domain Boundaries
- **In Scope:** Entity definitions, validation rules, state machines, business rules
- **Out of Scope:** API routing (api domain), UI (web domain), file I/O (infra domain)

## Dependencies
- None - platform is the foundation domain

## Open Questions
- None - core entities are defined in PROJECT_OVERVIEW
