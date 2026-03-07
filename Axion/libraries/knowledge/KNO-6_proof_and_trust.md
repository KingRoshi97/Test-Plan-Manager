---
library: knowledge
id: KNO-6
section: proof_and_trust
schema_version: 1.0.0
status: draft
---

# KNO-6 — Proof & Trust Model

## Overview
Knowledge claims carry varying degrees of certainty. The proof and trust model defines what evidence is required for knowledge items at each authority tier, how citations must be recorded, what trust signals are evaluated, and how knowledge consumers can assess the reliability of a KID.

## Evidence Requirements by Authority Tier

### Golden
- At least 3 independent verification proofs from distinct sources.
- All factual claims cite authoritative external references (RFCs, official documentation, peer-reviewed sources).
- No unresolved accuracy disputes.
- Peer review record from at least 2 reviewers.
- Stability proof: unchanged core claims across 2+ version cycles.

### Verified
- At least 1 verification proof from a credible source.
- Key factual claims cite external references.
- No blocking accuracy disputes.
- Peer review record from at least 1 reviewer.

### Reviewed
- Peer review record from at least 1 reviewer.
- Core claims are internally consistent.
- No known contradictions with golden/verified KIDs.

### Draft
- Valid frontmatter and summary section.
- No evidence requirements beyond structural validity.

## Citation Policy
When an agent consults a KID during a pipeline run, a citation record must be produced:

| Field | Required | Description |
|-------|----------|-------------|
| `kid_id` | yes | The KID that was consulted. |
| `agent_id` | yes | The agent that consulted the KID. |
| `pipeline_stage` | yes | The pipeline stage during which the KID was consulted. |
| `usage_type` | yes | How the KID was used: `followed`, `referenced`, `deviated_from`. |
| `excerpt_used` | no | Whether an excerpt was included in output (subject to use_policy limits). |
| `timestamp` | yes | ISO 8601 timestamp of the consultation. |

## Citation Rules
1. Every KID with `unit_class: authoritative` that matches the run's applicability scope MUST be cited if it was consulted.
2. Deviation from an authoritative KID requires a `deviated_from` citation with justification.
3. Anti-pattern KIDs that were checked and confirmed non-violating should be cited with `usage_type: referenced`.
4. Citation records are included in the run's evidence set and are queryable in the audit ledger.
5. Missing citations for required KIDs are flagged by the knowledge-citation gate.

## Trust Signals
The following signals contribute to a KID's overall trust assessment:

| Signal | Weight | Description |
|--------|--------|-------------|
| **Authority tier** | 0.35 | Golden/verified/reviewed/draft as defined in KNO-2. |
| **External citations** | 0.20 | Number and quality of external reference citations. |
| **Verification proofs** | 0.20 | Number and recency of verification proofs. |
| **Review count** | 0.10 | Number of distinct peer reviews. |
| **Freshness** | 0.10 | Time since last update relative to freshness window (KNO-3). |
| **Contradiction count** | 0.05 | Inverse: more contradictions = lower trust. |

Trust score = weighted sum, normalized to [0, 1]. A trust score below 0.3 triggers an operator warning.

## Trust Model
- Trust is **earned through evidence**, not assigned arbitrarily.
- Trust is **decayable** — a KID that was once golden can lose trust if evidence is invalidated or freshness expires.
- Trust is **composable** — a KID's trust is partially inherited from its dependencies. If a `depends_on` KID is demoted, the dependent KID's trust score is recalculated.
- Trust is **transparent** — the trust score and its contributing factors are included in retrieval reports.

## Validation Checklist
- [ ] Golden KIDs have 3+ verification proofs
- [ ] Verified KIDs have 1+ verification proofs
- [ ] Reviewed KIDs have 1+ peer review records
- [ ] All authoritative KIDs consulted during a run have citation records
- [ ] Deviations from authoritative KIDs include justification
- [ ] Trust scores are included in retrieval decision reports
- [ ] KIDs with trust score below 0.3 are flagged for review
