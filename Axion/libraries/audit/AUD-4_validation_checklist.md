---
library: audit
id: AUD-4c
schema_version: 1.0.0
status: draft
---

# AUD-4c — Validation Checklist (Integrity)

- [ ] audit_integrity registry exists and is pinned
- [ ] integrity_mode is one of: append_only, file_hash, hash_chain
- [ ] hash_algorithm is explicitly set when hashing is used
- [ ] canonical JSON serialization rules are defined
- [ ] root_hash / file hash verification succeeds when enabled
- [ ] required integrity level is enforced by risk class
