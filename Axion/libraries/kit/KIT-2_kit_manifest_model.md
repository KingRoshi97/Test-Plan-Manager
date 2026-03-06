---
library: kit
id: KIT-2
schema_version: 1.0.0
status: draft
---

# KIT-2 — Kit Manifest Model

## Purpose
Define the authoritative manifest that lists:
- what's included in the kit
- where each file lives
- what contract/artifact it corresponds to
- hashes (optional) for integrity
- export classification (internal/external safe)

## Design rules
- Manifest is the source of truth; do not rely on directory scanning.
- Manifest entries are deterministic and stable.
- Every included file has exactly one manifest entry.
