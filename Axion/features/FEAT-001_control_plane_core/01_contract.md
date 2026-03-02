# FEAT-001 — Control Plane Core: Contract

  ## 1. Purpose

  Central orchestration service managing pipeline runs, stage progression, artifact tracking, audit logging, and policy enforcement across the Axion system.

  ## 2. Inputs

  Pipeline run requests, stage progression events, artifact references, policy definitions

  ## 3. Outputs

  Run records, audit logs, stage results, policy evaluation results, artifact pins

  ## 4. Invariants

  - Every pipeline run has a unique, stable run_id
- Stage progression is strictly sequential — no stage may be skipped without an override record
- All state mutations are logged in the audit trail
- Policy evaluation is deterministic for identical inputs
- Artifact pins are immutable once created

  ## 5. Dependencies

  - None (root feature)

  ## 6. Source Modules

  - `src/core/controlPlane/api.ts`
- `src/core/controlPlane/model.ts`
- `src/core/controlPlane/store.ts`
- `src/core/controlPlane/audit.ts`
- `src/core/controlPlane/pins.ts`
- `src/core/controlPlane/releases.ts`
- `src/core/controlPlane/policies.ts`

  ## 7. Failure Modes

  - Run state becomes inconsistent due to partial writes
- Audit trail gaps — mutations occur without corresponding log entries
- Policy evaluation diverges from deterministic behavior
- Stage progression bypasses gate checks

  ## 8. Cross-References

  - SYS-03 (End-to-End Architecture)
  - SYS-07 (Compliance & Gate Model)
  - GATE-01 — Schema Gate (Intake Validity)
- GATE-02 — Normalization Gate (Transform Integrity)
- GATE-03 — Standards Gate (Resolved Ruleset Integrity)
- GATE-04 — Spec Gate (Truth Integrity)
- GATE-05 — Planning Gate (Work Breakdown Integrity)
- GATE-06 — Acceptance Gate (Proof Completeness)
- GATE-07 — Template Gate (Filled Doc Completeness)
- GATE-08 — Packaging Gate (Kit Contract)
- GATE-09 — Execution Gate (Proof & Completion)
  