# ANL-03 — Event Schema Spec (payload rules, versioning)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ANL-03                                             |
| Template Type     | Operations / Analytics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring event schema spec (payload rules, versioning)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Event Schema Spec (payload rules, versioning) Document                         |

## 2. Purpose

Define the canonical schema rules for analytics events: payload structure, required envelope
fields, property typing, versioning, and backward compatibility. This spec enforces consistency
across events defined in ANL-02 and supports reliable analytics queries.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Event taxonomy: {{xref:ANL-02}} | OPTIONAL
- Telemetry schema standard: {{xref:OBS-02}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Anonymization rules: {{xref:PRIV-08}} | OPTIONAL
- Analytics data quality rules: {{xref:ANL-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Envelope fields list (... | spec         | Yes             |
| Property typing rules ... | spec         | Yes             |
| Required property rule... | spec         | Yes             |
| Optional property rule... | spec         | Yes             |
| Versioning scheme (sch... | spec         | Yes             |
| Backward compatibility... | spec         | Yes             |
| Deprecation rules (ren... | spec         | Yes             |
| Validation/enforcement... | spec         | Yes             |
| Redaction/denylist fie... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Batching rules | OPTIONAL

Compression rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **No raw PII in properties; apply PRIV-08 transformation rules when needed.**
- **Event payloads must validate against schema before send/store.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Envelope`
2. `## Properties`
3. `## Versioning`
4. `## Validation`
5. `## Redaction`
6. `## Telemetry`
7. `## Optional Transport`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:ANL-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ANL-06}}, {{xref:ANL-09}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define envelope, typing rules, versioning, and validation location.**
- **intermediate: Required. Define compatibility/deprecation and denylist/transform linkage and**
- telemetry.
- **advanced: Required. Add batching/compression and strict enforcement language + example**
- validation failure handling.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, id fields, deprecation rule, error handling,**
- optional transport rules, optional metrics, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If env.required_fields is UNKNOWN → block

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
