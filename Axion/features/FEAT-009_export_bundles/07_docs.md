# FEAT-009 — Export Bundles: Documentation Requirements

## 1. System Documentation References

| Document | Relevance |
|----------|-----------|
| KIT-01 (Kit Folder Structure Contract) | Defines the required folder layout that `buildRealKit()` implements |
| KIT-02 (Manifest & Index Format) | Defines manifest and index structure for `kit_manifest.json` and `00_KIT_MANIFEST.md` |
| KIT-03 (Entrypoint Contract) | Defines `entrypoint.json` format |
| KIT-04 (Version Stamping Rules) | Defines version stamp format (V-01 through V-07) |
| SYS-03 (End-to-End Architecture) | Kit packaging as pipeline stage S9 |
| SYS-07 (Compliance & Gate Model) | GATE-08 packaging gate contract |

## 2. Kit-Generated Documentation

The kit itself generates documentation files:

| File | Content |
|------|---------|
| `00_START_HERE.md` | Orientation: purpose, authoritative artifacts, reading order, execution loop, verification, completion definition |
| `00_KIT_MANIFEST.md` | Manifest data: kit_id, run_id, spec_id, reading_order, core_artifacts map, packs, proof log path |
| `00_KIT_INDEX.md` | File index: core artifacts table, 12 app pack slots table |
| `00_VERSIONS.md` | Version stamps V-01 through V-07 in JSON |
| `00_RUN_RULES.md` | Six execution rules for consuming agents |
| `00_PROOF_LOG.md` | Empty proof tracking table |
| `00_pack_meta.md` | App pack metadata |
| `00_pack_index.md` | App pack index with per-slot file listings |
| `00_gate_checklist.md` | Gate checklist referencing G1–G8 targets |

## 3. Domain Slot Mapping Reference

The 12 APP_SLOTS and the SUBDIR_TO_SLOT mapping (80+ entries) are defined in `build.ts` and map template output paths to domain directories.

## 4. Cross-References

- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
