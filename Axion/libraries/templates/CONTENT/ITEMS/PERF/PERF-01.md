# PERF-01 — Performance Overview (targets, constraints)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PERF-01                                             |
| Template Type     | Operations / Performance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring performance overview (targets, constraints)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Performance Overview (targets, constraints) Document                         |

## 2. Purpose

Create the single, canonical overview of performance for the system: what “fast” means, what
targets exist for web/mobile/backend, and what constraints shape performance work (cost,
reliability, feature scope). This document anchors the PERF set.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Performance budgets overview: {{xref:PBP-01}} | OPTIONAL
- SLO overview (latency expectations): {{xref:SLO-01}} | OPTIONAL
- Client performance budget: {{xref:CPR-01}} | OPTIONAL
- Critical path inventory: {{xref:PERF-02}} | OPTIONAL
- Latency budgets: {{xref:PERF-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Performance targets su... | spec         | Yes             |
| In-scope surfaces (scr... | spec         | Yes             |
| Out-of-scope statement... | spec         | Yes             |
| Primary constraints (c... | spec         | Yes             |
| Measurement approach (... | spec         | Yes             |
| Ownership (who owns perf) | spec         | Yes             |
| Perf regression policy... | spec         | Yes             |
| Release gate linkage (... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

MVP vs later targets | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Targets must be measurable (define metrics and windows).
Do not invent budgets; reference PBP/CPR docs where defined.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Targets
web_targets: {{targets.web}}
mobile_targets: {{targets.mobile}}
api_targets: {{targets.api}}
2. Scope
in_scope: {{scope.in}}
out_of_scope: {{scope.out}} | OPTIONAL
3. Constraints
constraints: {{constraints.list}}
4. Measurement
metrics: {{measure.metrics}}
tooling: {{measure.tooling}} | OPTIONAL
5. Ownership
owner: {{owner.team}}
6. Regression Policy
regression_ref: {{xref:PERF-09}} | OPTIONAL
block_rule: {{regress.block_rule}}
7. Release Linkage
release_gate_rule: {{release.gate_rule}}
8. Telemetry
perf_regression_metric: {{telemetry.regression_metric}}
Cross-References
Upstream: {{xref:PBP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PERF-02}}, {{xref:PERF-09}}, {{xref:LOAD-01}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define targets, constraints, measurement, regression block rule.
intermediate: Required. Define scope and ownership and release gate linkage and telemetry.
advanced: Required. Add MVP vs later targets and strict tie-ins to budgets and SLOs.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, tooling, regression ref, optional scope,
MVP targets, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

If targets.web or targets.api is UNKNOWN → block Completeness Gate.
If constraints.list is UNKNOWN → block Completeness Gate.
If regress.block_rule is UNKNOWN → block Completeness Gate.
If telemetry.regression_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PERF
Pass conditions:
required_fields_present == true
targets_and_constraints_defined == true
measurement_defined == true
regression_and_release_linkage_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PERF-02

PERF-02 — Critical Path Inventory (user journeys)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Targets must be measurable (define metrics and windows).**
- Do not invent budgets; reference PBP/CPR docs where defined.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Targets`
2. `## Scope`
3. `## Constraints`
4. `## Measurement`
5. `## Ownership`
6. `## Regression Policy`
7. `## Release Linkage`
8. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:PBP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PERF-02}}, {{xref:PERF-09}}, {{xref:LOAD-01}} | OPTIONAL**
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
