---
library: intake
id: INT-5a
schema_version: 1.0.0
status: draft
---

# INT-5a — Determinism Checklist

- [ ] Normalization rules are pinned via provenance refs
- [ ] Enum alias resolution is applied before any downstream use
- [ ] Multi-value fields are de-duped + sorted
- [ ] Slugify is stable and documented
- [ ] IDs are generated once and never regenerated
