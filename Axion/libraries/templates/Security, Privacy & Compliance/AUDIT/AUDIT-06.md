# AUDIT-06 — Investigation Workflow (queries, exports, chain-of-custody)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-06                                             |
| Template Type     | Security / Audit                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring investigation workflow (queries, exports, chain-of-custody)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Investigation Workflow (queries, exports, chain-of-custody) Document                         |

## 2. Purpose

Define the canonical workflow for investigating security/privacy incidents using audit logs: who
can query, how queries are recorded, how evidence is exported, and how chain-of-custody is
maintained. This template must align with incident response plans and audit access controls.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit retention/access: {{xref:AUDIT-05}} | OPTIONAL
- Incident response: {{xref:SEC-05}} | OPTIONAL
- Forensics runbooks: {{xref:AUDIT-10}} | OPTIONAL
- Support tools: {{xref:ADMIN-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Investigation roles (w... | spec         | Yes             |
| Case/ticket model (cas... | spec         | Yes             |
| Query rules (how to qu... | spec         | Yes             |
| Query logging rule (re... | spec         | Yes             |
| Export rules (formats,... | spec         | Yes             |
| Chain-of-custody rule ... | spec         | Yes             |
| Evidence storage rule ... | spec         | Yes             |
| Time sync rule (timest... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Standard query library | OPTIONAL
External counsel handoff rules | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Investigations must be auditable; queries and exports must be tracked.
Evidence exports must be integrity-protected (hash/sign).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Roles
investigator_roles: {{roles.investigators}}
approver_roles: {{roles.approvers}} | OPTIONAL
2. Case Model
case_id_format: {{case.id_format}}
case_fields: {{case.fields}} | OPTIONAL
3. Querying
tools: {{query.tools}}
query_rule: {{query.rule}}
4. Query Logging
log_rule: {{query.log_rule}}
log_fields: {{query.log_fields}} | OPTIONAL
5. Exports
export_formats: {{export.formats}}
approval_required: {{export.approval_required}}
approval_rule: {{export.approval_rule}} | OPTIONAL
6. Chain of Custody
integrity_rule: {{coc.integrity_rule}}
hash_algo: {{coc.hash_algo}} | OPTIONAL
signature_rule: {{coc.signature_rule}} | OPTIONAL
7. Evidence Storage
storage_location: {{evidence.storage_location}}
access_rule: {{evidence.access_rule}} | OPTIONAL
8. Time Sync
timezone_rule: {{time.timezone_rule}}
clock_sync_rule: {{time.clock_sync_rule}} | OPTIONAL
9. Telemetry
cases_opened_metric: {{telemetry.cases_opened_metric}}
exports_metric: {{telemetry.exports_metric}} | OPTIONAL
10.References
Audit access controls: {{xref:AUDIT-05}} | OPTIONAL
Incident response: {{xref:SEC-05}} | OPTIONAL
Forensics runbooks: {{xref:AUDIT-10}} | OPTIONAL
Cross-References
Upstream: {{xref:AUDIT-05}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:AUDIT-09}}, {{xref:SEC-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define roles, query rule, export formats, and evidence storage.
intermediate: Required. Define query logging, approvals, and chain-of-custody.
advanced: Required. Add standard query library and counsel handoff rules and integrity
automation.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, approver roles, case fields, log fields,
approval rule, hash/signature details, access rule, clock sync, optional metrics, query
library/counsel rules, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If roles.investigators is UNKNOWN → block Completeness Gate.
If query.rule is UNKNOWN → block Completeness Gate.
If export.formats is UNKNOWN → block Completeness Gate.
If coc.integrity_rule is UNKNOWN → block Completeness Gate.
If telemetry.cases_opened_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.AUDIT
Pass conditions:
required_fields_present == true
roles_and_case_model_defined == true
query_and_logging_defined == true
exports_and_chain_of_custody_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

AUDIT-07

AUDIT-07 — Admin/Privileged Actions Audit (special handling)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Investigations must be auditable; queries and exports must be tracked.**
- **Evidence exports must be integrity-protected (hash/sign).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Roles`
2. `## Case Model`
3. `## Querying`
4. `## Query Logging`
5. `## Exports`
6. `## Chain of Custody`
7. `## Evidence Storage`
8. `## Time Sync`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:AUDIT-05}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:AUDIT-09}}, {{xref:SEC-10}} | OPTIONAL**
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
