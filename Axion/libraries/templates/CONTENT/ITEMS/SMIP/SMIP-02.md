# SMIP-02 — Analytics Event Spec (event

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMIP-02                                             |
| Template Type     | Product / Metrics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring analytics event spec (event    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Analytics Event Spec (event Document                         |

## 2. Purpose

Define the canonical analytics event taxonomy and event properties used to measure KPIs,
funnels, and experiments. This must align with privacy/data classification rules and avoid PII
leakage.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- SMIP-01: {{xref:SMIP-01}}
- DMG-04: {{xref:DMG-04}} | OPTIONAL
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- DGP-01: {{xref:DGP-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Event naming convention   | spec         | Yes             |
| Event list (minimum 10)   | spec         | Yes             |
| For each event:           | spec         | Yes             |
| ○ event_name              | spec         | Yes             |
| ○ description             | spec         | Yes             |
| ○ trigger                 | spec         | Yes             |
| ○ actor                   | spec         | Yes             |
| ○ required properties ... | spec         | Yes             |
| ○ optional properties ... | spec         | Yes             |
| ○ sampling (if any)       | spec         | Yes             |
| ○ destinations (wareho... | spec         | Yes             |
| ○ linked metrics (metr... | spec         | Yes             |

## 5. Optional Fields

● Event versioning/deprecations | OPTIONAL
● QA validation rules | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- **Property PII classification must align to DGP-01.**
- **Any user identifier must be hashed/pseudonymous unless explicitly allowed.**
- **Every metric that requires instrumentation must reference at least one event.**
- **Names must match DMG-04 convention where applicable.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Global Context Properties (required)`
2. `## prop_name`
3. `## type`
4. `## pii_clas`
5. `## notes`
6. `## app_versio`
7. `## string`
8. `## none`
9. `## platform`
10. `## string`

## 8. Cross-References

- Upstream: {{xref:SMIP-01}}, {{xref:DMG-04}} | OPTIONAL
- Downstream: {{xref:SMIP-03}}, {{xref:SMIP-04}} | OPTIONAL, {{xref:BI-*}} | OPTIONAL,
- **{{xref:OBS-01}} | OPTIONAL**
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
