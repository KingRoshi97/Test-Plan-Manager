---
library: standards
id: STD-2b
schema_version: 1.0.0
status: draft
---

# STD-2b — Determinism Rules (Index + Applicability)

- The index is evaluated in listed order.
- Applicability is a pure function of:
  - pinned standards_index
  - pinned packs
  - run profile_id + risk_class
  - canonical/normalized signals
- Packs are never "discovered" by scanning directories.
- If multiple versions of the same pack_id exist in index:
  - resolution rules (STD-3) choose deterministically.
