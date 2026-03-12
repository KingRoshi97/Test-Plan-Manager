# ADMIN-01 — Admin Capabilities Matrix

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ADMIN-01                                             |
| Template Type     | Build / Admin Tools                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring admin capabilities matrix    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Admin Capabilities Matrix Document                         |

## 2. Purpose

Create the canonical matrix of admin/internal tool capabilities: what actions exist, who can
perform them, what scope they operate on, what audit requirements apply, and what
safeguards/rate limits must be enforced. This template must be consistent with AuthZ rules and
must not invent admin actions not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Capability registry (c... | spec         | Yes             |
| Capability description... | spec         | Yes             |
| Surface (admin UI, adm... | spec         | Yes             |
| Action binding (permis... | spec         | Yes             |
| Scope (global/org/proj... | spec         | Yes             |
| Risk class (low/med/hi... | spec         | Yes             |
| Safeguards required (c... | spec         | Yes             |
| Audit required (yes/no... | spec         | Yes             |
| Rate limits / abuse co... | spec         | Yes             |
| Implementation referen... | spec         | Yes             |

## 5. Optional Fields

Runbook/procedure pointers | OPTIONAL
UI location notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new permissions/roles; bind to {{xref:API-04}}.
Every capability MUST bind to a concrete implementation surface (endpoint/tool) or be marked
UNKNOWN and flagged.
High-risk capabilities SHOULD require extra safeguards (two-step confirm, approvals) unless
explicitly disallowed.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Audit requirements SHOULD bind to {{xref:ADMIN-03}} when available.
Output Format
1. Matrix Summary
total_capabilities: {{admin.matrix.total}}
surfaces: {{admin.matrix.surfaces}} | OPTIONAL
risk_classes_in_use: {{admin.matrix.risk_classes}} | OPTIONAL
notes: {{admin.matrix.notes}} | OPTIONAL
2. Capability Entries (by capability_id)
Capability
capability_id: {{capabilities[0].capability_id}}
name: {{capabilities[0].name}}
description: {{capabilities[0].description}}
surface: {{capabilities[0].surface}}
action_binding: {{capabilities[0].action_binding}} (perm/action_id)
scope: {{capabilities[0].scope}}
risk_class: {{capabilities[0].risk_class}}
safeguards: {{capabilities[0].safeguards}}
audit_required: {{capabilities[0].audit_required}}
audit_ref: {{capabilities[0].audit_ref}} | OPTIONAL
rate_limit_ref: {{capabilities[0].rate_limit_ref}} | OPTIONAL
implementation_refs: {{capabilities[0].implementation_refs}} (e.g., endpoint_id(s) from
{{xref:API-01}})
runbook_ref: {{capabilities[0].runbook_ref}} | OPTIONAL
ui_location: {{capabilities[0].ui_location}} | OPTIONAL
open_questions:
{{capabilities[0].open_questions[0]}} | OPTIONAL
(Repeat the “Capability” block for each capability_id.)
3. References
Privileged surface catalog: {{xref:ADMIN-05}} | OPTIONAL
Audit trail spec: {{xref:ADMIN-03}} | OPTIONAL
Moderation/support tools: {{xref:ADMIN-02}} | OPTIONAL
Admin observability/safeguards: {{xref:ADMIN-06}} | OPTIONAL

AuthZ rules: {{xref:API-04}} | OPTIONAL
Rate limit policy: {{xref:RLIM-01}} | OPTIONAL
Cross-References
Upstream: {{xref:API-01}}, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ADMIN-02}}, {{xref:ADMIN-03}}, {{xref:ADMIN-05}}, {{xref:ADMIN-06}} |
OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}}
| OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN where implementations are missing; do not invent
permissions.
intermediate: Required. Populate safeguards/audit/risk classes and bind to endpoints.
advanced: Required. Add runbook pointers and strong controls for critical capabilities.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, surfaces/risk class summaries, audit_ref,
rate_limit_ref, runbook_ref, ui_location, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If capability_id list is UNKNOWN → block Completeness Gate.
If action_binding is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ADMIN
Pass conditions:
required_fields_present == true
all capability_ids are unique
no new permissions/roles introduced (binds to API-04)
placeholder_resolution == true
no_unapproved_unknowns == true

ADMIN-02

ADMIN-02 — Moderation/Support Tools Spec (queues, actions)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new permissions/roles; bind to {{xref:API-04}}.
- **Every capability MUST bind to a concrete implementation surface (endpoint/tool) or be marked**
- **UNKNOWN and flagged.**
- **High-risk capabilities SHOULD require extra safeguards (two-step confirm, approvals) unless**
- **explicitly disallowed.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Audit requirements SHOULD bind to {{xref:ADMIN-03}} when available.**

## 7. Output Format

### Required Headings (in order)

1. `## Matrix Summary`
2. `## Capability Entries (by capability_id)`
3. `## Capability`
4. `## open_questions:`
5. `## (Repeat the “Capability” block for each capability_id.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:API-01}}, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ADMIN-02}}, {{xref:ADMIN-03}}, {{xref:ADMIN-05}}, {{xref:ADMIN-06}} |**
- OPTIONAL
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}}
- | OPTIONAL

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
