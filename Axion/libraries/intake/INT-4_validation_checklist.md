---
library: intake
id: INT-4b
schema_version: 1.0.0
status: draft
---

# INT-4b — Validation Checklist

- [ ] intake_submission validates against schema
- [ ] normalized_input validates against schema
- [ ] normalized_input.provenance is present and matches pinned refs
- [ ] enum resolution applied consistently (canonical/alias)
- [ ] multi-select outputs are sorted and de-duped
- [ ] raw answers are preserved (no overwrites)
