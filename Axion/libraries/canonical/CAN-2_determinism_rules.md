---
library: canonical
id: CAN-2c
schema_version: 1.0.0
status: draft
---

# CAN-2c — Determinism Rules (IDs)

- ID generation uses canonical_key + pinned id_algo_version.
- Namespace mode is fixed (workspace_project or global) and pinned.
- Dedupe is canonical_key-based and stable.
- Conflicts never silently overwrite; they become unknown/assumption records.
