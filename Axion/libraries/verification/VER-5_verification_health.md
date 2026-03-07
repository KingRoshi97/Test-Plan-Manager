---
library: verification
id: VER-5_verification_health
schema_version: 1.0.0
status: draft
---

# VER-5 — Verification Health

## Purpose

Defines metrics, signals, and checklists for assessing the health of a project's verification posture. Covers proof coverage, stale proofs, unverified claims, orphaned evidence, and a validation checklist.

## Health Dimensions

### 1. Proof Coverage

Proof coverage measures the ratio of claims with adequate proof to total claims.

| Metric | Formula | Target |
|---|---|---|
| Total coverage | `proofs_with_pass / total_claims` | >= 0.95 |
| Tier-adequate coverage | `proofs_at_required_tier / total_claims` | >= 0.90 |
| Class coverage | per-class breakdown (functional, security, compliance, performance, operational) | no class below 0.80 |

### 2. Stale Proofs

A proof is **stale** when:

- Its `expires_at` has passed and it has not been renewed
- The artifact or code it covers has changed since `recorded_at`
- The proof references a deprecated proof type or schema version

| Signal | Detection Method |
|---|---|
| Expired proof | `expires_at < now()` |
| Drift-stale proof | Source hash at proof time differs from current source hash |
| Schema-stale proof | Proof uses a deprecated schema version |

### 3. Unverified Claims

An **unverified claim** is a requirement or work item that has no associated proof unit or whose proof has status `fail` or `expired`.

| Signal | Detection Method |
|---|---|
| Missing proof | No `proof_id` references `claim_id` |
| Failed proof | Proof exists but `status = fail` |
| Expired proof | Proof exists but `status = expired` |
| Under-strength proof | Proof tier is below the minimum required for the claim's risk class |

### 4. Orphaned Evidence

**Orphaned evidence** is an artifact or log that exists in the evidence store but is not referenced by any active proof unit.

| Signal | Detection Method |
|---|---|
| Unreferenced artifact | Evidence path exists in store but no proof unit's `evidence_refs` points to it |
| Dangling proof ref | Proof unit references an evidence path that no longer exists |

### 5. Validation Checklist

Run this checklist before accepting a verification pass as healthy:

- [ ] All claims have at least one proof unit with `status = pass`
- [ ] No proofs are past their `expires_at` without renewal
- [ ] All proofs meet or exceed the minimum strength tier for their claim's risk class
- [ ] No orphaned evidence artifacts exist in the store
- [ ] No dangling evidence references in proof units
- [ ] Proof coverage is at or above target thresholds
- [ ] All proof bundles in use are within their validity window
- [ ] Deprecated proof types or schemas have migration paths defined
- [ ] Verification decision report has been issued with a clear verdict
- [ ] Coverage gaps in the decision report have documented rationale

## Health Report Output

A verification health assessment produces a structured report:

| Field | Type | Description |
|---|---|---|
| `report_id` | string | Unique health report identifier |
| `assessed_at` | datetime | When the assessment was performed |
| `total_claims` | integer | Number of claims in scope |
| `covered_claims` | integer | Claims with passing proof at required tier |
| `stale_proofs` | integer | Count of stale proof units |
| `unverified_claims` | integer | Count of claims lacking adequate proof |
| `orphaned_evidence` | integer | Count of orphaned evidence artifacts |
| `health_score` | number | 0.0–1.0 composite health score |
| `checklist_pass` | boolean | Whether all checklist items pass |
