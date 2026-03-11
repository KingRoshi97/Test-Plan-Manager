---
library: knowledge
id: KNO-1
section: unit_classes
schema_version: 1.0.0
status: draft
---

# KNO-1 — Knowledge Unit Classification

## Overview
Every knowledge item (KID) in the knowledge library is assigned a **unit class** that determines how it may be used, what evidence is required, and how it participates in retrieval scoring. Unit classes form the primary axis of knowledge governance alongside authority tiers (KNO-2).

## Unit Classes

### Authoritative Rule
- **Description**: A binding rule or constraint that MUST be followed when the KID's applicability scope matches the current run.
- **Usage**: Mandatory compliance. Agents must cite and follow. Non-compliance triggers gate failures.
- **Evidence**: Requires proof of compliance in the run's evidence set.
- **Examples**: Security requirements for specific industries, data handling mandates, regulatory constraints.

### Guidance
- **Description**: A recommended practice or approach that SHOULD be followed but allows justified deviation.
- **Usage**: Strongly recommended. Agents should cite when following and document rationale when deviating.
- **Evidence**: Deviation requires documented justification in the run's decision report.
- **Examples**: Architecture patterns, design recommendations, best-practice checklists.

### Example
- **Description**: A concrete illustration of a pattern, concept, or approach. Not prescriptive.
- **Usage**: Reference material. Agents may consult for inspiration but must not copy verbatim.
- **Evidence**: Citation required when the example materially influenced the output.
- **Examples**: Sample configurations, reference implementations, worked examples.

### Anti-Pattern
- **Description**: A documented pattern that MUST be avoided. Describes what NOT to do and why.
- **Usage**: Exclusionary. Agents must check applicable anti-patterns and confirm non-violation.
- **Evidence**: Gate checks verify that known anti-patterns are not present in outputs.
- **Examples**: Common security mistakes, performance anti-patterns, architectural pitfalls.

### Reference
- **Description**: Factual reference material (data models, KPI definitions, integration specs) without prescriptive intent.
- **Usage**: Informational. Agents may consult for factual accuracy.
- **Evidence**: Citation optional unless the reference was the sole source for a factual claim.
- **Examples**: Entity relationship maps, KPI definitions, protocol specifications.

## Quality Tiers

| Tier | Description | Minimum Requirements |
|------|-------------|---------------------|
| **T1 — Production** | Battle-tested, reviewed, and verified. Suitable for high-risk runs. | Full sections, peer review, verification proof, golden or verified authority. |
| **T2 — Standard** | Reviewed and usable. Suitable for standard-risk runs. | Complete core sections, at least one review, reviewed or higher authority. |
| **T3 — Draft** | Work-in-progress. Usable for low-risk runs or internal exploration. | Frontmatter complete, summary present, draft authority. |

## Maturity Levels

| Level | Description | Promotion Criteria |
|-------|-------------|-------------------|
| **draft** | Initial creation, not yet reviewed. | Frontmatter valid, core content present. |
| **reviewed** | Peer-reviewed for accuracy and completeness. | At least one review recorded, no blocking issues. |
| **verified** | Verified against external sources or real-world usage. | Verification proof attached, sources cited. |
| **golden** | Highest trust. Authoritative reference material. | Multiple verifications, no open issues, stable for 2+ versions. |

## Classification Rules
- Every KID MUST have exactly one `unit_class` assigned.
- Every KID MUST have exactly one `quality_tier` assigned.
- Unit class assignment is immutable after promotion to `verified` maturity unless a supersession occurs.
- Quality tier is derived from maturity level and evidence completeness.
- Anti-pattern KIDs must include a `mitigation` section describing the correct alternative.

## Determinism Rules
- Unit class assignment is deterministic: it is set at creation and does not change based on run context.
- Quality tier derivation is deterministic given the same maturity level and evidence state.
- Retrieval filtering by unit class is deterministic: the same class filter always produces the same subset.

## Validation Checklist
- [ ] Every KID has a valid `unit_class` from the enum: authoritative, guidance, example, anti_pattern, reference
- [ ] Every KID has a valid `quality_tier` from: T1, T2, T3
- [ ] Anti-pattern KIDs include a mitigation section
- [ ] Unit class is consistent with the KID's content and intent
- [ ] Quality tier is consistent with the KID's maturity and evidence
