# MDC-05 — Telemetry for Capabilities (errors, latency)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDC-05                                             |
| Template Type     | Build / Mobile Capabilities                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring telemetry for capabilities (errors, latency)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Telemetry for Capabilities (errors, latency) Document                         |

## 2. Purpose

Define the canonical telemetry requirements for mobile device capabilities: what
metrics/logs/traces to collect for capability usage, errors, latency, permission outcomes, and
fallback usage. This template must be consistent with client observability and logging/redaction
rules and must not invent telemetry that violates privacy constraints.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MDC-01 Capabilities Inventory: {{mdc.capabilities}}
- MDC-04 Failure Handling: {{mdc.failures}} | OPTIONAL
- SMD-06 Client Data Layer Observability: {{smd.observability}} | OPTIONAL
- CER-05 Client Logging/Crash Reporting: {{cer.logging}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Core capability metric... | spec         | Yes             |
| Latency metrics (time-... | spec         | Yes             |
| Error taxonomy (denied... | spec         | Yes             |
| Permission outcome met... | spec         | Yes             |
| Fallback usage metrics    | spec         | Yes             |
| Log field requirements... | spec         | Yes             |
| Redaction/privacy cons... | spec         | Yes             |
| Dashboards minimum panels | spec         | Yes             |
| Alerts (spikes in deni... | spec         | Yes             |

## 5. Optional Fields

Tracing spans for capability ops | OPTIONAL

Sampling policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **No sensitive data in telemetry.**
- **Metrics MUST use stable identifiers (capability_id) and avoid high-cardinality labels.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Core Metrics`
2. `## Latency Metrics`
3. `## Error Taxonomy`
4. `## Permission Outcomes`
5. `## Fallback Usage`
6. `## Logs — Required Fields`
7. `## Privacy / Redaction`
8. `## Dashboards`
9. `## Alerts`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:MDC-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OPS-OBS}} | OPTIONAL**
- **Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,**
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
