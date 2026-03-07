---
library: verification
id: VER-1_proof_unit_model
schema_version: 1.0.0
status: draft
---

# VER-1 — Proof Unit Model

## Purpose

Every proof in Axion is a **governed unit** with a stable identity, classification, strength tier, reusability contract, and evidence model. This doctrine defines the canonical shape of a verification unit.

## Proof Unit Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `proof_id` | string | yes | Globally unique identifier for this proof instance |
| `proof_class` | enum | yes | Classification: `functional`, `security`, `compliance`, `performance`, `operational` |
| `strength_tier` | enum | yes | One of `assertion`, `automated`, `witnessed`, `audited` (see VER-3) |
| `reusability` | enum | yes | `single_use`, `reusable_within_run`, `reusable_across_runs`, `evergreen` |
| `evidence_model` | object | yes | Describes evidence artifacts backing the proof |
| `work_item_id` | string | yes | The work item or claim this proof satisfies |
| `status` | enum | yes | `pass`, `fail`, `warn`, `expired` |
| `recorded_at` | datetime | yes | ISO-8601 timestamp of proof creation |
| `expires_at` | datetime | no | Expiry for time-bound proofs |
| `metadata` | object | no | Arbitrary key-value pairs for tooling |

## Proof Classes

- **functional** — proves a feature or behavior works as specified
- **security** — proves a security control is in place (scan, pen-test, policy check)
- **compliance** — proves regulatory or standards conformance
- **performance** — proves performance targets are met (load test, benchmark)
- **operational** — proves operational readiness (health check, runbook validation)

## Evidence Model

Each proof unit contains an `evidence_model` with:

| Field | Type | Required | Description |
|---|---|---|---|
| `evidence_refs` | array | yes | List of `{ path, hash?, media_type? }` pointing to artifacts |
| `evidence_kind` | enum | yes | `log_output`, `report`, `artifact`, `attestation`, `screenshot` |
| `reproducible` | boolean | yes | Whether the evidence can be regenerated deterministically |

## Reusability Contracts

| Level | Meaning |
|---|---|
| `single_use` | Valid only for the specific verification pass that created it |
| `reusable_within_run` | Can satisfy multiple claims within the same run |
| `reusable_across_runs` | Valid across runs until expiry or invalidation |
| `evergreen` | Never expires; valid until explicitly revoked |

## Identity Rules

- `proof_id` must be unique within the verification registry
- Format: `proof-{class}-{short_hash}` (recommended)
- Proofs are immutable once recorded; corrections create new proof units with a `supersedes` field

## Schema Reference

Governed by `axion://schemas/verification/verification_unit.v1`
