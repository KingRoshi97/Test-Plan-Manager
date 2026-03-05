# PRIV-02 — PII Classification Model (types, sensitivity)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-02                                             |
| Template Type     | Security / Privacy                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring pii classification model (types, sensitivity)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled PII Classification Model (types, sensitivity) Document                         |

## 2. Purpose

Define the canonical PII classification model used across the system: what counts as PII,
sensitivity tiers, examples, and handling expectations. This template must align with security
posture and file/media PII rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- Security overview: {{xref:SEC-01}} | OPTIONAL
- File security/compliance: {{xref:FMS-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| PII definition statement  | spec         | Yes             |
| Sensitivity tiers list... | spec         | Yes             |
| Tier definitions (what... | spec         | Yes             |
| Special categories (ch... | spec         | Yes             |
| Handling rules per tie... | spec         | Yes             |
| Redaction rules per ti... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Jurisdiction-specific notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Classification must be usable by engineers (clear examples).**
- **Higher tiers must have stricter logging/sharing prohibitions.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Definition`
2. `## Tiers`
3. `## Tier Rules (repeat)`
4. `## Tier`
5. `## (Repeat per tier.)`
6. `## PII Types`
7. `## Telemetry`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PRIV-03}}, {{xref:PRIV-06}}, {{xref:COMP-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
