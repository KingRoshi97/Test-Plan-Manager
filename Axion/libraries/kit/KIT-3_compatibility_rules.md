---
library: kit
id: KIT-3a
schema_version: 1.0.0
status: draft
---

# KIT-3a — Compatibility Rules

## Kit version semantics (recommended)
- MAJOR.MINOR.PATCH

### PATCH
- fixes typos/metadata
- no structural changes
- no required field changes

### MINOR
- may add new optional manifest fields
- may add new optional folders/files
- must not remove or rename required paths
- must not change meaning of existing fields

### MAJOR
- may add/remove/rename required paths
- may change required manifest fields
- requires executor update

## Schema version semantics
- Each JSON schema has its own schema_version.
- A kit can include multiple schema versions as long as the manifest references them explicitly
and the executor supports them.

## Pinning requirement
- kit_manifest must include the kit_version
- run manifest snapshot must include pinned library/schema versions used to generate the kit
