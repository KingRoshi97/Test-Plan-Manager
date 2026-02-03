# Registry Folder

This folder contains **guardrails** — system-wide standards that prevent agent drift during documentation generation. These files ensure consistency across all modules.

## The Guardrails Concept

While `product/` contains the "what" (RPBS/REBS), `registry/` contains the "how consistently":

```
product/    → WHAT we're building (source of truth)
registry/   → HOW we stay consistent (guardrails)
templates/  → STRUCTURE of documents (blueprints)
```

The pipeline **reads from** these files during generation. The AI agent must adhere to these standards or get flagged during `review`/`verify`.

## Core Files

| File | Purpose |
|------|---------|
| `glossary.md` | Project-specific terms and acronyms. Ensures consistent language across all documentation. |
| `reason-codes.md` | Standardized codes for decisions, errors, and events. Example: `AUTH_001: Invalid token`. |
| `action-vocabulary.md` | Standardized verbs used across the system (create, validate, emit, etc.). Keeps naming consistent. |
| `domain-map.md` | Maps each module to its responsibilities and boundaries. Defines what belongs where. |
| `domain-build-order.md` | Module dependencies — which modules must complete before others. |

## Reference Files

| File | Purpose |
|------|---------|
| `module-index.md` | Quick reference of all 19 modules with descriptions and prefixes. |
| `run-sequences.md` | Multi-step workflows and their execution order. |
| `fullstack-coverage-map.md` | Tracks frontend ↔ backend connections. Ensures nothing is orphaned. |

## Stage Markers (Auto-Generated)

```
registry/stage_markers/
├── generate/           # Tracks which modules completed generate stage
│   └── architecture.json
├── seed/
├── draft/
├── review/
└── verify/
```

Each marker contains:
```json
{
  "status": "DONE",
  "stage": "generate",
  "module": "architecture",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**Do not edit these manually.** They are created by pipeline scripts.

## How Guardrails Work

1. You populate registry files with your project's standards
2. During `draft`, the AI agent references them when filling templates
3. During `review`, generated docs are validated against these standards
4. During `verify`, cross-references are checked

## Enforcement Examples

**Glossary enforcement:**
- If a term appears in `glossary.md`, all docs must use the defined meaning
- Undefined terms flagged during review

**Reason code enforcement:**
- All error handlers must use codes from `reason-codes.md`
- Unknown codes flagged during review

**Action vocabulary enforcement:**
- API routes and functions must use verbs from `action-vocabulary.md`
- Non-standard verbs flagged during review

## Update Protocol

When standards change:

1. Update the relevant registry file
2. Re-run `review` and `verify` stages for affected modules
3. Fix any flagged inconsistencies
4. Re-lock affected modules
