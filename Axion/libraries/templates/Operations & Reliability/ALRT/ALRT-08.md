# ALRT-08 — Alert Testing & Drills (synthetics, fire drills)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ALRT-08                                             |
| Template Type     | Operations / Alerting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring alert testing & drills (synthetics, fire drills)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Alert Testing & Drills (synthetics, fire drills) Document                         |

## 2. Purpose

Define the canonical approach for validating alerts and running drills: synthetics where
applicable, periodic fire drills, and verification that alerts page the right people and link to usable
runbooks. This template ensures alerting actually works before incidents.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- Alert rule spec: {{xref:ALRT-03}} | OPTIONAL
- Incident drills: {{xref:IRP-09}} | OPTIONAL
- Release quality gates: {{xref:QA-07}} | OPTIONAL
- SLO burn alerting: {{xref:SLO-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Testing types (synthet... | spec         | Yes             |
| Drill cadence (monthly... | spec         | Yes             |
| Drill scenarios list (... | spec         | Yes             |
| Success criteria (page... | spec         | Yes             |
| Synthetics coverage ru... | spec         | Yes             |
| Dry-run validation rul... | spec         | Yes             |
| Ownership (who runs dr... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Post-drill remediation... | spec         | Yes             |

## 5. Optional Fields

Game day notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Drills must be tracked and remediation assigned when failures occur.
Paging drills should be scheduled to avoid undue disruption.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Testing Types
types: {{tests.types}}
2. Cadence
cadence: {{cadence.value}}
3. Scenarios
scenarios: {{scenarios.list}}
4. Success Criteria
criteria: {{success.criteria}}
5. Synthetics
coverage_rule: {{synthetics.coverage_rule}}
tooling: {{synthetics.tooling}} | OPTIONAL
6. Dry Runs
dry_run_rule: {{dry.rule}}
7. Ownership
owner: {{owner.team}}
8. Telemetry
drill_pass_rate_metric: {{telemetry.pass_rate_metric}}
drill_ack_time_metric: {{telemetry.ack_time_metric}} | OPTIONAL
9. Remediation
workflow: {{fix.workflow}}
retest_rule: {{fix.retest_rule}} | OPTIONAL
Cross-References
Upstream: {{xref:ALRT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ALRT-10}}, {{xref:IRP-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define cadence, scenarios, success criteria, remediation workflow.
intermediate: Required. Define synthetics coverage, dry-run rule, telemetry.
advanced: Required. Add game day planning and stricter success criteria and tooling
integrations.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, synthetics tooling, ack metric, retest rule,
game day notes, open_questions
If any Required Field is UNKNOWN, allow only if:

{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If tests.types is UNKNOWN → block Completeness Gate.
If cadence.value is UNKNOWN → block Completeness Gate.
If scenarios.list is UNKNOWN → block Completeness Gate.
If success.criteria is UNKNOWN → block Completeness Gate.
If telemetry.pass_rate_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ALRT
Pass conditions:
required_fields_present == true
cadence_and_scenarios_defined == true
success_criteria_defined == true
remediation_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ALRT-09

ALRT-09 — Alert Dashboards (what to watch)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Drills must be tracked and remediation assigned when failures occur.**
- **Paging drills should be scheduled to avoid undue disruption.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Testing Types`
2. `## Cadence`
3. `## Scenarios`
4. `## Success Criteria`
5. `## Synthetics`
6. `## Dry Runs`
7. `## Ownership`
8. `## Telemetry`
9. `## Remediation`

## 8. Cross-References

- **Upstream: {{xref:ALRT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-10}}, {{xref:IRP-06}} | OPTIONAL**
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
