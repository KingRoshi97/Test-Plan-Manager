# FEAT-003 — Gate Engine Core: Observability

## 1. Console Output

The gate engine emits structured console output during evaluation:

| Event | Format | Example |
|-------|--------|---------|
| Gate pass | `PASS {gate_id}` | `PASS G1_INTAKE_VALIDITY` |
| Gate fail | `FAIL {gate_id}: {failure_code}` | `FAIL G1_INTAKE_VALIDITY: E_FILE_MISSING` |
| No gates for stage | `No gates defined for stage {stageId}` | `No gates defined for stage S01` |

## 2. Gate Report Artifacts

Every gate evaluation produces a `GateReportV1` JSON file at:
```
.axion/runs/{run_id}/gates/{gate_id}.gate_report.json
```

Each report contains:
- `status`: `"pass"` or `"fail"`
- `evaluated_at`: ISO 8601 timestamp
- `engine`: `{ name: "axion-gates", version: "0.1.0" }`
- `checks[]`: per-check results with evidence
- `issues[]`: structured issues derived from failed checks
- `failure_codes[]`: aggregated failure codes
- `evidence_completeness`: proof-type satisfaction status

## 3. Run Manifest Updates

The run manifest (`run_manifest.json`) is updated after gate evaluation with:
```json
{
  "gate_reports": [
    { "gate_id": "G1_INTAKE_VALIDITY", "path": "gates/G1_INTAKE_VALIDITY.gate_report.json", "verdict": "pass" }
  ],
  "updated_at": "<ISO timestamp>"
}
```

## 4. Evidence Trail

Every `CheckResult` includes `EvidenceEntry[]`:
- `path`: file path examined
- `pointer`: JSON pointer evaluated
- `details`: operator-specific details (e.g., `{ min_required, actual }` for `coverage_gte`)

## 5. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
