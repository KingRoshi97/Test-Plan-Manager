# FEAT-012 — Secrets & PII Scanner / Quarantine: Gates & Proofs

## 1. Applicable Gates

This feature does not own any gates directly. It produces `ScanResult` artifacts that are consumed by the pipeline controller (FEAT-001) and may be checked by gate rules in FEAT-003 (Gate Engine Core).

The `ScanResult.passed` field provides a boolean gate signal: `true` when `critical === 0 && high === 0`.

## 2. Required Proof Types

The following proof types (from VER-01) are applicable to this feature:

| Proof Type | Name | Applicability |
|------------|------|---------------|
| P-01 | Command Output Proof | Scan execution output and quarantine actions |
| P-02 | Test Result Proof | Unit tests for pattern detection accuracy |
| P-05 | Diff/Commit Reference Proof | Code change verification for scan pack updates |
| P-06 | Checklist Proof (Manual Verification) | Manual review of false-positive overrides |

## 3. Evidence Artifacts

| Artifact | Location | Format |
|----------|----------|--------|
| Scan result | `{runDir}/scan_result.json` | `ScanResult` JSON |
| Quarantine ledger | `{runDir}/.quarantine/quarantine_ledger.json` | `QuarantineEntry[]` JSON |
| Quarantined files | `{runDir}/.quarantine/QRN-*.{ext}` | Copies of flagged files |

## 4. Override Policy

- Overrides are allowed only if the gate rule declares `overridable: true`
- Override records must include: override_id, gate_id, rule_id, approver, reason, risk_acknowledged, timestamp
- Overrides never delete the original finding — they annotate it
- Quarantine ledger entries are never removed by overrides

## 5. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core)
