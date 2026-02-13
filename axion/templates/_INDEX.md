# AXION Templates Index

This file indexes all templates available in the AXION documentation system.
Templates are used by pipeline stages (seed, draft, generate, content-fill) to produce
per-domain documentation files within Agent Kit workspaces.

## Core Templates

Core templates produce documents that exist once per domain module. They are stamped
during the seed step and filled during draft/content-fill steps.

| Template | Document Type | Fill Priority | Purpose |
|----------|--------------|--------------|---------|
| `core/DDES.template.md` | Domain Design & Entity Specification | 4 of 13 | Entity ownership, fields, relationships, domain boundaries |
| `core/UX_Foundations.template.md` | UX Foundations | 5 of 13 | Experience laws, cognitive load, interaction patterns, user journeys |
| `core/UI_Constraints.template.md` | UI Constraints | 6 of 13 | Structural constraints, layout rules, visual design boundaries |
| `core/DIM.template.md` | Domain Interface Map | 7 of 13 | Exposed/consumed interfaces, event contracts, data flow |
| `core/SCREENMAP.template.md` | Screen Map | 8 of 13 | Screen inventory, navigation flows, component mapping |
| `core/TESTPLAN.template.md` | Test Plan | 9 of 13 | Test strategy, acceptance scenarios, edge cases, coverage |
| `core/COMPONENT_LIBRARY.template.md` | Component Library | 10 of 13 | UI component catalog, variants, props, accessibility |
| `core/COPY_GUIDE.template.md` | Copy Guide | 11 of 13 | User-facing text, error messages, empty states, tone |
| `core/BELS.template.md` | Business Entity Logic Specification | 12 of 13 | Policy rules, state machines, validation, authorization |

## System-Level Templates

System-level templates produce kit-wide documents that are not per-domain.

| Template | Document Type | Purpose |
|----------|--------------|---------|
| `core/ERC.template.md` | Execution Readiness Contract | Locked snapshot of all decisions — boundaries, acceptance criteria, forbidden changes |
| `core/ALRP.template.md` | Agent Lifecycle & Rules Protocol | Phase behavior rules, input authority hierarchy, assumption prohibition |
| `core/SROL.template.md` | Scope Refinement & Optimization Ledger | Optimization modes, diagnostic lenses, refinement planning |
| `core/TIES.template.md` | Technical & Implementation Engineering Standards | 12 engineering disciplines for build quality |

## Agent Prompt Template

| Template | Purpose |
|----------|---------|
| `AGENT_PROMPT.template.md` | Master instruction set for the coding agent — assembled at package time |

## Utility Documents

| Document | Purpose |
|----------|---------|
| `core/CHANGE_CONTRACT_TEMPLATE.md` | Process template for documenting system changes (not a pipeline template) |

## Fill Order

Templates are filled in cascade order. Higher-priority documents feed context into lower-priority ones:

```
RPBS (1) → REBS (2) → README (3) → DDES (4) → UX_Foundations (5) → UI_Constraints (6)
→ DIM (7) → SCREENMAP (8) → TESTPLAN (9) → COMPONENT_LIBRARY (10) → COPY_GUIDE (11)
→ BELS (12) → ERC (13, auto-generated at lock time)
```

ALRP, SROL, and TIES are system-level documents filled independently of the per-domain cascade.

## Template Conventions

All pipeline templates must include:
- `<!-- AXION:TEMPLATE_CONTRACT:v1 -->` — version marker
- `<!-- AXION:CORE_DOC:<TYPE> -->` — document type anchor
- `<!-- AXION:AGENT_GUIDANCE ... -->` — agent instructions block with PURPOSE, SOURCES, RULES
- `CASCADE POSITION` — fill priority and upstream/downstream dependencies
- `## Open Questions` — section for unresolved items
