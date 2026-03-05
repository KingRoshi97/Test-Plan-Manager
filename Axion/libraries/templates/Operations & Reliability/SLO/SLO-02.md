# SLO-02 — Service SLO Catalog (by service_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SLO-02                                             |
| Template Type     | Operations / SLOs & Reliability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring service slo catalog (by service_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Service SLO Catalog (by service_id) Document                         |

## 2. Purpose

Create the canonical catalog of service-level SLOs, indexed by service_id, including SLIs,
targets, measurement windows, error budget policy references, and ownership. This catalog is
the source of truth for reliability targets at the service boundary.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SLO overview: {{xref:SLO-01}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Dashboards inventory: {{xref:OBS-07}} | OPTIONAL
- API endpoint catalog: {{xref:API-01}} | OPTIONAL
- Failure modes catalog: {{xref:RELIA-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Service registry (service_id list)
service_id (stable identifier)
Service name/description
SLIs (availability, latency, error rate)
Metric references (metric_id list)
SLO target (e.g., 99.9%)
Window (30d/7d/UNKNOWN)
Error budget policy reference (SLO-04)
Owner (team)
Alert linkage (alert_id list)
Dashboard linkage (dashboard_id list)
Telemetry requirements (slo evaluation errors)

Optional Fields
Dependencies considered (critical deps list) | OPTIONAL
Notes on exclusions (planned maintenance) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
SLOs must reference existing metric_ids from OBS-03; do not invent metrics.
Each service must have at least one SLI and one target (or explicit exception).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_services: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Services (repeat per service_id)
Service SLO
service_id: {{services[0].service_id}}
name: {{services[0].name}}
slis: {{services[0].slis}}
metric_ids: {{services[0].metric_ids}}
target: {{services[0].target}}
window: {{services[0].window}}
error_budget_ref: {{xref:SLO-04}} | OPTIONAL
owner: {{services[0].owner}}
alert_ids: {{services[0].alert_ids}}
dashboard_ids: {{services[0].dashboard_ids}}
deps: {{services[0].deps}} | OPTIONAL
maintenance_exclusions: {{services[0].maintenance_exclusions}} | OPTIONAL
telemetry_metric: {{services[0].telemetry_metric}}
open_questions:
{{services[0].open_questions[0]}} | OPTIONAL
(Repeat per service.)
3. References
Error budget policy: {{xref:SLO-04}} | OPTIONAL
Measurement rules: {{xref:SLO-06}} | OPTIONAL
Reporting: {{xref:SLO-10}} | OPTIONAL
Cross-References
Upstream: {{xref:SLO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SLO-04}}, {{xref:SLO-07}}, {{xref:ALRT-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define service_id, SLIs, target, owner, and metric references.
intermediate: Required. Define windows, alert/dashboard linkage, and telemetry metric.
advanced: Required. Add dependency considerations and maintenance exclusions and strict
exceptions governance.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, deps, maintenance exclusions,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If services[].service_id is UNKNOWN → block Completeness Gate.
If services[].metric_ids is UNKNOWN → block Completeness Gate.
If services[].target is UNKNOWN → block Completeness Gate.
If services[].owner is UNKNOWN → block Completeness Gate.
If services[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SLO
Pass conditions:
required_fields_present == true
service_registry_defined == true
sli_and_targets_defined == true
metric_refs_defined == true
ownership_and_linkage_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SLO-03

SLO-03 — Endpoint SLO Catalog (by endpoint_id)
Header Block

## 5. Optional Fields

Dependencies considered (critical deps list) | OPTIONAL
Notes on exclusions (planned maintenance) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **SLOs must reference existing metric_ids from OBS-03; do not invent metrics.**
- Each service must have at least one SLI and one target (or explicit exception).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Services (repeat per service_id)`
3. `## Service SLO`
4. `## open_questions:`
5. `## (Repeat per service.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:SLO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SLO-04}}, {{xref:SLO-07}}, {{xref:ALRT-02}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define service_id, SLIs, target, owner, and metric references.**
- **intermediate: Required. Define windows, alert/dashboard linkage, and telemetry metric.**
- **advanced: Required. Add dependency considerations and maintenance exclusions and strict**
- exceptions governance.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, deps, maintenance exclusions,**
- open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If services[].service_id is UNKNOWN → block

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
