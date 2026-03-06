---
library: kit
id: KIT-3
schema_version: 1.0.0
status: draft
---

# KIT-3 — Versioning + Compatibility Rules

## Purpose
Define how kit versions, schema versions, and compatibility guarantees work so:
- executors know what they are reading
- changes don't silently break consumers
- kits remain reproducible across time

## Version layers
1) **Kit format version** (kit_version)
- version of the overall kit structure and manifest contract

2) **Schema versions**
- kit_manifest schema version
- any embedded schema references (canonical_spec, standards_snapshot, etc.)

3) **Content versions**
- template versions
- standards pack versions
- pipeline version

## Compatibility guarantees (minimum)
- Same kit_version ⇒ same required folder tree + manifest fields
- Minor version bump may add optional fields/paths (backward compatible)
- Major version bump may change required structure/fields (breaking)
