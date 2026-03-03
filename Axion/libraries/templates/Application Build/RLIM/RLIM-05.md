# RLIM-05 — Exemptions & Allowlist Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLIM-05                                          |
| Template Type     | Build / Rate Limits                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring exemptions & allowlist po |
| Filled By         | Internal Agent                                   |
| Consumes          | RLIM-01                                          |
| Produces          | Filled Exemptions & Allowlist Policy             |

## 2. Purpose

Define the canonical policy for rate limit exemptions and allowlists: what can be exempted, who can grant exemptions, how exemptions are scoped and time-bounded, how they are audited, and how exemptions interact with abuse enforcement. This template must be consistent with the global rate limit policy and must not invent exemption powers not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}}
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Exemption scope types (principal/route/surface/tenant/project/ip range) | spec | No |
| Allowlist entry schema (fields required for an exemption record) | spec | No |
| Grant policy (who can grant, required permissions) | spec | No |
| Duration policy (permanent vs expiring; max duration) | spec | No |
| Review/renewal policy (periodic review) | spec | No |
| Audit requirements (who/what/when/why) | spec | No |
| Revocation policy (who can revoke, immediate effect) | spec | No |
| Safety constraints (no blanket exemptions for untrusted principals) | spec | No |
| Interaction with abuse enforcement (RLIM-04) | spec | No |
| Observability requirements (active exemptions count, usage impact) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Emergency/break-glass exemptions | spec | OPTIONAL |
| Per-environment differences | spec | OPTIONAL |
| Approval workflow (two-person) | spec | OPTIONAL |
| Per-tenant exemption limits | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Exemptions MUST be explicit, scoped, and auditable.
- Exemptions SHOULD be time-bounded by default; permanent requires explicit policy.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Grant/revoke authority MUST align to {{xref:API-04}} (or be UNKNOWN flagged).
- Exemptions MUST NOT disable abuse enforcement unless explicitly allowed.

## 7. Cross-References

- **Upstream**: {{xref:RLIM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:RLIM-02}}, {{xref:RLIM-04}}, {{xref:RLIM-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Use UNKNOWN where grant/revoke authority is missing; do not invent. | Required. Define entry schema, duration/review, and revocation rules. | Required. Add approval workflow, per-tenant limits, and safety constraints. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, scope_definitions, surfaces, routes_or_targets, limit_ids_exempted, audit_ref, required_permission, approval_workflow, max_active_per_principal, max_duration, review_frequency, renewal_rules, disallowed_scopes, protected_targets, require_reason_code, exceptions_to_abuse, escalation_override_allowed, dashboards, alerts, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If who_can_grant is UNKNOWN → block Completeness Gate.
- If allowlist entry schema is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.RLIM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] entry_schema_defined == true
  - [ ] grant_policy_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

