---
library: canonical
id: CAN-2b
schema_version: 1.0.0
status: draft
---

# CAN-2b — Dedupe Rules

## Purpose
Prevent accidental duplicates when multiple intake fields map to the same entity.

## Dedupe strategy
- Compute canonical_key for each candidate entity.
- If canonical_key already exists:
  - merge attributes (non-conflicting)
  - if conflicting values:
    - prefer explicitly provided intake values over derived defaults
    - record conflict into UNKNOWN_ASSUMPTIONS as an "assumption needed" item

## Merge rules
- Scalars:
  - if same → keep
  - if different → conflict
- Lists:
  - union + stable sort
- Objects:
  - shallow merge; conflicts recorded

## No silent overwrites
If conflict occurs, it must be recorded as an unknown/assumption item.
