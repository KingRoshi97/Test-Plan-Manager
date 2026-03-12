# ALRT-03 — Alert Rule Spec (condition, threshold, window)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ALRT-03                                             |
| Template Type     | Operations / Alerting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring alert rule spec (condition, threshold, window)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Alert Rule Spec (condition, threshold, window) Document                         |

## 2. Purpose

Define the canonical specification format for alert rules: how conditions are written, threshold
and window conventions, severity mapping, and required metadata. This template standardizes
alert rules so they are consistent, reviewable, and tunable.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- SLO measurement rules: {{xref:SLO-06}} | OPTIONAL
- Noise reduction rules: {{xref:ALRT-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Rule schema (fields list) | spec         | Yes             |
| Condition syntax rule ... | spec         | Yes             |
| Threshold conventions ... | spec         | Yes             |
| Window conventions (5m... | spec         | Yes             |
| Severity mapping rules... | spec         | Yes             |
| Dedup keys rule (how a... | spec         | Yes             |
| Suppression rules (mai... | spec         | Yes             |
| Required metadata (own... | spec         | Yes             |
| Testing/validation rul... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Auto-tuning notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Rules must be explainable and stable; avoid overly complex conditions.**
- **Every rule must declare dedupe keys and owner/runbook metadata.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Rule Schema`
2. `## Condition Syntax`
3. `## Thresholds`
4. `## Windows`
5. `## Severity Mapping`
6. `## Dedupe`
7. `## Suppression`
8. `## Metadata`
9. `## Validation`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:ALRT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-05}}, {{xref:ALRT-10}} | OPTIONAL**
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
