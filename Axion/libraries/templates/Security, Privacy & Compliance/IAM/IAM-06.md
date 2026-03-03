# IAM-06 — Service Account & API Key Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-06                                           |
| Template Type     | Security / IAM                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring service account & api key |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Service Account & API Key Spec            |

## 2. Purpose

Define the canonical policy for privileged access: admin roles, break-glass procedures, step-up requirements, session constraints for admins, and audit controls. This template must be consistent with role/permission model, MFA/step-up rules, and privileged action auditing.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- Role/perm model: `{{xref:IAM-01}}` | OPTIONAL
- MFA/step-up rules: `{{xref:SSO-07}}` | OPTIONAL
- Admin capabilities matrix: `{{xref:ADMIN-01}}` | OPTIONAL
- Privileged actions audit: `{{xref:AUDIT-07}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Privileged roles list (role_ids) | spec | No |
| What is considered privileged (capabilities/actions) | spec | No |
| Step-up requirement rule (when required) | spec | No |
| Break-glass supported (yes/no/UNKNOWN) | spec | No |
| Break-glass process (how to activate/deactivate) | spec | Yes |
| Admin session constraints (short TTL, device binding) | spec | No |
| Approval requirements (2-person rule?) if applicable | spec | Yes |
| Audit requirements (all privileged actions logged) | spec | No |
| Access review cadence (IAM-09) | spec | No |
| Telemetry requirements (privileged actions, break-glass usage) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Just-in-time access policy | spec | OPTIONAL |
| Emergency contact rules | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Privileged access must require MFA/step-up when policy says so.
- Break-glass must be time-bound and auditable.
- Admin sessions must be stricter than standard user sessions where possible.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:IAM-01}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IAM-09}}`, `{{xref:SEC-06}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define privileged roles/actions and break-glass steps (or mark UNKNOWN). |
| intermediate | Required. Define admin session TTL and audit rules and access review cadence. |
| advanced | Required. Add JIT access and approvals rigor and telemetry fields. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, max duration, approvals, audit fields, break glass metric, jit/emergency contact, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `priv.roles` is UNKNOWN → block Completeness Gate.
- If `step.rule` is UNKNOWN → block Completeness Gate.
- If `break.activation_steps` is UNKNOWN → block Completeness Gate (when break.supported == true).
- If `audit.required` is UNKNOWN → block Completeness Gate.
- If `telemetry.priv_action_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IAM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] privileged_definition_defined == true
  - [ ] step_up_and_break_glass_defined == true
  - [ ] audit_defined == true
  - [ ] reviews_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

