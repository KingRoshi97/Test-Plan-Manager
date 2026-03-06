---
library: kit
id: KIT-5
schema_version: 1.0.0
status: draft
---

# KIT-5 — Kit Gates

## Purpose
Ensure the packaged kit is structurally correct, fully indexed, and safe to export.

## Gate set (minimum)

### KIT-GATE-01 — Kit tree conforms
- kit_tree registry pinned
- required folders exist
- required files exist (README.md, kit_manifest.json)

### KIT-GATE-02 — Kit manifest valid
- KIT_MANIFEST exists
- validates against kit_manifest.v1
- contents list is deterministic and has no duplicate paths

### KIT-GATE-03 — Manifest matches filesystem (strict mode optional)
- every manifest entry path exists on disk
- no extra files outside manifest (if strict enabled)

### KIT-GATE-04 — Required artifacts included
At minimum, internal kit must include:
- artifacts/CANONICAL_SPEC
- artifacts/STANDARDS_SNAPSHOT
- artifacts/BUILD_PLAN
- artifacts/WORK_BREAKDOWN
- artifacts/ACCEPTANCE_MAP
- artifacts/GATE_REPORT
- artifacts/PROOF_LEDGER
- metadata/RUN_MANIFEST snapshot (recommended)

(Exact filenames can be contract-based; the gate checks by contract_id presence.)

### KIT-GATE-05 — Export classification correct
- internal kits may include internal_only items
- external kits must include only public items
- export filtering applied per kit_export_filter registry

### KIT-GATE-06 — Policy compliance for export
- if export_class == external:
  - KIT_EXPORT policy hook must allow export (or approved override recorded)
