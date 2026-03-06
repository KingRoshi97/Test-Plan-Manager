---
library: kit
id: KIT-6a
schema_version: 1.0.0
status: draft
---

# KIT-6a — kit/ Definition of Done

kit/ is "done" when:

## Schemas + registries
- [ ] kit_manifest schema validates (JSON Schema check)
- [ ] kit_tree registry exists and is pinned
- [ ] kit_compatibility registry exists and is pinned
- [ ] kit_export_filter registry exists and is pinned

## Runtime behavior (contract-level)
- [ ] S9 produces a kit folder tree that matches kit_tree + kit_compatibility requirements
- [ ] kit_manifest.json is generated and validates
- [ ] Every included file is listed exactly once in kit_manifest.contents
- [ ] Required artifacts are present (by contract_id) and mapped to paths in the manifest
- [ ] Export filtering produces a deterministic external kit (when allowed)

## Safety
- [ ] External export strips internal_only + restricted content
- [ ] External export is blocked unless KIT_EXPORT policy hook allows (or approved override
exists)

## Determinism
- [ ] manifest ordering is deterministic (kind order then path)
- [ ] version pinning is explicit (kit_version + schema support)
- [ ] kit contents are derived only from pinned run artifacts
