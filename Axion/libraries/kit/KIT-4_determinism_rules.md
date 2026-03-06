---
library: kit
id: KIT-4a
schema_version: 1.0.0
status: draft
---

# KIT-4a — Determinism Rules (Export)

- Export behavior is derived only from:
  - kit_manifest classifications
  - pinned kit_export_filter registry
  - pinned policy decisions (if policy blocks external export)
- External export produces a new kit_manifest with:
  - export_class = external
  - contents filtered deterministically
- Filter evaluation order is registry order; deny rules apply before allow rules.
