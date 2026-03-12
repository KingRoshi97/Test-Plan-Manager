# TMA-07 — Content/Message Abuse Controls (spam, harassment, scams)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-07                                             |
| Template Type     | Security / Threat Modeling                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring content/message abuse controls (spam, harassment, scams)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Content/Message Abuse Controls (spam, harassment, scams) Document                         |

## 2. Purpose

Define the canonical abuse controls for user-generated content and messaging:
spam/harassment/scam detection signals, enforcement actions, moderation workflows, and user
safety features. This template must align with abuse case catalog, admin/moderation tooling,
and enforcement matrices.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Abuse case catalog: {{xref:TMA-02}} | OPTIONAL
- Attack surface inventory: {{xref:TMA-03}} | OPTIONAL
- Support/moderation tools: {{xref:ADMIN-02}} | OPTIONAL
- Admin capabilities: {{xref:ADMIN-01}} | OPTIONAL
- Abuse signals: {{xref:RLIM-03}} | OPTIONAL
- Enforcement matrix: {{xref:RLIM-04}} | OPTIONAL
- Logging/redaction: {{xref:CER-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Abuse categories covered (spam/harassment/scams)
Detection signals list (heuristics, reports)
Rate limit ties (TMA-06 / RLIM refs)
User reporting flow (how users report)
Moderation workflow (queue, triage, actions)
Enforcement actions (mute/ban/throttle)
Appeals process (if enforcement occurs)
Evidence retention policy (message excerpts, hashes)
Privacy/redaction rules for content logs
Telemetry requirements (reports, actions taken, repeat offenders)

Optional Fields
Automated moderation support | OPTIONAL
Safety UX features (block user, keyword filters) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Do not store more user content than necessary for safety/audit.
Enforcement actions must be permissioned and auditable.
Appeals must exist for high-impact actions (ban) unless explicitly disallowed.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Categories
categories: {{abuse.categories}}
2. Detection Signals
signals: {{detect.signals}}
user_reports_signal: {{detect.user_reports_signal}} | OPTIONAL
3. Reporting Flow
report_entry_points: {{report.entry_points}}
report_fields: {{report.fields}} | OPTIONAL
4. Moderation Workflow
queue_model: {{mod.queue_model}}
steps: {{mod.steps}}
actions_supported: {{mod.actions_supported}} | OPTIONAL
5. Enforcement
enforcement_ref: {{enforce.ref}} (expected: {{xref:RLIM-04}}) | OPTIONAL
actions: {{enforce.actions}}
ban_threshold_rule: {{enforce.ban_threshold_rule}} | OPTIONAL
6. Appeals
appeals_supported: {{appeals.supported}}
appeals_process: {{appeals.process}} | OPTIONAL
7. Evidence & Retention
evidence_model: {{evidence.model}} (hash/excerpt/UNKNOWN)
retention_days: {{evidence.retention_days}}
redaction_rule: {{evidence.redaction_rule}} | OPTIONAL
8. Privacy / Logging
no_full_content_logging_rule: {{privacy.no_full_content_logging_rule}}
safe_fields: {{privacy.safe_fields}} | OPTIONAL
9. Telemetry
reports_metric: {{telemetry.reports_metric}}
actions_metric: {{telemetry.actions_metric}} | OPTIONAL
repeat_offender_metric: {{telemetry.repeat_offender_metric}} | OPTIONAL

10.References
Rate limit/bot defense: {{xref:TMA-06}} | OPTIONAL
Admin tools: {{xref:ADMIN-02}} | OPTIONAL
Audit trail: {{xref:ADMIN-03}} | OPTIONAL
Security runbooks: {{xref:SEC-10}} | OPTIONAL
Cross-References
Upstream: {{xref:TMA-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:AUDIT-01}}, {{xref:COMP-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define categories, reporting flow, and moderation steps and retention days.
intermediate: Required. Define enforcement and appeals and privacy rules and telemetry.
advanced: Required. Add automated moderation and safety UX features with strict evidence
minimization.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, reports signal, report fields, supported
actions, thresholds, appeals process, redaction/safe fields, optional metrics, automation/safety
UX, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If abuse.categories is UNKNOWN → block Completeness Gate.
If mod.steps is UNKNOWN → block Completeness Gate.
If evidence.retention_days is UNKNOWN → block Completeness Gate.
If privacy.no_full_content_logging_rule is UNKNOWN → block Completeness Gate.
If telemetry.reports_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.TMA
Pass conditions:
required_fields_present == true
categories_and_workflow_defined == true
evidence_and_privacy_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

TMA-08

TMA-08 — Fraud/Payment Abuse Controls (ties to PAY-08)
Header Block

## 5. Optional Fields

Automated moderation support | OPTIONAL
Safety UX features (block user, keyword filters) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Do not store more user content than necessary for safety/audit.
- **Enforcement actions must be permissioned and auditable.**
- **Appeals must exist for high-impact actions (ban) unless explicitly disallowed.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Categories`
2. `## Detection Signals`
3. `## Reporting Flow`
4. `## Moderation Workflow`
5. `## Enforcement`
6. `## Appeals`
7. `## Evidence & Retention`
8. `## Privacy / Logging`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:TMA-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:AUDIT-01}}, {{xref:COMP-06}} | OPTIONAL**
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
