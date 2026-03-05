# PRIV-06 — Data Sharing Map (internal/external recipients)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-06                                             |
| Template Type     | Security / Privacy                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data sharing map (internal/external recipients)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Sharing Map (internal/external recipients) Document                         |

## 2. Purpose

Define the canonical map of data sharing: what data is shared, with whom (internal services and
external vendors), for what purpose, and under what constraints. This template must align with
integration inventories and PII tiering.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Integration inventory: {{xref:IXS-01}} | OPTIONAL
- Payments providers: {{xref:PAY-01}} | OPTIONAL
- Notification providers: {{xref:NOTIF-02}} | OPTIONAL
- Storage providers: {{xref:FMS-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Sharing registry (share_id list)
share_id (stable identifier)
data_class/entity binding (PRIV-01 refs)
Recipient type (internal_service/external_vendor)
Recipient identifier (service_id/provider_id)
Data fields shared (minimized)
Purpose (why shared)
Legal/consent requirement (PRIV-04 ref)
Transmission method (API/webhook/batch)
Retention expectations at recipient (if known)
Telemetry requirements (sharing events, failures)

Optional Fields
DPA reference (COMP-05) | OPTIONAL
Regional constraints | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Share the minimum necessary data; avoid sharing high-tier PII unless required.
Each external share should have a DPA/record pointer where applicable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Sharing Summary
total_shares: {{meta.total}}
external_shares: {{meta.external}} | OPTIONAL
2. Sharing Entries (repeat per share_id)
Share
share_id: {{shares[0].share_id}}
data_binding: {{shares[0].data_binding}}
recipient_type: {{shares[0].recipient_type}}
recipient_id: {{shares[0].recipient_id}}
fields_shared: {{shares[0].fields_shared}}
purpose: {{shares[0].purpose}}
consent_ref: {{shares[0].consent_ref}} (expected: {{xref:PRIV-04}}) | OPTIONAL
method: {{shares[0].method}}
recipient_retention: {{shares[0].recipient_retention}} | OPTIONAL
dpa_ref: {{shares[0].dpa_ref}} | OPTIONAL
region_constraints: {{shares[0].region_constraints}} | OPTIONAL
telemetry_metric: {{shares[0].telemetry_metric}}
open_questions:
{{shares[0].open_questions[0]}} | OPTIONAL
(Repeat per share.)
3. References
Data inventory: {{xref:PRIV-01}} | OPTIONAL
Consent model: {{xref:PRIV-04}} | OPTIONAL
DPA records: {{xref:COMP-05}} | OPTIONAL
Cross-References
Upstream: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COMP-05}}, {{xref:PRIV-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define share registry, recipient IDs, purposes, and minimized fields.
intermediate: Required. Add consent refs/methods and telemetry and retention expectations.
advanced: Required. Add DPA refs, regional constraints, and stricter minimization enforcement
notes.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, consent ref, recipient retention, dpa ref,
region constraints, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If shares[].share_id is UNKNOWN → block Completeness Gate.
If shares[].fields_shared is UNKNOWN → block Completeness Gate.
If shares[].purpose is UNKNOWN → block Completeness Gate.
If shares[].method is UNKNOWN → block Completeness Gate.
If shares[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PRIV
Pass conditions:
required_fields_present == true
share_registry_defined == true
fields_and_purposes_defined == true
recipients_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PRIV-07

PRIV-07 — Privacy by Design Checklist (gates, reviews)
Header Block

## 5. Optional Fields

DPA reference (COMP-05) | OPTIONAL
Regional constraints | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Share the minimum necessary data; avoid sharing high-tier PII unless required.**
- Each external share should have a DPA/record pointer where applicable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Sharing Summary`
2. `## Sharing Entries (repeat per share_id)`
3. `## Share`
4. `## open_questions:`
5. `## (Repeat per share.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COMP-05}}, {{xref:PRIV-09}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define share registry, recipient IDs, purposes, and minimized fields.**
- **intermediate: Required. Add consent refs/methods and telemetry and retention expectations.**
- **advanced: Required. Add DPA refs, regional constraints, and stricter minimization enforcement**
- notes.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, consent ref, recipient retention, dpa ref,**
- region constraints, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If shares[].share_id is UNKNOWN → block

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
