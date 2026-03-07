---
library: telemetry
doc_id: TEL-1-GOV
title: Signal Registry Rules
version: 1.0.0
status: draft
---

# TEL-1-GOV — Signal Registry Rules

## Purpose

Define the governance rules for registering, naming, and managing telemetry signals within the Axion telemetry registry. All signals must be registered before emission.

## Registration Requirements

- Every telemetry signal must have a unique `unit_id` in the telemetry registry.
- Signal names must follow the pattern `<domain>.<action>` (e.g., `run.started`, `gate.evaluated`).
- Each signal must declare a `signal_type` from the allowed set: `event`, `metric`, `trace`, `decision`.
- Each signal must declare at least one `producer_library` and one or more `consumer_libraries`.

## Naming Conventions

- Use lowercase dotted notation for signal names.
- Domain segments must map to an existing Axion library or subsystem.
- Action segments must use past tense for events (`started`, `ended`, `evaluated`) and present tense for metrics (`count`, `duration`, `rate`).

## Lifecycle States

- `draft` — signal is proposed but not yet emitted in production paths.
- `active` — signal is emitted and consumed in production.
- `deprecated` — signal is scheduled for removal; consumers must migrate.
- `retired` — signal is no longer emitted; retained in registry for audit.

## Validation Rules

- Duplicate `unit_id` values are rejected at registration time.
- Signals without a declared producer are invalid.
- Signals with zero consumers trigger a governance warning.
- Schema references must resolve to a valid schema in `telemetry/schemas/`.
