---
library: verification
id: VER-2b
schema_version: 1.0.0
status: draft
---

# VER-2b — Validation Checklist

- [ ] proof_ledger validates against schema
- [ ] all proof_type values exist in the proof_types registry
- [ ] evidence_refs contain valid path entries
- [ ] ledger is append-only (no mutations detected)
- [ ] proofs are deterministically ordered (recorded_at, proof_id)
