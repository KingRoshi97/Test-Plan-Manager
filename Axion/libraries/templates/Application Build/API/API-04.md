# API-04 — AuthZ Rules (RBAC/ABAC checks)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-04                                             |
| Template Type     | Build / API                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring authz rules (rbac/abac checks)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled AuthZ Rules (RBAC/ABAC checks) Document                         |

## 2. Purpose

Define the single, canonical authorization model for the application API surface: what
roles/permissions exist (RBAC), what contextual constraints apply (ABAC), how endpoint
specs reference these rules, and how denials are handled. This document must not invent
roles, permissions, or scopes that are not present in upstream inputs; any missing required
elements must be marked UNKNOWN.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- API-02 Endpoint Specs: {{api.endpoint_specs}}
- API-03 Error & Status Code Policy: {{api.error_policy}}
- SEC-01 Authentication: {{sec.authn}}
- SEC-02 Security / Policy Controls: {{sec.authz_inputs}} | OPTIONAL
- ADMIN-05 Privileged API Surface Catalog: {{admin.privileged_surface}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| AuthZ model statement ... | spec         | Yes             |
| Roles registry (role I... | spec         | Yes             |
| Permissions registry (... | spec         | Yes             |
| Role → permission mapp... | spec         | Yes             |
| Deny behavior policy (... | spec         | Yes             |
| Admin override policy ... | spec         | Yes             |
| Audit/evidence require... | spec         | Yes             |

## 5. Optional Fields

Service-to-service authz rules | OPTIONAL
Impersonation rules | OPTIONAL
Break-glass / emergency access rules | OPTIONAL
Two-person approval policy for high-risk actions | OPTIONAL
Row-level security notes (DB-level enforcement) | OPTIONAL
WebSocket/RPC authz mapping notes | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Must use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not introduce new role IDs or permission IDs. Use only what exists in: {{spec.roles_by_id}}
- **and {{spec.permissions_by_id}} | OPTIONAL**
- **Every endpoint spec (API-02) MUST reference AuthZ using the binding format defined here.**
- **ABAC rules MUST be deterministic and evaluable from available principal/resource/context**
- **fields (no “human judgment” predicates).**
- **Tenant isolation is a hard rule: cross-tenant access MUST be denied unless explicitly defined**
- **as allowed in inputs.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- If deny behavior uses concealment (404), the concealment rule MUST be stable per resource
- **type (not ad-hoc per endpoint).**
- All privileged actions MUST emit audit evidence per this doc (or be marked UNKNOWN and
- **flagged).**

## 7. Output Format

### Required Headings (in order)

1. `## AuthZ Model (Canonical)`
2. `## Decision rule (normative):`
3. `## ALLOW iff (RBAC allows) AND (ABAC passes)`
4. `## Otherwise DENY.`
5. `## Principal (Identity/Claims) Model`
6. `## Principal fields available for authz decisions:`
7. `## Resource Scope Model`
8. `## Define the scope boundaries used for ABAC:`
9. `## Resource types covered (minimum):`
10. `## OPTIONAL`

## 8. Cross-References

- **Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:API-01}}, {{xref:API-02}}, {{xref:SEC-01}} |**
- **OPTIONAL, {{xref:STANDARDS_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ADMIN-01}} | OPTIONAL, {{xref:ADMIN-05}} | OPTIONAL, {{xref:QA-02}} |**
- **OPTIONAL, {{xref:QA-03}} | OPTIONAL**
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
