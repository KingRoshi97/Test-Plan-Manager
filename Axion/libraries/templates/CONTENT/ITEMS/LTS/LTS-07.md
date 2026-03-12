# LTS-07 — Audit vs App Logs Boundary (what goes where)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LTS-07                                             |
| Template Type     | Operations / Logging & Tracing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring audit vs app logs boundary (what goes where)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Audit vs App Logs Boundary (what goes where) Document                         |

## 2. Purpose

Define the canonical boundary between audit logs (security/compliance evidence) and
application logs (debug/ops): what events must be emitted as AUDIT events, what can remain
in app logs, duplication rules, and retention/access implications. This reduces compliance risk
and avoids missing critical evidence.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit event catalog: {{xref:AUDIT-01}} | OPTIONAL
- Audit schema: {{xref:AUDIT-02}} | OPTIONAL
- Logging standard: {{xref:LTS-01}} | OPTIONAL
- Admin audit trail: {{xref:ADMIN-03}} | OPTIONAL
- Audit capture rules: {{xref:AUDIT-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Definition of audit log vs app log
Event classification rules (security, admin, payment, data access)
Must-be-audit events list (event_type refs)
Allowed-in-app-log events list (log_event refs)
Duplication rule (when both emitted)
PII constraints (audit may include minimal identifiers, app logs stricter)
Access control implications (who can read audit vs app logs)
Retention implications (audit long, app shorter)
Implementation guidance (where instrumentation happens)
Telemetry requirements (misclassified events count)

Optional Fields
Examples (audit vs app log examples) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Privileged actions and authorization decisions should be AUDIT, not app-only logs.
Do not copy full audit payloads into app logs.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Definitions
audit_log_definition: {{defs.audit}}
app_log_definition: {{defs.app}}
2. Classification Rules
rules: {{class.rules}}
3. Must-Be-Audit
event_types: {{audit.must_event_types}}
4. Allowed-in-App
log_events: {{app.allowed_log_events}}
5. Duplication
dup_rule: {{dup.rule}}
6. PII Constraints
audit_pii_rule: {{pii.audit_rule}}
app_pii_rule: {{pii.app_rule}} | OPTIONAL
7. Access & Retention
audit_access_ref: {{xref:AUDIT-05}} | OPTIONAL
app_log_storage_ref: {{xref:LTS-05}} | OPTIONAL
retention_rule: {{retain.rule}}
8. Implementation Guidance
capture_points: {{impl.capture_points}}
anti_duplication_rule: {{impl.anti_dup_rule}} | OPTIONAL
9. Telemetry
misclassification_metric: {{telemetry.misclassification_metric}}
10.References
Audit catalog: {{xref:AUDIT-01}} | OPTIONAL
Audit schema: {{xref:AUDIT-02}} | OPTIONAL
Capture rules: {{xref:AUDIT-03}} | OPTIONAL
Cross-References
Upstream: {{xref:AUDIT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:LTS-05}}, {{xref:AUDIT-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define definitions and must-be-audit list and retention rule.
intermediate: Required. Define classification rules, duplication, access implications, telemetry.
advanced: Required. Add examples and strict guidance for preventing audit payload duplication
into app logs.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, app pii rule, access refs, anti-dup rule,
examples, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If defs.audit is UNKNOWN → block Completeness Gate.
If audit.must_event_types is UNKNOWN → block Completeness Gate.
If class.rules is UNKNOWN → block Completeness Gate.
If retain.rule is UNKNOWN → block Completeness Gate.
If telemetry.misclassification_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LTS
Pass conditions:
required_fields_present == true
definitions_defined == true
classification_defined == true
retention_and_access_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LTS-08

LTS-08 — Log Volume Controls (sampling, rate limits)
Header Block

## 5. Optional Fields

Examples (audit vs app log examples) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Privileged actions and authorization decisions should be AUDIT, not app-only logs.**
- Do not copy full audit payloads into app logs.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Definitions`
2. `## Classification Rules`
3. `## Must-Be-Audit`
4. `## Allowed-in-App`
5. `## Duplication`
6. `## PII Constraints`
7. `## Access & Retention`
8. `## Implementation Guidance`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:AUDIT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LTS-05}}, {{xref:AUDIT-09}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define definitions and must-be-audit list and retention rule.**
- **intermediate: Required. Define classification rules, duplication, access implications, telemetry.**
- **advanced: Required. Add examples and strict guidance for preventing audit payload duplication**
- into app logs.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, app pii rule, access refs, anti-dup rule,**
- examples, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If defs.audit is UNKNOWN → block

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
