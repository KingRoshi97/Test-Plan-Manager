---
id: STD-4
library: standards
schema_version: 1.0.0
status: draft
---

# STD-4 — Resolved Standards Snapshot Model

## Purpose
A standards snapshot is the deterministic output of S3. It is the frozen set of standards packs
and rules that downstream stages must follow.

## What the snapshot must contain
- snapshot_id (stable)
- run_id
- resolver_version (version of the resolver logic)
- resolved_packs[] (ordered list: pack_id + version + path + hash optional)
- resolved_rules[] (ordered list: expanded rules with pack source)
- conflicts[] (if any)
- effective_settings (derived defaults, if you compute them)
- created_at

## Design constraints
- Everything in the snapshot must be reproducible from pinned inputs.
- Ordering is deterministic (matches STD-3 resolved order).
- Snapshot is pinned in the run manifest and treated as read-only.
