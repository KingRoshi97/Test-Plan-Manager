# COMP-05 — Data Processing Agreements & Records (RoPA, DPA pointers)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-05                                             |
| Template Type     | Security / Compliance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data processing agreements & records (ropa, dpa pointers)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Processing Agreements & Records (RoPA, DPA pointers) Document                         |

## 2. Purpose

Define the canonical record-keeping for data processing: RoPA-style records of processing,
DPA pointers per vendor, and where these records live. This template must align with data
sharing maps and vendor risk processes.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data sharing map: {{xref:PRIV-06}} | OPTIONAL
- Vendor risk management: {{xref:COMP-03}} | OPTIONAL
- Integration inventory: {{xref:IXS-01}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Processing record registry (record_id list)
record_id (stable identifier)
Processing activity name
Data categories processed (data_class refs)
Purpose (why)
Recipients/vendors (provider_id/service_id)
Legal basis/consent ref (if applicable)
Retention policy ref (PRIV-05)
DPA pointer (where DPA stored)
Owner (who maintains record)
Review cadence
Telemetry requirements (records complete, missing DPA)

Optional Fields
Cross-border transfer notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Every external processor should have a DPA pointer (or explicit exception).
Records must be kept current and review cadence enforced.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_records: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Records (repeat)
Record
record_id: {{records[0].record_id}}
activity_name: {{records[0].activity_name}}
data_categories: {{records[0].data_categories}}
purpose: {{records[0].purpose}}
recipients: {{records[0].recipients}}
legal_basis_ref: {{records[0].legal_basis_ref}} | OPTIONAL
retention_ref: {{records[0].retention_ref}} (expected: {{xref:PRIV-05}}) | OPTIONAL
dpa_pointer: {{records[0].dpa_pointer}}
owner: {{records[0].owner}}
review_cadence: {{records[0].review_cadence}}
telemetry_metric: {{records[0].telemetry_metric}}
transfer_notes: {{records[0].transfer_notes}} | OPTIONAL
open_questions:
{{records[0].open_questions[0]}} | OPTIONAL
(Repeat per record.)
3. References
Vendor risk: {{xref:COMP-03}} | OPTIONAL
Data sharing: {{xref:PRIV-06}} | OPTIONAL
Privacy retention: {{xref:PRIV-05}} | OPTIONAL
Cross-References
Upstream: {{xref:PRIV-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COMP-09}}, {{xref:COMP-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define records with purpose, recipients, and DPA pointers.
intermediate: Required. Add retention refs and cadence and telemetry.
advanced: Required. Add transfer notes and stricter completeness enforcement and exception
records.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, legal basis ref, retention ref, transfer
notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If records[].record_id is UNKNOWN → block Completeness Gate.
If records[].purpose is UNKNOWN → block Completeness Gate.
If records[].recipients is UNKNOWN → block Completeness Gate.
If records[].dpa_pointer is UNKNOWN → block Completeness Gate.
If records[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COMP
Pass conditions:
required_fields_present == true
records_defined == true
dpa_pointers_defined == true
cadence_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COMP-06

COMP-06 — Regulatory Requirements (CAN-SPAM, PCI, SOC2, HIPAA, etc.)
Header Block

## 5. Optional Fields

Cross-border transfer notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Every external processor should have a DPA pointer (or explicit exception).**
- **Records must be kept current and review cadence enforced.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Records (repeat)`
3. `## Record`
4. `## open_questions:`
5. `## (Repeat per record.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:PRIV-06}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COMP-09}}, {{xref:COMP-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define records with purpose, recipients, and DPA pointers.**
- **intermediate: Required. Add retention refs and cadence and telemetry.**
- **advanced: Required. Add transfer notes and stricter completeness enforcement and exception**
- records.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, legal basis ref, retention ref, transfer**
- notes, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If records[].record_id is UNKNOWN → block

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
