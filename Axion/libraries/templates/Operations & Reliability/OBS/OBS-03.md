# OBS-03 — Metrics Catalog (by metric_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OBS-03                                             |
| Template Type     | Operations / Observability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring metrics catalog (by metric_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Metrics Catalog (by metric_id) Document                         |

## 2. Purpose

Create the canonical catalog of metrics used by the system, indexed by metric_id, including
definition, type, labels, owners, and where each metric is emitted. This catalog supports SLOs,
alerts, dashboards, and cost controls.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Observability overview: {{xref:OBS-01}} | OPTIONAL
- Telemetry schema standard: {{xref:OBS-02}} | OPTIONAL
- Service SLO catalog: {{xref:SLO-02}} | OPTIONAL
- Endpoint SLO catalog: {{xref:SLO-03}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- API endpoint catalog (surface refs): {{xref:API-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Metric registry (metri... | spec         | Yes             |
| metric_id (stable iden... | spec         | Yes             |
| Metric name (exported ... | spec         | Yes             |
| Type (counter/gauge/hi... | spec         | Yes             |
| Unit (ms, bytes, count... | spec         | Yes             |
| Definition (what it me... | spec         | Yes             |
| Emit location (service... | spec         | Yes             |
| Labels/dimensions (all... | spec         | Yes             |
| Cardinality constraint... | spec         | Yes             |
| Owner (team/service)      | spec         | Yes             |
| Primary use (SLO/alert... | spec         | Yes             |
| Retention class (short... | spec         | Yes             |

## 5. Optional Fields

SLO bindings (slo_id list) | OPTIONAL
Alert bindings (alert_id list) | OPTIONAL
Example query | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-OBS-CARDINALITY]}} | OPTIONAL
- **Metrics must have clear definitions and units; no ambiguous names.**
- **Labels must be bounded; avoid unbounded user_id/session_id labels.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Metrics (repeat per metric_id)`
3. `## Metric`
4. `## open_questions:`
5. `## (Repeat per metric.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:OBS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-03}}, {{xref:SLO-06}} | OPTIONAL**
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
