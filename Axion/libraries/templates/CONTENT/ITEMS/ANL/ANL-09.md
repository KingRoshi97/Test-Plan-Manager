# ANL-09 — Retention & Deletion for Analytics (ties to PRIV-05)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ANL-09                                             |
| Template Type     | Operations / Analytics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring retention & deletion for analytics (ties to priv-05)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Retention & Deletion for Analytics (ties to PRIV-05) Document                         |

## 2. Purpose

Define the canonical retention and deletion behavior for analytics data: event retention periods,
deletion request handling (account delete/DSAR), propagation to warehouses/third parties, and
verification. This template must align with PRIV-05 and any vendor sharing rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Retention/deletion policy: {{xref:PRIV-05}} | OPTIONAL
- Data sharing map (analytics vendors): {{xref:PRIV-06}} | OPTIONAL
- Event schema spec: {{xref:ANL-03}} | OPTIONAL
- Identity model: {{xref:ANL-04}} | OPTIONAL
- Regulatory requirements: {{xref:COMP-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Analytics retention cl... | spec         | Yes             |
| Retention days by even... | spec         | Yes             |
| Deletion workflow for ... | spec         | Yes             |
| Propagation rules (war... | spec         | Yes             |
| Legal hold interaction... | spec         | Yes             |
| Verification rule (pro... | spec         | Yes             |
| Audit requirements (de... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Aggregation policy (keep aggregated stats?) | OPTIONAL

Vendor limitations notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Deletion must propagate to analytics vendors where data was shared (or explicit exception).**
- Do not rely on raw IDs; use the identity model’s hashed identifiers for deletion targeting.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Retention Classes`
2. `## Retention Days`
3. `## Policy`
4. `## (Repeat per policy.)`
5. `## Deletion Requests`
6. `## Deletion Workflow`
7. `## steps:`
8. `## Propagation`
9. `## Identity Targeting`
10. `## Legal Hold`

## 8. Cross-References

- **Upstream: {{xref:PRIV-05}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ANL-10}}, {{xref:COMP-10}} | OPTIONAL**
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
