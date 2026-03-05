---
library: system
id: SYS-7a
schema_version: 1.0.0
status: draft
---

# SYS-7a — system/ Definition of Done

system/ is considered "done" when:

## Schemas + registries
- [ ] All SYS schemas validate (JSON Schema check)
- [ ] All registries validate against their schemas
- [ ] schema_registry lists all schemas with versions and paths
- [ ] library_index lists all non-schema system files with versions and paths

## Runtime behavior (contract-level)
- [ ] Run start resolves pins deterministically into a pin_set
- [ ] Run start resolves effective quotas deterministically and records decision
- [ ] Adapter profile resolves capabilities deterministically and records snapshot
- [ ] Notification routing resolves destinations deterministically and records emission
- [ ] Policy hook requests/decisions are emitted and recorded with expiry

## Safety
- [ ] Deny patterns override allow patterns in command policies
- [ ] lock_mode is enforced (open vs pinned_required vs locked)
- [ ] approvals pause run and produce APPROVAL_REQUIRED notifications

## Reproducibility
- [ ] A run can be re-executed using only the pinned refs recorded in the manifest
