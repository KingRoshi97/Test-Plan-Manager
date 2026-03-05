# ANL-06 — Data Quality Rules (completeness, duplication)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ANL-06                                             |
| Template Type     | Operations / Analytics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data quality rules (completeness, duplication)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Quality Rules (completeness, duplication) Document                         |

## 2. Purpose

Define the canonical data quality rules for analytics: required-field completeness, schema
validation, duplication control, ordering constraints (where relevant), and how quality is
monitored and remediated. This template ensures analytics can be trusted.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Event taxonomy: {{xref:ANL-02}} | OPTIONAL
- Event schema spec: {{xref:ANL-03}} | OPTIONAL
- Identity model: {{xref:ANL-04}} | OPTIONAL
- Telemetry schema standard: {{xref:OBS-02}} | OPTIONAL
- Funnels/KPIs: {{xref:ANL-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Quality dimensions lis... | spec         | Yes             |
| Completeness rules (re... | spec         | Yes             |
| Validity rules (types/... | spec         | Yes             |
| Duplication rules (ide... | spec         | Yes             |
| Late arrival handling ... | spec         | Yes             |
| Ordering assumptions (... | spec         | Yes             |
| Monitoring rules (dash... | spec         | Yes             |
| Remediation workflow (... | spec         | Yes             |
| Ownership (who fixes q... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Backfill policy | OPTIONAL

Sampling effects notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Data quality rules must be measurable (metrics) and enforceable (validation).**
- If required fields missing, event should be dropped or marked invalid per rules.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Quality Dimensions`
2. `## Completeness`
3. `## Validity`
4. `## Duplication`
5. `## Late Arrivals`
6. `## Ordering`
7. `## Monitoring`
8. `## Remediation`
9. `## Ownership`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:ANL-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ANL-07}}, {{xref:ANL-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define completeness and validity and monitoring rule.**
- **intermediate: Required. Define dedupe and late handling and remediation workflow and**
- telemetry metrics.
- **advanced: Required. Add backfill policy and sampling notes and strict ownership + SLA for**
- fixes.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, drop/invalid rule, enum policy, window**
- minutes, lateness hours, dashboards/alert refs, backfill policy, sampling notes, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If dims.list is UNKNOWN → block

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
