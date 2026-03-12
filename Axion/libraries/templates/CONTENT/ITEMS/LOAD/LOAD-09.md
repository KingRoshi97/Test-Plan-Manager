# LOAD-09 — Chaos/Failure Injection Plan (optional)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LOAD-09                                             |
| Template Type     | Operations / Load Testing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring chaos/failure injection plan (optional)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Chaos/Failure Injection Plan (optional) Document                         |

## 2. Purpose

Define the canonical plan for chaos/failure injection (if used): what failure modes are injected,
safety guardrails, success criteria, and how learnings translate into resilience improvements.
This is optional but recommended for mature reliability practices.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Chaos engineering plan: {{xref:RELIA-08}} | OPTIONAL
- Failure modes catalog: {{xref:RELIA-02}} | OPTIONAL
- Incident drills: {{xref:IRP-09}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- Dashboards: {{xref:OBS-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Scope (services/enviro... | spec         | Yes             |
| Failure modes to test ... | spec         | Yes             |
| Injection methods (lat... | spec         | Yes             |
| Safety guardrails (abo... | spec         | Yes             |
| Success criteria (dete... | spec         | Yes             |
| Runbook linkage (what ... | spec         | Yes             |
| Ownership (who runs ex... | spec         | Yes             |
| Cadence (quarterly/UNK... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Blast radius rules | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Chaos tests must be safe, time-boxed, and have abort conditions.
Do not run chaos experiments in production without explicit approvals.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Scope
services: {{scope.services}}
environments: {{scope.envs}} | OPTIONAL
2. Failure Modes
fm_ids: {{modes.fm_ids}}
3. Injection
methods: {{inject.methods}}
tooling: {{inject.tooling}} | OPTIONAL
4. Guardrails
abort_conditions: {{guard.abort_conditions}}
safety_rule: {{guard.safety_rule}} | OPTIONAL
5. Success Criteria
criteria: {{success.criteria}}
6. Runbooks
runbook_refs: {{runbooks.refs}}
incident_ref: {{xref:IRP-02}} | OPTIONAL
7. Ownership & Cadence
owner: {{owner.team}}
cadence: {{cadence.value}}
8. Telemetry
chaos_pass_rate_metric: {{telemetry.pass_rate_metric}}
abort_metric: {{telemetry.abort_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:RELIA-08}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IRP-06}}, {{xref:RELIA-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Optional.
intermediate: Required if chaos is used. Define scope, modes, guardrails, criteria, owner.
advanced: Required if chaos is used. Add blast radius and approvals and strict telemetry +
remediation linkage.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, envs, tooling, safety rule, abort metric,
blast radius, open_questions

If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If modes.fm_ids is UNKNOWN → block Completeness Gate (when used).
If guard.abort_conditions is UNKNOWN → block Completeness Gate (when used).
If success.criteria is UNKNOWN → block Completeness Gate (when used).
If telemetry.pass_rate_metric is UNKNOWN → block Completeness Gate (when used).
Completeness Gate
Gate ID: TMP-05.PRIMARY.LOAD
Pass conditions (when used):
required_fields_present == true
scope_defined == true
guardrails_defined == true
success_criteria_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LOAD-10

LOAD-10 — Re-run Cadence & Change Triggers
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Chaos tests must be safe, time-boxed, and have abort conditions.**
- Do not run chaos experiments in production without explicit approvals.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Scope`
2. `## Failure Modes`
3. `## Injection`
4. `## Guardrails`
5. `## Success Criteria`
6. `## Runbooks`
7. `## Ownership & Cadence`
8. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:RELIA-08}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IRP-06}}, {{xref:RELIA-09}} | OPTIONAL**
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
