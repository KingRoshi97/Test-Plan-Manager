---
library: kit
id: KIT-1a
schema_version: 1.0.0
status: draft
---

# KIT-1a — Determinism Rules (Kit Tree)

- Folder and file list is defined only by kit_tree registry (no discovery).
- Paths are relative to kit root.
- A kit build must create required folders/files even if empty (except where forbidden).
- All included files must be represented in KIT_MANIFEST.
