---
library: audit
id: AUD-7a
schema_version: 1.0.0
status: draft
---

# AUD-7a — audit/ Definition of Done

audit/ is "done" when:

## Schemas + registries
- [ ] All audit schemas validate (JSON Schema check)
- [ ] audit_integrity registry exists and is pinned
- [ ] audit_ops_policy registry exists and is pinned

## Runtime behavior (contract-level)
- [ ] Sensitive operator actions are recorded as audit actions
- [ ] Audit log is append-only and serializes deterministically
- [ ] Audit index supports query keys without storing sensitive payloads
- [ ] Integrity verification works for the configured mode
- [ ] Retention/redaction/export workflow is defined and deterministic

## Gates
- [ ] AUD-GATE-01..06 implemented
- [ ] Missing actor/reason/timestamp coherence failures are detected
- [ ] Sensitive actions cannot proceed without required audit records

## Safety
- [ ] External audit exports are redacted per policy
- [ ] Internal logs do not include secrets/tokens
