# OBS-10 — Observability Gates (required signals per surface)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OBS-10                                             |
| Template Type     | Operations / Observability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring observability gates (required signals per surface)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Observability Gates (required signals per surface) Document                         |

## 2. Purpose

Define the canonical “observability completeness” gates: what telemetry must exist for each
surface (API endpoint, background job, websocket, client screen), what evidence proves it, and
what blocks release if missing. This template operationalizes observability as a requirement, not
an afterthought.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Observability overview: {{xref:OBS-01}} | OPTIONAL
- Telemetry schema standard: {{xref:OBS-02}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Dashboards inventory: {{xref:OBS-07}} | OPTIONAL
- Alerting overview: {{xref:ALRT-01}} | OPTIONAL
- SLO overview: {{xref:SLO-01}} | OPTIONAL
- Perf regression gates: {{xref:PERF-09}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Surface types covered ... | spec         | Yes             |
| Gate registry (gate_id... | spec         | Yes             |
| gate_id (stable identi... | spec         | Yes             |
| Surface selector (endp... | spec         | Yes             |
| Required signals list ... | spec         | Yes             |
| Required metric_ids (O... | spec         | Yes             |
| Required log_event_ids... | spec         | Yes             |
| Required trace coverag... | spec         | Yes             |
| Required dashboards (O... | spec         | Yes             |
| Required alerts (ALRT ... | spec         | Yes             |
| Evidence rule (how to ... | spec         | Yes             |
| Release block rule (wh... | spec         | Yes             |

## 5. Optional Fields

Grace period rules (for early MVP) | OPTIONAL
Exceptions process ref (COMP-08/SEC-08) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Do not invent metric_ids/log_event_ids; reference existing catalogs.
- **Critical surfaces must have at least one alert and one dashboard.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Covered Surfaces`
2. `## Gate Registry Summary`
3. `## Gates (repeat per gate_id)`
4. `## Gate`
5. `## open_questions:`
6. `## (Repeat per gate.)`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:OBS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-02}}, {{xref:SLO-02}}, {{xref:IRP-02}} | OPTIONAL**
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
