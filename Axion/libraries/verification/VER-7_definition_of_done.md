---
library: verification
id: VER-7a
schema_version: 1.0.0
status: draft
---

# VER-7a — verification/ Definition of Done

verification/ is "done" when:

## Schemas + registries
- [ ] All verification schemas validate (JSON Schema check)
- [ ] proof_types registry validates and is pinned
- [ ] completion_criteria registry validates and is pinned
- [ ] verification_command_policy registry validates and is pinned

## Runtime behavior (contract-level)
- [ ] Command runs can be recorded with logs refs (no embedded logs)
- [ ] Proofs can be recorded and validated by proof_type required fields
- [ ] Proof ledger is append-only and references evidence by stable paths
- [ ] Completion criteria can be evaluated deterministically from pinned artifacts

## Gates
- [ ] VER-GATE-01..07 implemented and mapped to G7_VERIFICATION
- [ ] Missing proofs/artifacts produce actionable evidence + remediation
- [ ] Command policy violations are detected and blocked or require approval
