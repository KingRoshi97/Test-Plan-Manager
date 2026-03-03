# IAM-07 — Privilege Escalation Controls

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-07                                           |
| Template Type     | Security / IAM                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring privilege escalation cont |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Privilege Escalation Controls             |

## 2. Purpose

Define the canonical lifecycle for user accounts: creation/provisioning (self-serve or SCIM), activation, suspension, deprovisioning, recovery, and deletion/retention interactions. This template must align with SSO/SCIM specs, auth methods, and privacy deletion rules.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- Role/perm model: `{{xref:IAM-01}}` | OPTIONAL
- Auth methods: `{{xref:IAM-02}}` | OPTIONAL
- SCIM provisioning: `{{xref:SSO-05}}` | OPTIONAL
- Admin data repair procedures: `{{xref:ADMIN-04}}` | OPTIONAL
- Privacy retention/deletion: `{{xref:PRIV-05}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Account states (pending/active/suspended/deleted/UNKNOWN) | spec | No |
| Provisioning methods supported (self-serve/SCIM/admin) | spec | No |
| Activation rules (email verify, SSO first login) | spec | No |
| Default role assignment rule (IAM-01 ref) | spec | No |
| Deprovisioning triggers (SCIM deprovision, admin action, inactivity) | spec | No |
| Suspension rules (why/how) | spec | No |
| Recovery methods (reset, admin restore) | spec | No |
| Deletion/retention interaction rule (PRIV-05) | spec | No |
| Audit requirements (account state changes) | spec | No |
| Telemetry requirements (provision success, deprovision events) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Dormant account policy | spec | OPTIONAL |
| Reactivation policy | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Deprovisioning must revoke sessions and access promptly.
- Account deletion must respect legal holds/retention policies.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:IAM-02}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IAM-10}}`, `{{xref:AUDIT-01}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define states, provisioning methods, and deprovision triggers/steps. |
| intermediate | Required. Define suspension/recovery rules and audit events. |
| advanced | Required. Add dormant/reactivation policies and session revoke rigor. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, definitions, session revoke rule, recovery security rules, audit fields, optional telemetry metrics, dormant/reactivation, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `states.list` is UNKNOWN → block Completeness Gate.
- If `prov.activation_rule` is UNKNOWN → block Completeness Gate.
- If `deprov.steps` is UNKNOWN → block Completeness Gate.
- If `delete.interaction_rule` is UNKNOWN → block Completeness Gate.
- If `telemetry.provision_success_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IAM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] states_and_provisioning_defined == true
  - [ ] deprovisioning_defined == true
  - [ ] deletion_retention_interaction_defined == true
  - [ ] audit_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

