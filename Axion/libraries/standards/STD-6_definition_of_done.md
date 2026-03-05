---
library: standards
id: STD-6a
schema_version: 1.0.0
status: draft
---

# STD-6a — standards/ Definition of Done

standards/ is "done" when:

## Schemas + registries
- [ ] All standards schemas validate (JSON Schema check)
- [ ] standards_index validates and references existing pack paths
- [ ] all referenced pack files validate against standards_pack schema

## Runtime behavior (contract-level)
- [ ] S3 selects applicable packs deterministically (STD-2)
- [ ] S3 resolves pack precedence deterministically (STD-3)
- [ ] S3 emits standards_snapshot that validates (STD-4)
- [ ] Snapshot ordering matches resolver ordering
- [ ] Conflicts are recorded and resolved deterministically (or policy approved)

## Gates
- [ ] STD-GATE-01..06 implemented and mapped to G3_STANDARDS_RESOLVED
- [ ] Snapshot pinned in run manifest before downstream stages
