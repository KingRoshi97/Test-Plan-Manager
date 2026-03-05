---
library: intake
id: INT-2
schema_version: 1.0.0
status: draft
---

# INT-2 — Enum Registry Model

## Purpose
Centralize allowed values for intake enum fields so:
- the wizard UI renders consistent options
- normalization can resolve aliases deterministically
- validation can reject unknown values consistently

## Core entities
- **Enum registry**: collection of enums by enum_id
- **Enum**: allowed values + labels + aliases

## Required behaviors
- enum values are canonical slugs (stable)
- aliases map to canonical values
- option order is stable and deterministic
