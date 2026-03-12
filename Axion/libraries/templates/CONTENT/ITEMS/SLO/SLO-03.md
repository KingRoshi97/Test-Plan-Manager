# SLO-03 — Endpoint SLO Catalog (by endpoint_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SLO-03                                             |
| Template Type     | Operations / SLOs & Reliability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring endpoint slo catalog (by endpoint_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Endpoint SLO Catalog (by endpoint_id) Document                         |

## 2. Purpose

Create the canonical catalog of endpoint-level SLOs, indexed by endpoint_id, for critical API
routes: latency and error-rate targets, SLI definitions, measurement windows, and ownership.
This template is used when endpoint-level guarantees matter beyond service-level SLOs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Endpoint catalog: {{xref:API-01}} | OPTIONAL
- Endpoint specs: {{xref:API-02}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- SLO overview: {{xref:SLO-01}} | OPTIONAL
- Measurement rules: {{xref:SLO-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Endpoint registry (endpoint_id list)
endpoint_id (stable identifier)
Route/method summary
SLI definition (latency/error)
Metric references (metric_id list)
Target (p95 latency, error rate)
Window (7d/30d/UNKNOWN)
Exclusions (what doesn’t count)
Owner (team/service)
Alert linkage (alert_id list)
Telemetry requirements (endpoint SLO calc failures)

Optional Fields
Tiering (critical/standard) | OPTIONAL
Client impact notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Endpoint SLOs must reference existing metric_ids; do not invent metrics.
Endpoint SLOs should be used only for critical endpoints; otherwise rely on service SLOs.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_endpoints: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Endpoints (repeat per endpoint_id)
Endpoint SLO
endpoint_id: {{endpoints[0].endpoint_id}}
route: {{endpoints[0].route}}
method: {{endpoints[0].method}}
sli: {{endpoints[0].sli}}
metric_ids: {{endpoints[0].metric_ids}}
target: {{endpoints[0].target}}
window: {{endpoints[0].window}}
exclusions: {{endpoints[0].exclusions}}
owner: {{endpoints[0].owner}}
alert_ids: {{endpoints[0].alert_ids}}
tier: {{endpoints[0].tier}} | OPTIONAL
client_impact: {{endpoints[0].client_impact}} | OPTIONAL
telemetry_metric: {{endpoints[0].telemetry_metric}}
open_questions:
{{endpoints[0].open_questions[0]}} | OPTIONAL
(Repeat per endpoint.)
3. References
Service SLOs: {{xref:SLO-02}} | OPTIONAL
Burn alerts: {{xref:SLO-07}} | OPTIONAL
Cross-References
Upstream: {{xref:API-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ALRT-02}}, {{xref:SLO-07}}, {{xref:PERF-03}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define endpoint_id, SLI, target, owner, metric references.
intermediate: Required. Define exclusions, alert linkage, telemetry metric.
advanced: Required. Add tiering and client impact notes and strict endpoint selection rationale.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, tiering, client impact,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If endpoints[].endpoint_id is UNKNOWN → block Completeness Gate.
If endpoints[].metric_ids is UNKNOWN → block Completeness Gate.
If endpoints[].target is UNKNOWN → block Completeness Gate.
If endpoints[].owner is UNKNOWN → block Completeness Gate.
If endpoints[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SLO
Pass conditions:
required_fields_present == true
endpoint_registry_defined == true
sli_targets_defined == true
metric_refs_defined == true
ownership_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SLO-04

SLO-04 — Error Budget Policy (burn rates, actions)
Header Block

## 5. Optional Fields

Tiering (critical/standard) | OPTIONAL
Client impact notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Endpoint SLOs must reference existing metric_ids; do not invent metrics.**
- **Endpoint SLOs should be used only for critical endpoints; otherwise rely on service SLOs.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Endpoints (repeat per endpoint_id)`
3. `## Endpoint SLO`
4. `## open_questions:`
5. `## (Repeat per endpoint.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:API-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-02}}, {{xref:SLO-07}}, {{xref:PERF-03}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define endpoint_id, SLI, target, owner, metric references.**
- **intermediate: Required. Define exclusions, alert linkage, telemetry metric.**
- **advanced: Required. Add tiering and client impact notes and strict endpoint selection rationale.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, tiering, client impact,**
- open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If endpoints[].endpoint_id is UNKNOWN → block

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
