---
library: kit
doc_id: KIT-4-GOV
title: Backward Compatibility and Consumer Contracts
version: 1.0.0
status: draft
---

# KIT-4-GOV — Backward Compatibility and Consumer Contracts

## Purpose

Define the rules that protect consumers of kit units from breaking changes and establish the contract obligations between kit producers and consumers.

## Backward Compatibility Rules

### Semver Enforcement

- Kit units follow strict semantic versioning.
- Major version bumps signal breaking changes.
- Minor and patch versions must not break existing consumer integrations.

### Breaking Change Detection

- Any removal or rename of a manifest-declared file is a breaking change.
- Any removal or type change of a required schema property is a breaking change.
- Any change to an entrypoint path is a breaking change.

### Grace Period

- When a breaking change is introduced, the previous major version must remain available for at least one full release cycle.
- Deprecation notices must appear in the kit manifest at least one minor version before removal.

## Consumer Contracts

### Contract Declaration

- Consumers declare their integration surface in a `consumer_contract` object.
- The contract lists the files, entrypoints, and schema properties the consumer depends on.

### Contract Validation

- On every kit build, consumer contracts are validated against the current manifest.
- Any contract violation blocks promotion beyond `dev`.

### Priority Resolution

- When multiple consumers have conflicting requirements, the consumer with the higher release class takes priority.
- Ties are resolved by the earliest contract registration timestamp.
