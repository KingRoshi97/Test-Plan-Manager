# Registry Folder

This folder contains **system-wide reference documents** that establish shared vocabulary, standards, and cross-cutting concerns. These files ensure consistency across all modules.

The pipeline **reads from** these files but **never writes to** them (except stage markers). You maintain them.

## Files

| File | Purpose |
|------|---------|
| `domain-map.md` | Maps each module to its responsibilities and boundaries. Defines what belongs where. |
| `domain-build-order.md` | Specifies module dependencies — which modules must be built before others. |
| `module-index.md` | Quick reference index of all 19 modules with descriptions and prefixes. |
| `glossary.md` | Project-specific terms and acronyms. Ensures consistent language across all documentation. |
| `action-vocabulary.md` | Standardized verbs used across the system (create, validate, emit, etc.). Keeps action naming consistent. |
| `reason-codes.md` | Standardized codes for errors, warnings, and events. Example: `AUTH_001: Invalid token`. Used in error handling and logging. |
| `run-sequences.md` | Documents multi-step workflows and their execution order. Defines how operations chain together. |
| `fullstack-coverage-map.md` | Tracks which frontend features connect to which backend endpoints. Ensures nothing is orphaned. |

## Subfolders

| Folder | Purpose |
|--------|---------|
| `stage_markers/` | **Auto-generated** by pipeline scripts. Contains JSON files tracking which modules have completed which stages (`generate`, `seed`, `draft`, `review`, `verify`). Do not edit manually. |

## How It Works

1. You populate these documents with your project's standards
2. The `draft` stage references them when filling module templates
3. The `review` stage validates that generated docs use correct vocabulary and reason codes
4. The `verify` stage checks cross-references against these registries
