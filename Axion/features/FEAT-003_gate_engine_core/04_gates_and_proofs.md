# FEAT-003 — Gate Engine Core: Gates & Proofs

## 1. Gate Map (G1–G8)

The engine evaluates 8 gates across the pipeline. Each gate maps to a target artifact and required proof types via `GATE_EVIDENCE_MAP` and `deriveTarget()`.

| Gate ID | Name | Target Artifact | Required Proof Types |
|---------|------|----------------|---------------------|
| `G1_INTAKE_VALIDITY` | Intake Validity | `intake/validation_result.json` | `intake_validation` |
| `G2_CANONICAL_INTEGRITY` | Canonical Integrity | `canonical/canonical_spec.json` | `canonical_validation` |
| `G3_STANDARDS_RESOLVED` | Standards Resolved | `standards/resolved_standards_snapshot.json` | `standards_resolution` |
| `G4_TEMPLATE_SELECTION` | Template Selection | `templates/selection_result.json` | `template_selection` |
| `G5_TEMPLATE_COMPLETENESS` | Template Completeness | `templates/template_completeness_report.json` | `template_completeness` |
| `G6_PLAN_COVERAGE` | Plan Coverage | `planning/coverage_report.json` | `plan_coverage` |
| `G7_VERIFICATION` | Verification | `verification/verification_run_result.json` | `verification_result`, `proof_ledger` |
| `G8_PACKAGE_INTEGRITY` | Package Integrity | `kit/kit_manifest.json` | `package_integrity` |

## 2. Gate Evaluation Flow

1. `runGatesForStage(baseDir, runId, stageId)` loads all gates from `GATE_REGISTRY.json`
2. Gates are filtered to the current `stageId` via `filterGatesByStage()`
3. Each gate's paths are templated (`{{run_id}}` substitution) and prefixed with `baseDir`
4. Checks are evaluated sequentially via `evalCheck()`
5. On first check failure, the gate short-circuits — remaining checks are skipped
6. Evidence completeness is evaluated via `evaluateEvidenceCompleteness()`
7. A `GateReportV1` is written to `gates/{gate_id}.gate_report.json`
8. The run manifest's `gate_reports` array is updated
9. On gate failure, the stage halts immediately

## 3. Evidence Completeness

`evaluateEvidenceCompleteness()` compares available proof types against required proof types from `GATE_EVIDENCE_MAP`. Result includes:
- `required_proof_types`: what the gate needs
- `satisfied`: which proof types are present
- `missing`: which are absent
- `complete`: boolean (true if `missing` is empty)

Available proof types are derived from gate pass status via `deriveAvailableProofTypes()` — a failed gate produces no proof types.

## 4. Gate Report Structure (`GateReportV1`)

```typescript
{
  run_id: string;
  gate_id: string;
  stage_id: string;
  target: string;
  status: "pass" | "fail";
  evaluated_at: string;       // ISO timestamp
  engine: { name: "axion-gates", version: "0.1.0" };
  issues: GateIssue[];
  checks: CheckReport[];
  failure_codes: string[];
  evidence: EvidenceEntry[];
  evidence_completeness?: EvidenceCompletenessResult;
}
```

## 5. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
