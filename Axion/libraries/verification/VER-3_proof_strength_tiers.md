---
library: verification
id: VER-3_proof_strength_tiers
schema_version: 1.0.0
status: draft
---

# VER-3 — Proof Strength Tiers

## Purpose

Defines the tier model for proof strength. Higher tiers provide stronger assurance. Gates and policies reference tiers to set minimum acceptable proof levels.

## Tier Model

Tiers are ordered by increasing strength:

```
assertion < automated < witnessed < audited
```

### Tier 1 — Assertion

- **What it is:** A claim made by an actor without independent evidence
- **Evidence:** Text statement, commit message, or self-attestation
- **Trust level:** Lowest; relies on actor credibility
- **Use cases:** Internal dev notes, draft completions, low-risk items
- **Accepted by gates:** Only when policy explicitly allows assertion-level proof

### Tier 2 — Automated

- **What it is:** Proof produced by an automated tool with verifiable output
- **Evidence:** Test results, lint output, CI logs, scan reports
- **Trust level:** Medium; tool output is reproducible and auditable
- **Use cases:** Unit tests, integration tests, SAST scans, build checks
- **Accepted by gates:** Default minimum for most verification gates

### Tier 3 — Witnessed

- **What it is:** Proof observed or confirmed by a second party (human or system)
- **Evidence:** Code review approval, QA sign-off, pair-verified output
- **Trust level:** High; independent confirmation of the claim
- **Use cases:** Code review approvals, manual QA passes, UAT sign-offs
- **Accepted by gates:** Required for high-risk changes or regulated domains

### Tier 4 — Audited

- **What it is:** Proof verified by an authorized auditor with formal attestation
- **Evidence:** Audit report, compliance certificate, third-party assessment
- **Trust level:** Highest; formal, accountable verification
- **Use cases:** SOC2 evidence, regulatory compliance, security audits
- **Accepted by gates:** Required for compliance-critical gates

## Promotion Rules

Proofs can be promoted to a higher tier when additional evidence is provided:

| From | To | Promotion Requirement |
|---|---|---|
| `assertion` | `automated` | Attach automated tool output that independently confirms the claim |
| `automated` | `witnessed` | Obtain independent review or observation confirming the automated result |
| `witnessed` | `audited` | Submit for formal audit and attach signed audit attestation |

### Promotion Constraints

- Promotion is append-only: the original proof unit is preserved, a new unit is created at the higher tier with a `promoted_from` reference
- Demotion is not permitted; if a proof is invalidated, its status changes to `fail` or `expired`
- Promotion must happen within the proof's validity window (before `expires_at`)

## Tier Requirements by Risk Class

| Risk Class | Minimum Tier |
|---|---|
| low | assertion |
| medium | automated |
| high | witnessed |
| critical | audited |
