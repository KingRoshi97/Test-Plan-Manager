# FEAT-009 — Export Bundles: Gates & Proofs

## 1. Applicable Gates

### GATE-08 — Packaging Gate (Kit Contract)

Verifies the kit output satisfies KIT-01 through KIT-04 contracts:

- **KIT-01**: File tree contract — all 12 domain slots exist under `10_app/`, core artifacts under `01_core_artifacts/`, metadata files at root
- **KIT-02**: Manifest & index present and correct — `kit_manifest.json` lists all files with SHA-256 hashes; `00_KIT_MANIFEST.md` and `00_KIT_INDEX.md` present
- **KIT-03**: Entrypoint contract — `entrypoint.json` present with `kit_root` and `start_here` paths
- **KIT-04**: Version stamps — `version_stamp.json` and `00_VERSIONS.md` present with V-01 through V-07

Gate checks verified by the kit's own `00_gate_checklist.md` which references all 8 gate targets (G1–G8).

## 2. Kit Artifacts Checked by GATE-08

| Target | Path | Check |
|--------|------|-------|
| Kit manifest | `kit/kit_manifest.json` | File exists, valid JSON, contains `files[]` with hashes |
| Entrypoint | `kit/entrypoint.json` | File exists, valid JSON, has `kit_root` and `start_here` |
| Version stamp | `kit/version_stamp.json` | File exists, valid JSON, has `versions` object |
| Packaging manifest | `kit/packaging_manifest.json` | File exists, valid JSON, has `files[]` with `sha256` hashes |
| Agent kit root | `kit/bundle/agent_kit/` | Directory exists with all required files |

## 3. Required Proof Types

| Proof Type | Name | Applicability |
|------------|------|---------------|
| P-01 | Command Output Proof | `buildRealKit()` return value (fileCount, contentHash) |
| P-02 | Test Result Proof | Unit tests for slot mapping, hash generation |
| P-05 | Diff/Commit Reference Proof | Kit structure verification against KIT-01 |

## 4. Gate Report Contract

Gate reports follow ORD-02 Section 7:

- `gate_id` — `"G8_PACKAGE_INTEGRITY"`
- `target` — `"kit/kit_manifest.json"`
- `status` — `pass` | `fail`
- `executed_at` — ISO timestamp
- `issues[]` — Array of issue objects

## 5. Override Policy

- Overrides allowed only if the gate rule declares `overridable: true`
- Override records must include: override_id, gate_id, rule_id, approver, reason, risk_acknowledged, timestamp
- Overrides never delete the original failure — they annotate it

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core)
- KIT-01 through KIT-04 (Kit contracts)
