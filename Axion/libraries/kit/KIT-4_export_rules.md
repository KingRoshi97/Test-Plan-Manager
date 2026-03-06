---
library: kit
id: KIT-4
schema_version: 1.0.0
status: draft
---

# KIT-4 — Kit Export Rules (Internal vs External)

## Purpose
Define how kits are exported safely:
- internal kits may include internal-only knowledge/notes
- external kits must exclude restricted content and comply with use_policy rules

## Export classes
- internal: for internal executors/operators
- external: for third-party or untrusted execution environments

## What must be stripped for external export
- any item classified "restricted"
- any item classified "internal_only"
- any render envelopes containing restricted knowledge citations (if policy requires removal)
- any reuse excerpts beyond allowed limits (must not ship)

## What must remain
- public docs and artifacts required to execute the run (as allowed)
- a manifest that reflects what is included
- pinned provenance refs (but no secret material)
