---
library: kit
id: KIT-4b
schema_version: 1.0.0
status: draft
---

# KIT-4b — Validation Checklist

- [ ] kit_export_filter registry exists and is pinned
- [ ] deny rules strip restricted/internal_only on external export
- [ ] external kit_manifest contains only allowed classifications
- [ ] external export behavior is deterministic and recorded
- [ ] policy can deny external export (KIT_EXPORT hook) and that decision is recorded
