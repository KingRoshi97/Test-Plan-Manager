# PRIV-04 — Consent Model (capture, storage, enforcement)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-04                                             |
| Template Type     | Security / Privacy                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring consent model (capture, storage, enforcement)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Consent Model (capture, storage, enforcement) Document                         |

## 2. Purpose

Define the canonical consent model for the product: what consent types exist, how consent is
captured, stored, updated, and enforced across features (including communications
preferences). This template must align with notification preference rules and regulatory
requirements.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Notification preferences: {{xref:NOTIF-06}} | OPTIONAL
- Regulatory requirements: {{xref:COMP-06}} | OPTIONAL
- Route contract (consent UX surfaces): {{xref:ROUTE-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Consent types registry (consent_id list)
consent_id (stable identifier)
What the consent covers (data use / comms / tracking)
Capture points (screens/actions)
Proof fields stored (timestamp, source, user_id)
Withdrawal/update rules (how revoked)
Enforcement points (where checked)
Default state rule (opt-in/opt-out)
Retention rule for consent records
Telemetry requirements (consent changes, violations)

Optional Fields
Age-based consent rules | OPTIONAL
Per-jurisdiction overrides | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Consent enforcement must be server-side where relevant (not only UI).
Withdrawal must be honored promptly and consistently.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Consent Registry Summary
total_consents: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Consent Types (repeat per consent_id)
Consent
consent_id: {{consents[0].consent_id}}
covers: {{consents[0].covers}}
capture_points: {{consents[0].capture_points}}
proof_fields: {{consents[0].proof_fields}}
default_state: {{consents[0].default_state}} (opt_in/opt_out/UNKNOWN)
withdrawal_rule: {{consents[0].withdrawal_rule}}
enforcement_points: {{consents[0].enforcement_points}}
retention_policy: {{consents[0].retention_policy}}
telemetry_metric: {{consents[0].telemetry_metric}}
jurisdiction_overrides: {{consents[0].jurisdiction_overrides}} | OPTIONAL
age_rules: {{consents[0].age_rules}} | OPTIONAL
open_questions:
{{consents[0].open_questions[0]}} | OPTIONAL
(Repeat per consent.)
3. Telemetry
consent_violation_metric: {{telemetry.violation_metric}} | OPTIONAL
4. References
Notification preferences: {{xref:NOTIF-06}} | OPTIONAL
Security monitoring: {{xref:SEC-06}} | OPTIONAL
Regulatory requirements: {{xref:COMP-06}} | OPTIONAL
Cross-References
Upstream: {{xref:PRIV-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PRIV-06}}, {{xref:COMP-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define consent registry and withdrawal/enforcement points.
intermediate: Required. Define proof fields, retention, and telemetry metrics.
advanced: Required. Add jurisdiction/age overrides and strict enforcement mappings.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, jurisdiction/age rules,
consent violation metric, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If consents[].consent_id is UNKNOWN → block Completeness Gate.
If consents[].withdrawal_rule is UNKNOWN → block Completeness Gate.
If consents[].enforcement_points is UNKNOWN → block Completeness Gate.
If consents[].retention_policy is UNKNOWN → block Completeness Gate.
If consents[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PRIV
Pass conditions:
required_fields_present == true
consent_registry_defined == true
withdrawal_and_enforcement_defined == true
retention_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PRIV-05

PRIV-05 — Retention & Deletion Policy (TTL, DSAR, legal hold)
Header Block

## 5. Optional Fields

Age-based consent rules | OPTIONAL
Per-jurisdiction overrides | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Consent enforcement must be server-side where relevant (not only UI).**
- **Withdrawal must be honored promptly and consistently.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Consent Registry Summary`
2. `## Consent Types (repeat per consent_id)`
3. `## Consent`
4. `## open_questions:`
5. `## (Repeat per consent.)`
6. `## Telemetry`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:PRIV-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PRIV-06}}, {{xref:COMP-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define consent registry and withdrawal/enforcement points.**
- **intermediate: Required. Define proof fields, retention, and telemetry metrics.**
- **advanced: Required. Add jurisdiction/age overrides and strict enforcement mappings.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, jurisdiction/age rules,**
- consent violation metric, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If consents[].consent_id is UNKNOWN → block

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
