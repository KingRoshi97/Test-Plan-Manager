# FEAT-001 — Control Plane Core: Gates & Proofs

  ## 1. Applicable Gates

  ### GATE-01 — Schema Gate (Intake Validity)

Checks submissions against the Intake Schema: required fields, types/enums/formats, dependencies, skill-level thresholds. Hard stop if failing.

### GATE-02 — Normalization Gate (Transform Integrity)

Checks that normalization did not invent content, recorded changes in a normalization report, produced schema-consistent types and canonical naming. Hard stop if invention or invalid types.

### GATE-03 — Standards Gate (Resolved Ruleset Integrity)

Checks standards snapshot: version pinned, defaults + overrides recorded, fixed vs configurable flags set, conflicts resolved or explicitly blocked. Hard stop if unresolved conflicts.

### GATE-04 — Spec Gate (Truth Integrity)

Checks canonical spec: stable IDs exist, referential integrity, no duplicate truth, unknowns explicit and indexed. Hard stop if broken references or duplicate truth.

### GATE-05 — Planning Gate (Work Breakdown Integrity)

Checks work breakdown: each unit maps to spec IDs, dependency graph is acyclic, units are within size discipline. Hard stop if missing mappings or cycles.

### GATE-06 — Acceptance Gate (Proof Completeness)

Checks acceptance map: every unit has acceptance items, hard gates defined, proof types and verification instructions present. Hard stop if any unit lacks hard-gate acceptance.

### GATE-07 — Template Gate (Filled Doc Completeness)

Checks filled templates: required fields populated (or valid UNKNOWN policy), no contradictions, cross-references resolve to canonical spec IDs. Hard stop if required fields missing or contradictions.

### GATE-08 — Packaging Gate (Kit Contract)

Checks kit: file tree contract satisfied, manifest/index present and correct, version stamps present, N/A rule followed. Hard stop if contract violated.

### GATE-09 — Execution Gate (Proof & Completion)

Checks build progress: acceptance items pass, proofs recorded and linked, state snapshot updated. Hard stop for completion claim without proof.

  ## 2. Required Proof Types

  The following proof types (from VER-01) are applicable to this feature:

  | Proof Type | Name | Applicability |
  |------------|------|---------------|
  | P-01 | Command Output Proof | Build and runtime verification |
  | P-02 | Test Result Proof | Unit and integration test results |
  | P-05 | Diff/Commit Reference Proof | Code change verification |
  | P-06 | Checklist Proof (Manual Verification) | Manual review verification |

  ## 3. Gate Report Contract

  Every gate produces a report per ORD-02 Section 7:

  - `gate_id` — Gate identifier
  - `target` — Artifact or output being checked
  - `status` — pass | fail
  - `executed_at` — Timestamp
  - `issues[]` — Array of issue objects with:
    - `issue_id`, `severity`, `error_code`, `rule_id`, `pointer`, `message`, `remediation`

  ## 4. Override Policy

  - Overrides are allowed only if the gate rule declares `overridable: true`
  - Override records must include: override_id, gate_id, rule_id, approver, reason, risk_acknowledged, timestamp
  - Overrides never delete the original failure — they annotate it

  ## 5. Cross-References

  - SYS-07 (Compliance & Gate Model)
  - ORD-02 (Gate DSL & Gate Rules)
  - VER-01 (Proof Types & Evidence Rules)
  - FEAT-003 (Gate Engine Core)
  