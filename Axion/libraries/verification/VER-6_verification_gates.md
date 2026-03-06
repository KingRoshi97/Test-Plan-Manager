---
library: verification
id: VER-6
schema_version: 1.0.0
status: draft
---

# VER-6 — Verification Gates

## Purpose
Define the verification-specific gate checks (VER-GATE-01 through VER-GATE-07) that collectively implement G7_VERIFICATION.

## Gate overview
G7_VERIFICATION is a composite gate that passes only when all VER-GATE sub-gates pass:

| Gate ID | Name | What it checks |
|---------|------|----------------|
| VER-GATE-01 | Proof Types Valid | proof_types registry validates against schema and is pinned |
| VER-GATE-02 | Proof Ledger Valid | proof_ledger validates against schema, is append-only, refs valid |
| VER-GATE-03 | Command Runs Tracked | command_run_log validates, all non-skipped runs have logs_ref |
| VER-GATE-04 | Completion Criteria Met | unit_done and run_done requirements satisfied |
| VER-GATE-05 | Command Policy Enforced | no command runs violated verification_command_policy |
| VER-GATE-06 | Evidence Coverage | all required proofs have evidence_refs with valid paths |
| VER-GATE-07 | Determinism Check | all verification artifacts are deterministically ordered and pinned |

## Evaluation order
Gates are evaluated in numeric order. A failure in any gate causes G7_VERIFICATION to fail with actionable evidence and remediation guidance.
