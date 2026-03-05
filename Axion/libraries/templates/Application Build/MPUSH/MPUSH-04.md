# MPUSH-04 — Delivery/Retry Rules (quiet hours, collapse keys)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MPUSH-04                                             |
| Template Type     | Build / Push Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring delivery/retry rules (quiet hours, collapse keys)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Delivery/Retry Rules (quiet hours, collapse keys) Document                         |

## 2. Purpose

Define the canonical delivery and retry rules for push notifications, including quiet hours
behavior, collapse/grouping behavior, retry semantics, failure handling, and safeguards to
prevent notification storms. This template must be consistent with notification types and retry
patterns and must not invent delivery behaviors not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MPUSH-01 Notification Types Catalog: {{mpush.types}}
- MPUSH-02 Payload Contract: {{mpush.payload_contract}}
- CER-02 Retry/Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.flags}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Quiet hours policy (en... | spec         | Yes             |
| Collapse/grouping poli... | spec         | Yes             |
| Delivery priority rule... | spec         | Yes             |
| Retry policy (server/p... | spec         | Yes             |
| Failure handling (inva... | spec         | Yes             |
| Deduplication policy (... | spec         | Yes             |
| Storm prevention rules... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Feature-flag kill swit... | spec         | Yes             |

## 5. Optional Fields

Per-type overrides | OPTIONAL

Regional delivery constraints | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Delivery rules MUST be consistent with MPUSH-02 payload contract.**
- **Storm prevention MUST exist for high-volume systems.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Quiet Hours`
2. `## Collapse / Grouping`
3. `## Priority Rules`
4. `## Retry Policy`
5. `## Failure Handling`
6. `## Deduplication`
7. `## Storm Prevention`
8. `## OPTIONAL`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:MPUSH-01}}, {{xref:MPUSH-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MPUSH-05}}, {{xref:MPUSH-06}} | OPTIONAL**
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
