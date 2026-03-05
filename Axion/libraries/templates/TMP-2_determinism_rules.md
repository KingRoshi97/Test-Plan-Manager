---
library: templates
id: TMP-2a
schema_version: 1.0.0
status: draft
---

# TMP-2a — Determinism Rules (Registry)

- The registry is the source-of-truth; no directory scanning.
- If multiple entries share template_id:
  - choose highest version deterministically (semver, else lexicographic)
  - record chosen version in TEMPLATE_SELECTION
- Template ordering in registry is stable; selection ordering is computed deterministically
(TMP-3).
