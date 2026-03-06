---
library: kit
id: KIT-3b
schema_version: 1.0.0
status: draft
---

# KIT-3b — Determinism Rules (Versioning)

- kit_version is explicitly set and recorded in KIT_MANIFEST.
- kit_version changes require updating kit_compatibility registry.
- All referenced artifacts in the kit must be produced from pinned inputs recorded in the run
manifest.
- Export class does not change kit_version; it changes manifest.export_class + filtered contents.
