# ADMIN-05 — Privileged API Surface Catalog (endpoints + authz)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ADMIN-05                                             |
| Template Type     | Build / Admin Tools                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring privileged api surface catalog (endpoints + authz)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Privileged API Surface Catalog (endpoints + authz) Document                         |

## 2. Purpose

Create the canonical catalog of privileged/admin API endpoints, including endpoint identifiers,
operations, required permissions, ABAC constraints, risk class, audit requirements, and
safeguards. This template must be consistent with API endpoint specs and AuthZ rules and
must not invent endpoint IDs not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- API-02 Endpoint Specs: {{api.endpoint_specs}}
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- ADMIN-01 Capabilities Matrix: {{admin.capabilities}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Privileged endpoints list (endpoint_id list)
Endpoint path/method (or route_id)
Purpose/description
Required permissions/roles
ABAC constraints (tenant/env)
Risk class (low/med/high/critical)
Audit required (yes/no) and audit ref
Safeguards (confirmations, approvals)
Rate limit policy for privileged surface
Error mapping reference (API-03)

Optional Fields
Concealment policy (403 vs 404) | OPTIONAL
Two-person approval requirement | OPTIONAL
Runbook pointer | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not invent endpoint_ids; use only those in {{xref:API-01}}.
AuthZ MUST bind to {{xref:API-04}}; audit MUST bind to {{xref:ADMIN-03}} when present.
High-risk endpoints SHOULD have safeguards unless explicitly disallowed.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Catalog Summary
total_privileged_endpoints: {{catalog.total}}
risk_classes_in_use: {{catalog.risk_classes}} | OPTIONAL
surfaces: {{catalog.surfaces}} | OPTIONAL
notes: {{catalog.notes}} | OPTIONAL
2. Privileged Endpoint Entries (by endpoint_id)
Endpoint
endpoint_id: {{endpoints[0].endpoint_id}}
method: {{endpoints[0].method}}
path: {{endpoints[0].path}}
name: {{endpoints[0].name}} | OPTIONAL
description: {{endpoints[0].description}}
risk_class: {{endpoints[0].risk_class}}
required_permissions: {{endpoints[0].required_permissions}}
abac_constraints: {{endpoints[0].abac_constraints}}
deny_behavior: {{endpoints[0].deny_behavior}} | OPTIONAL
audit_required: {{endpoints[0].audit_required}}
audit_ref: {{endpoints[0].audit_ref}} | OPTIONAL
safeguards: {{endpoints[0].safeguards}}
rate_limit_ref: {{endpoints[0].rate_limit_ref}} | OPTIONAL
error_policy_ref: {{endpoints[0].error_policy_ref}} | OPTIONAL
implementation_notes: {{endpoints[0].implementation_notes}} | OPTIONAL
runbook_ref: {{endpoints[0].runbook_ref}} | OPTIONAL
open_questions:
{{endpoints[0].open_questions[0]}} | OPTIONAL
(Repeat the “Endpoint” block for each privileged endpoint_id.)

3. References
Endpoint catalog: {{xref:API-01}}
Endpoint specs: {{xref:API-02}}
AuthZ rules: {{xref:API-04}} | OPTIONAL
Audit trail: {{xref:ADMIN-03}} | OPTIONAL
Admin capabilities: {{xref:ADMIN-01}} | OPTIONAL
Admin safeguards: {{xref:ADMIN-06}} | OPTIONAL
Rate limits: {{xref:RLIM-01}} | OPTIONAL
Cross-References
Upstream: {{xref:API-01}}, {{xref:API-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ADMIN-06}} | OPTIONAL, {{xref:RUNBOOK-ADMIN}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-SECURITY]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN where risk/audit/safeguards are missing; do not invent
endpoint IDs.
intermediate: Required. Bind authz/audit and specify ABAC constraints.
advanced: Required. Add runbooks and two-person approval for critical endpoints if applicable.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, name, deny_behavior, audit_ref,
rate_limit_ref, error_policy_ref, implementation_notes, runbook_ref, two-person approvals,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If endpoints list is UNKNOWN → block Completeness Gate.
If required_permissions is UNKNOWN → block Completeness Gate.
If audit_required is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ADMIN
Pass conditions:
required_fields_present == true
all endpoint_ids exist in API-01 (no new IDs introduced)
authz_constraints_defined == true
audit_requirements_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ADMIN-06

ADMIN-06 — Admin Observability & Safeguards (rate limits, alerts)
Header Block

## 5. Optional Fields

Concealment policy (403 vs 404) | OPTIONAL
Two-person approval requirement | OPTIONAL
Runbook pointer | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent endpoint_ids; use only those in {{xref:API-01}}.
- **AuthZ MUST bind to {{xref:API-04}}; audit MUST bind to {{xref:ADMIN-03}} when present.**
- **High-risk endpoints SHOULD have safeguards unless explicitly disallowed.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Catalog Summary`
2. `## Privileged Endpoint Entries (by endpoint_id)`
3. `## Endpoint`
4. `## open_questions:`
5. `## (Repeat the “Endpoint” block for each privileged endpoint_id.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:API-01}}, {{xref:API-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ADMIN-06}} | OPTIONAL, {{xref:RUNBOOK-ADMIN}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

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
