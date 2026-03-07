---
library: kit
doc_id: KIT-2-GOV
title: Package Dependency Rules
version: 1.0.0
status: draft
---

# KIT-2-GOV — Package Dependency Rules

## Purpose

Define the rules governing how kit units declare, resolve, and constrain dependencies on other kit units and external packages.

## Dependency Declaration

- Every kit unit must declare its dependencies in the kit manifest under a `dependencies` array.
- Each dependency entry must include `unit_id`, `version_constraint`, and `resolution` (pinned or floating).

## Version Constraints

- Pinned dependencies use exact semver (e.g., `1.2.3`).
- Floating dependencies use semver ranges (e.g., `^1.2.0`, `~1.2.0`).
- Enterprise-ready units must use pinned dependencies only.

## Circular Dependency Prohibition

- Circular dependencies between kit units are forbidden.
- The dependency graph must form a directed acyclic graph (DAG).

## External Package Rules

- External packages referenced by a kit unit must be declared in the manifest metadata.
- External packages must include a license field and a hash for integrity verification.

## Resolution Order

1. Local kit units are resolved first.
2. External packages are resolved second.
3. Conflicts are resolved by the highest-priority consumer contract (see KIT-4-GOV).
