# PERF-05 — Scaling Strategy (horizontal/vertical/caching)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PERF-05                                             |
| Template Type     | Operations / Performance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring scaling strategy (horizontal/vertical/caching)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Scaling Strategy (horizontal/vertical/caching) Document                         |

## 2. Purpose

Define the canonical scaling strategy for the system: how services scale under load
(horizontal/vertical), where caching is used, how autoscaling is configured, and what
backpressure protections exist. This template ties throughput targets to concrete scaling
mechanics.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Throughput targets: {{xref:PERF-04}} | OPTIONAL
- Compute baseline/autoscaling: {{xref:IAC-06}} | OPTIONAL
- DB performance policy: {{xref:PERF-06}} | OPTIONAL
- Cache strategy: {{xref:PERF-07}} | OPTIONAL
- Backpressure policy: {{xref:RELIA-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Scaling units (service/workers/db)
Horizontal scaling rule (replicas/autoscale)
Vertical scaling rule (instance sizing)
Autoscaling triggers (CPU/RPS/queue depth)
Caching usage rule (what can be cached)
Capacity headroom rule (target utilization)
Backpressure safeguards (limits, shedding)
Multi-region considerations (if any)
Telemetry requirements (scaling events, saturation)

Optional Fields
Cost tradeoffs notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Scaling strategy must include protection against thundering herds and overload.
If multi-region is not supported, state it explicitly in rules or UNKNOWN.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Units
units: {{units.list}}
2. Horizontal
rule: {{horiz.rule}}
autoscale: {{horiz.autoscale}} | OPTIONAL
3. Vertical
rule: {{vert.rule}}
4. Triggers
triggers: {{scale.triggers}}
5. Caching
cache_rule: {{cache.rule}}
cache_ref: {{xref:PERF-07}} | OPTIONAL
6. Headroom
utilization_target: {{headroom.utilization_target}}
headroom_rule: {{headroom.rule}} | OPTIONAL
7. Backpressure
backpressure_rule: {{bp.rule}}
shed_rule: {{bp.shed_rule}} | OPTIONAL
8. Multi-Region
supported: {{region.supported}}
rule: {{region.rule}} | OPTIONAL
9. Telemetry
scaling_event_metric: {{telemetry.scaling_event_metric}}
saturation_metric: {{telemetry.saturation_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:PERF-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:LOAD-01}}, {{xref:COST-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define horizontal/vertical rules and triggers and headroom target.
intermediate: Required. Define caching usage and backpressure safeguards and telemetry.

advanced: Required. Add multi-region rules and cost tradeoffs notes and strict capacity planning
tie-ins.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, autoscale details, cache ref, headroom
rule, shed rule, region rule, optional metrics, cost tradeoffs, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If horiz.rule is UNKNOWN → block Completeness Gate.
If scale.triggers is UNKNOWN → block Completeness Gate.
If headroom.utilization_target is UNKNOWN → block Completeness Gate.
If bp.rule is UNKNOWN → block Completeness Gate.
If telemetry.scaling_event_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PERF
Pass conditions:
required_fields_present == true
scaling_rules_defined == true
triggers_defined == true
backpressure_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PERF-06

PERF-06 — Database Performance Policy (indexes, query limits)
Header Block

## 5. Optional Fields

Cost tradeoffs notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Scaling strategy must include protection against thundering herds and overload.**
- If multi-region is not supported, state it explicitly in rules or UNKNOWN.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Units`
2. `## Horizontal`
3. `## Vertical`
4. `## Triggers`
5. `## Caching`
6. `## Headroom`
7. `## Backpressure`
8. `## Multi-Region`
9. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:PERF-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LOAD-01}}, {{xref:COST-06}} | OPTIONAL**
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
