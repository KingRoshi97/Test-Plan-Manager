# LTS-10 — Logging Runbooks (common issues)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LTS-10                                             |
| Template Type     | Operations / Logging & Tracing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring logging runbooks (common issues)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Logging Runbooks (common issues) Document                         |

## 2. Purpose

Define the canonical operational runbooks for logging incidents and common failures: log
storms, missing correlation IDs, redaction leaks, sink ingest failures, and noisy services. This
template provides step-by-step response procedures.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Log volume controls: {{xref:LTS-08}} | OPTIONAL
- Logging verification: {{xref:LTS-09}} | OPTIONAL
- Log routing/storage: {{xref:LTS-05}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- Incident workflow: {{xref:IRP-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Runbook registry (runbook_id list)
runbook_id (stable identifier)
Scenario type (storm/missing_fields/leak/ingest_fail)
Trigger signals (alerts/metrics)
Triage steps (ordered)
Containment steps (ordered)
Verification steps (prove fixed)
Escalation rules (who to page)
Post-incident follow-ups (prevent recurrence)
Telemetry requirements (runbook invoked, time-to-contain)

Optional Fields
Automation hooks | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Runbooks must be executable and ordered; no vague steps.
Containment must prefer safe actions (reduce volume, preserve evidence).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_runbooks: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Runbooks (repeat)
Runbook
runbook_id: {{books[0].runbook_id}}
scenario: {{books[0].scenario}}
triggers: {{books[0].triggers}}
triage_steps:
{{books[0].triage_steps[0]}}
{{books[0].triage_steps[1]}}
containment_steps:
{{books[0].containment_steps[0]}}
{{books[0].containment_steps[1]}} | OPTIONAL
verification_steps: {{books[0].verification_steps}}
escalation_rule: {{books[0].escalation_rule}}
followups: {{books[0].followups}} | OPTIONAL
telemetry_metric: {{books[0].telemetry_metric}}
automation_hooks: {{books[0].automation_hooks}} | OPTIONAL
open_questions:
{{books[0].open_questions[0]}} | OPTIONAL
(Repeat per runbook.)
3. References
Log routing: {{xref:LTS-05}} | OPTIONAL
Volume controls: {{xref:LTS-08}} | OPTIONAL
Verification gates: {{xref:LTS-09}} | OPTIONAL
Incident workflow: {{xref:IRP-02}} | OPTIONAL
Cross-References
Upstream: {{xref:LTS-08}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:IRP-06}}, {{xref:COST-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define at least core runbooks with triage/contain/verify steps.
intermediate: Required. Add escalation and follow-ups and telemetry metrics.
advanced: Required. Add automation hooks and tighter trigger mapping + evidence
preservation.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, optional containment step,
followups, automation hooks, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If books[].runbook_id is UNKNOWN → block Completeness Gate.
If books[].triage_steps[0] is UNKNOWN → block Completeness Gate.
If books[].containment_steps[0] is UNKNOWN → block Completeness Gate.
If books[].verification_steps is UNKNOWN → block Completeness Gate.
If books[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LTS
Pass conditions:
required_fields_present == true
runbooks_defined == true
triage_and_containment_defined == true
verification_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Monitoring & Alerting (ALRT)

ALRT-01

ALRT-01 — Alerting Overview (principles, severity model)
Header Block

## 5. Optional Fields

Automation hooks | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Runbooks must be executable and ordered; no vague steps.**
- **Containment must prefer safe actions (reduce volume, preserve evidence).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Runbooks (repeat)`
3. `## Runbook`
4. `## triage_steps:`
5. `## containment_steps:`
6. `## open_questions:`
7. `## (Repeat per runbook.)`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:LTS-08}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IRP-06}}, {{xref:COST-10}} | OPTIONAL**
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
