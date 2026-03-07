---
library: knowledge
id: KNO-2
section: authority_tiers
schema_version: 1.0.0
status: draft
---

# KNO-2 — Authority Tier Model

## Overview
The authority tier model establishes a strict ordering of trust levels for knowledge items (KIDs). Authority tiers determine how a KID participates in retrieval scoring, which runs it is eligible for, and what evidence is required to maintain its tier. Authority tiers are orthogonal to unit classes (KNO-1) — a KID of any class can hold any authority tier.

## Authority Tiers

### Golden
- **Trust level**: Highest. Treated as ground-truth reference material.
- **Eligibility**: All run profiles, all risk classes.
- **Requirements**: Multiple independent verifications, stable across 2+ version cycles, no open issues, peer-reviewed, verification proofs attached.
- **Promotion from**: Verified, after stability window and additional verification.
- **Demotion trigger**: New contradicting evidence, external source retraction, unresolved accuracy dispute.

### Verified
- **Trust level**: High. Confirmed against external sources or real-world usage.
- **Eligibility**: All run profiles, all risk classes.
- **Requirements**: At least one verification proof, sources cited, peer-reviewed, no blocking issues.
- **Promotion from**: Reviewed, after verification proof is attached and accepted.
- **Demotion trigger**: Verification proof invalidated, source retracted.

### Reviewed
- **Trust level**: Medium. Peer-reviewed for accuracy but not independently verified.
- **Eligibility**: Standard and low risk classes. May be excluded from high-risk runs by policy.
- **Requirements**: At least one peer review recorded, frontmatter complete, core content present.
- **Promotion from**: Draft, after peer review is recorded and no blocking issues remain.
- **Demotion trigger**: Review retracted, blocking issues discovered.

### Draft
- **Trust level**: Lowest. Not yet reviewed.
- **Eligibility**: Low-risk runs only, or internal exploration. Excluded from production selections by default.
- **Requirements**: Valid frontmatter, summary section present.
- **Promotion from**: Initial creation.
- **Demotion trigger**: N/A (lowest tier).

## Promotion Rules
1. Promotion is one-step-at-a-time: draft → reviewed → verified → golden. No skipping.
2. Promotion requires a recorded action (review record, verification proof) — it cannot happen implicitly.
3. Promotion is recorded in the KID's version history with timestamp, actor, and justification.
4. Bulk promotion is not allowed — each KID is promoted individually.
5. Promotion does not change the KID's `unit_class` (KNO-1).

## Demotion Rules
1. Demotion may skip tiers (e.g., golden → draft) if the trigger warrants it.
2. Demotion requires a recorded action with timestamp, actor, and justification.
3. Demoted KIDs are immediately excluded from retrieval results for risk classes above their new tier's eligibility.
4. Demotion triggers a freshness review (KNO-3) for all KIDs that depend on the demoted KID.

## Trust Level Ordering
The strict ordering is: `golden > verified > reviewed > draft`.

This ordering is used in:
- **Retrieval scoring**: higher-authority KIDs receive higher base scores (KNO-4).
- **Conflict resolution**: when two KIDs provide contradictory guidance, the higher-authority KID takes precedence.
- **Gate evidence**: gates may require a minimum authority tier for cited KIDs (KNO-6).

## Determinism Rules
- Authority tier comparison is deterministic: the ordering is fixed and total.
- Promotion and demotion are explicit, recorded operations — they do not depend on run context.
- Retrieval eligibility based on authority tier is deterministic: given the same tier and risk class, the eligibility result is always the same.

## Validation Checklist
- [ ] Every KID has a valid `authority_tier` from: golden, verified, reviewed, draft
- [ ] No KID has been promoted without a recorded action
- [ ] Demotion actions include justification and timestamp
- [ ] Conflict resolution uses the strict ordering defined here
- [ ] High-risk runs exclude draft-tier KIDs
