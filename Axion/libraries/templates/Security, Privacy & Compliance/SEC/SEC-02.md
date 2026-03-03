# SEC-02 — Security Architecture Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-02                                           |
| Template Type     | Security / Controls                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring security architecture spe |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Security Architecture Spec                |

## 2. Purpose

Define the canonical security architecture: system components, trust boundaries, data flows, and where security controls are enforced. This document is the anchor for threat modeling and must be consistent with the system architecture and integration inventories.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- System architecture: `{{xref:ARCH-01}}` | OPTIONAL
- API surface: `{{xref:API-01}}` | OPTIONAL
- Eventing: `{{xref:EVT-01}}` | OPTIONAL
- Storage targets: `{{xref:FMS-01}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Component list (major services/clients) | spec | No |
| Trust boundary list (boundary_id) | spec | No |
| Data flow list (flow_id) | spec | No |
| Entry points (web/mobile/API/webhooks) | spec | No |
| Authentication points (where authn occurs) | spec | No |
| Authorization points (where authz enforced) | spec | No |
| Sensitive data zones (where high-risk data lives) | spec | Yes |
| Network controls (allowlists, egress policy) | spec | Yes |
| Logging/audit zones (where logs stored) | spec | No |
| References to downstream security docs (SEC-03..SEC-10) | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Deployment model summary | spec | OPTIONAL |
| Third-party dependencies list | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Trust boundaries and flows must be explicit and consistent with upstream architecture.
- Do not invent components; if not in inputs, mark UNKNOWN and flag.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:ARCH-01}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:TMA-01}}`, `{{xref:SEC-03}}`, `{{xref:IAM-04}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. List components, entry points, and at least high-level flows/boundaries. |
| intermediate | Required. Add explicit authn/authz points and sensitive data zones. |
| advanced | Required. Add crisp boundary IDs, control placement, and third-party dependency mapping. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, notes, controls, deployment model, third-party list, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `boundaries` list is UNKNOWN → block Completeness Gate.
- If `flows` list is UNKNOWN → block Completeness Gate.
- If `auth.authn_points` is UNKNOWN → block Completeness Gate.
- If `logs.stores` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SEC
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] trust_boundaries_defined == true
  - [ ] data_flows_defined == true
  - [ ] auth_points_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

