# FEAT-008 — Proof Ledger: Gates & Proofs

## 1. Applicable Gates

### G7_VERIFICATION

Verifies that proof entries exist for all required gates and that the ledger passes integrity checks.

### G8_PACKAGE_INTEGRITY

Verifies that the proof ledger JSONL file is included in the final kit package and its hash is in the manifest.

## 2. Gate-to-Proof-Type Mapping

The `DEFAULT_GATE_PROOF_MAP` in `proof/registryLoader.ts` maps each gate to required proof types:

| Gate | Required Proof Types |
|------|---------------------|
| G1_INTAKE_VALIDITY | automated_check |
| G2_CANONICAL_INTEGRITY | automated_check |
| G3_STANDARDS_RESOLVED | automated_check |
| G4_TEMPLATE_SELECTION | automated_check |
| G5_TEMPLATE_COMPLETENESS | automated_check |
| G6_PLAN_COVERAGE | automated_check |
| G7_VERIFICATION | automated_check |
| G8_PACKAGE_INTEGRITY | automated_check |

## 3. VER-01 Proof Types Supported

| Proof Type | Name | Creator Function |
|------------|------|-----------------|
| P-01 | Command Output Proof | `createCommandOutputProof()` |
| P-02 | Test Result Proof | `createTestResultProof()` |
| P-03 | Screenshot / UI Capture Proof | Manual entry via `ledger.append()` |
| P-04 | Log Excerpt Proof | Manual entry via `ledger.append()` |
| P-05 | Diff/Commit Reference Proof | `createDiffCommitProof()` |
| P-06 | Checklist Proof | `createChecklistProof()` |
| automated_check | Gate Evaluator Proof | `createProofFromGateReport()` |

## 4. Proof Record Contract

Every proof entry contains (per VER-01 Section 6):

- `proof_id` — stable, deterministic
- `run_id` — links to pipeline run
- `gate_id` — links to gate evaluation
- `proof_type` — from VER-01 taxonomy
- `timestamp` — ISO 8601
- `evidence` — type-specific evidence object
- `hash` — SHA-256 integrity hash
- `acceptance_refs` — links to acceptance criteria items

## 5. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- ORD-02 (Gate DSL & Gate Rules)
- FEAT-003 (Gate Engine Core) — produces GateReportV1 consumed by proof creation
- PLAN-02 (Acceptance Map Rules) — acceptance_refs sourced from acceptance map
