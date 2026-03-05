# COMP-04 — Policy & Training Requirements (who must do what)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-04                                             |
| Template Type     | Security / Compliance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring policy & training requirements (who must do what)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Policy & Training Requirements (who must do what) Document                         |

## 2. Purpose

Define the canonical set of policies and trainings required for the organization/team operating
this product: what must exist, who must complete training, cadence, and evidence of
completion. This template is used for audits and internal assurance.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Compliance scope: {{xref:COMP-01}} | OPTIONAL
- Secure SDLC policy: {{xref:SEC-07}} | OPTIONAL
- Privacy checklist: {{xref:PRIV-07}} | OPTIONAL
- Privileged access policy: {{xref:IAM-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Policy registry (polic... | spec         | Yes             |
| policy_id (stable iden... | spec         | Yes             |
| Policy name               | spec         | Yes             |
| Who is required (roles)   | spec         | Yes             |
| Training required (yes... | spec         | Yes             |
| Training cadence (annu... | spec         | Yes             |
| Evidence required (com... | spec         | Yes             |
| Owner (who maintains)     | spec         | Yes             |
| Enforcement rule (what... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

External vendor training requirements | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Policies must have owners and evidence requirements.
Privileged roles should have stricter training requirements.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_policies: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Policies (repeat)
Policy
policy_id: {{policies[0].policy_id}}
name: {{policies[0].name}}
required_roles: {{policies[0].required_roles}}
training_required: {{policies[0].training_required}}
training_cadence: {{policies[0].training_cadence}}
evidence: {{policies[0].evidence}}
owner: {{policies[0].owner}}
enforcement: {{policies[0].enforcement}}
telemetry_metric: {{policies[0].telemetry_metric}}
open_questions:
{{policies[0].open_questions[0]}} | OPTIONAL
(Repeat per policy.)
3. References
Secure SDLC: {{xref:SEC-07}} | OPTIONAL
Incident response: {{xref:SEC-05}} | OPTIONAL
Privacy checklist: {{xref:PRIV-07}} | OPTIONAL
Cross-References
Upstream: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COMP-09}}, {{xref:COMP-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define policy list, required roles, cadence, evidence.
intermediate: Required. Define enforcement rules and telemetry and ownership.
advanced: Required. Add vendor training and stricter privileged role coupling and audit-ready
evidence storage.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, open_questions, vendor training

If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If policies[].policy_id is UNKNOWN → block Completeness Gate.
If policies[].required_roles is UNKNOWN → block Completeness Gate.
If policies[].evidence is UNKNOWN → block Completeness Gate.
If policies[].owner is UNKNOWN → block Completeness Gate.
If telemetry requirements are UNKNOWN → block Completeness Gate (telemetry_metric per
policy).
Completeness Gate
Gate ID: TMP-05.PRIMARY.COMP
Pass conditions:
required_fields_present == true
policy_registry_defined == true
roles_and_cadence_defined == true
evidence_and_owners_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COMP-05

COMP-05 — Data Processing Agreements & Records (RoPA, DPA pointers)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Policies must have owners and evidence requirements.**
- **Privileged roles should have stricter training requirements.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Policies (repeat)`
3. `## Policy`
4. `## open_questions:`
5. `## (Repeat per policy.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COMP-09}}, {{xref:COMP-10}} | OPTIONAL**
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
