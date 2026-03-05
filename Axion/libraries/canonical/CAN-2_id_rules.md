---
library: canonical
id: CAN-2
schema_version: 1.0.0
status: draft
---

# CAN-2 — ID Rules (Stable IDs + Dedupe)

## Purpose
Ensure every entity and relationship has a stable, reproducible ID so:
- planning/templates can reference entities reliably
- reruns/resumes preserve identity
- diffs are meaningful (not re-ID noise)

## ID types
- entity_id: E-XXXXXX…
- rel_id: R-XXXXXX…
- spec_id: CAN-XXXXXX…

## Requirements
- IDs are stable across reruns given the same inputs.
- IDs are generated deterministically from canonical keys, not random.
- Dedupe rules prevent duplicate entities when the same concept appears multiple times in
intake.

## Canonical key (entity identity)
Each entity must have a canonical key, for example:
- project: `project:<project_slug>`
- domain: `domain:<domain_slug>`
- endpoint: `endpoint:<method>:<path>`
- data_entity: `data_entity:<name_slug>`
- component: `component:<name_slug>`
- integration: `integration:<provider_slug>:<purpose_slug>`
