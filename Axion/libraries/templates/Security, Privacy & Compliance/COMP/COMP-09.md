# COMP-09 — Evidence Collection Plan (artifacts, cadence, storage)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-09                                             |
| Template Type     | Security / Compliance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring evidence collection plan (artifacts, cadence, storage)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Evidence Collection Plan (artifacts, cadence, storage) Document                         |

## 2. Purpose

Define the canonical plan for collecting and storing compliance evidence artifacts: what artifacts
are collected for which controls, how often, who collects them, and where they are stored. This
template must align with the control matrix and Secure SDLC evidence outputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Control matrix: {{xref:COMP-02}} | OPTIONAL
- Secure SDLC evidence outputs: {{xref:SEC-07}} | OPTIONAL
- Audit integrity: {{xref:AUDIT-04}} | OPTIONAL
- Privacy metrics/audits: {{xref:PRIV-10}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Evidence registry (evidence_id list)
evidence_id (stable identifier)
Linked control_id (COMP-02)
Artifact description (what is collected)
Source system/tool (CI, SIEM, ticketing)
Collection cadence
Owner/collector role
Storage location (bucket/wiki)
Integrity rule (hash/sign)
Access control rule (who can view)
Telemetry requirements (evidence collected on time)

Optional Fields
Automation support notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Evidence must be immutable or tamper-evident where feasible.
Cadence must be enforceable; missed collections must be visible.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_evidence_items: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Evidence Items (repeat)
Evidence
evidence_id: {{items[0].evidence_id}}
control_id: {{items[0].control_id}}
artifact: {{items[0].artifact}}
source: {{items[0].source}}
cadence: {{items[0].cadence}}
owner: {{items[0].owner}}
storage_location: {{items[0].storage_location}}
integrity_rule: {{items[0].integrity_rule}}
access_rule: {{items[0].access_rule}}
telemetry_metric: {{items[0].telemetry_metric}}
automation_notes: {{items[0].automation_notes}} | OPTIONAL
open_questions:
{{items[0].open_questions[0]}} | OPTIONAL
(Repeat per evidence.)
3. References
Control matrix: {{xref:COMP-02}} | OPTIONAL
Audit integrity: {{xref:AUDIT-04}} | OPTIONAL
Exception management: {{xref:COMP-08}} | OPTIONAL
Cross-References
Upstream: {{xref:COMP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COMP-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define evidence items with control linkage, cadence, storage.

intermediate: Required. Define integrity/access rules and telemetry metrics.
advanced: Required. Add automation notes and strict tamper-evidence alignment and
escalation for missed cadence.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, automation notes,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If items[].evidence_id is UNKNOWN → block Completeness Gate.
If items[].control_id is UNKNOWN → block Completeness Gate.
If items[].cadence is UNKNOWN → block Completeness Gate.
If items[].storage_location is UNKNOWN → block Completeness Gate.
If items[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COMP
Pass conditions:
required_fields_present == true
evidence_registry_defined == true
control_linkage_defined == true
cadence_and_storage_defined == true
integrity_and_access_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COMP-10

COMP-10 — Compliance Reporting & Audits (internal/external audits)
Header Block

## 5. Optional Fields

Automation support notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Evidence must be immutable or tamper-evident where feasible.**
- **Cadence must be enforceable; missed collections must be visible.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Evidence Items (repeat)`
3. `## Evidence`
4. `## open_questions:`
5. `## (Repeat per evidence.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:COMP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COMP-10}} | OPTIONAL**
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
