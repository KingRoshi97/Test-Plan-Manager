---
id: STD-4b
library: standards
schema_version: 1.0.0
status: draft
---

# STD-4b — Validation Checklist

- [ ] standards_snapshot validates against schema
- [ ] resolved_packs is non-empty and ordered deterministically
- [ ] resolved_rules is non-empty and ordered deterministically
- [ ] every resolved_rule references a pack_id + pack_version present in resolved_packs
- [ ] conflicts (if present) are deterministic and referenced in snapshot notes/evidence
