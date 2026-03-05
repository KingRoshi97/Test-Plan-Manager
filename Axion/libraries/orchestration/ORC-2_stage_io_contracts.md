---
library: orchestration
id: ORC-2
schema_version: 1.0.0
status: draft
---

# ORC-2 — Stage IO Contracts

## Purpose
Make every stage machine-checkable by defining:
- what it consumes (inputs)
- what it must produce (outputs/artifacts)
- what evidence it must report
- what "required for next stage" means

## Definitions
- **IO contract**: a named contract that defines a stage input or output artifact format.
- **Consumes**: references to IO contract IDs required to execute the stage.
- **Produces**: references to artifacts/contract IDs the stage must emit on success.

## Principles
- Contracts are referenced by ID (not by path).
- Concrete file paths are resolved via run manifest and artifact registry.
- A stage can only proceed if its required inputs exist and validate.
