# SLO-04 — Error Budget Policy (burn rates, actions)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SLO-04                                             |
| Template Type     | Operations / SLOs & Reliability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring error budget policy (burn rates, actions)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Error Budget Policy (burn rates, actions) Document                         |

## 2. Purpose

Define the canonical policy for error budgets: how budgets are calculated, what burn rates
mean, and what actions are required when budgets are consumed. This template links reliability
targets to release/change decisions and incident response.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SLO overview: {{xref:SLO-01}} | OPTIONAL
- Service SLO catalog: {{xref:SLO-02}} | OPTIONAL
- Alerting overview: {{xref:ALRT-01}} | OPTIONAL
- Change risk classification: {{xref:REL-08}} | OPTIONAL
- Postmortem template: {{xref:IRP-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Budget calculation rule (per SLO/window)
Budget states (healthy/warn/breached)
Burn rate definition (fast/slow burn)
Burn alert triggers (SLO-07 linkage)
Actions per state (freeze, reduce risk, focus on reliability)
Release policy interaction (REL refs)
Exception rule (when can ship despite breach)
Ownership (who enforces)
Review cadence (weekly/monthly)
Telemetry requirements (budget remaining, burn rate)

Optional Fields
Service tiering (critical vs standard) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Actions must be concrete and enforceable (not aspirational).
Exceptions must be explicit and time-bound.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Calculation
calc_rule: {{calc.rule}}
window_rule: {{calc.window_rule}} | OPTIONAL
2. States
states: {{states.list}}
thresholds: {{states.thresholds}} | OPTIONAL
3. Burn Rates
definition: {{burn.definition}}
fast_burn_rule: {{burn.fast_rule}} | OPTIONAL
slow_burn_rule: {{burn.slow_rule}} | OPTIONAL
4. Burn Alerts
burn_alert_ref: {{xref:SLO-07}} | OPTIONAL
trigger_rule: {{alerts.trigger_rule}}
5. Actions
healthy_actions: {{actions.healthy}}
warn_actions: {{actions.warn}}
breach_actions: {{actions.breach}}
6. Release Interaction
release_rule: {{release.rule}}
change_risk_ref: {{xref:REL-08}} | OPTIONAL
7. Exceptions
exception_rule: {{exceptions.rule}}
exceptions_ref: {{xref:COMP-08}} | OPTIONAL
8. Ownership & Cadence
owner: {{owner.team}}
review_cadence: {{review.cadence}}
9. Telemetry
budget_remaining_metric: {{telemetry.budget_remaining_metric}}
burn_rate_metric: {{telemetry.burn_rate_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:SLO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:SLO-07}}, {{xref:REL-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define states and actions and review cadence and owner.
intermediate: Required. Define burn rate triggers, release interaction, telemetry metrics.
advanced: Required. Add tiering and strict exceptions governance with auditability and
postmortem linkage.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, window rule, thresholds, fast/slow rules,
burn alert ref, change risk ref, exceptions ref, optional metric, tiering, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If calc.rule is UNKNOWN → block Completeness Gate.
If states.list is UNKNOWN → block Completeness Gate.
If actions.breach is UNKNOWN → block Completeness Gate.
If review.cadence is UNKNOWN → block Completeness Gate.
If telemetry.budget_remaining_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SLO
Pass conditions:
required_fields_present == true
calculation_defined == true
states_and_actions_defined == true
release_and_exceptions_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SLO-05

SLO-05 — SLA Commitments (external, contracts)
Header Block

## 5. Optional Fields

Service tiering (critical vs standard) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Actions must be concrete and enforceable (not aspirational).**
- **Exceptions must be explicit and time-bound.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Calculation`
2. `## States`
3. `## Burn Rates`
4. `## Burn Alerts`
5. `## Actions`
6. `## Release Interaction`
7. `## Exceptions`
8. `## Ownership & Cadence`
9. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:SLO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SLO-07}}, {{xref:REL-09}} | OPTIONAL**
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
