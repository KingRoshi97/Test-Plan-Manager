---
library: intake
id: INT-2a
schema_version: 1.0.0
status: draft
---

# INT-2a — Determinism Rules (Enums)

- Enum option value is canonical.
- Aliases are case-insensitive and trimmed before matching.
- Resolution rule:
  1) exact match to canonical value
  2) else exact match to any alias
  3) else invalid value error
- Option order is the registry order and must not be re-sorted at runtime.
