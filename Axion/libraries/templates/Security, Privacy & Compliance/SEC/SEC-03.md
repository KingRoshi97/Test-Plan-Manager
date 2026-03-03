# SEC-03 — Authentication Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-03                                           |
| Template Type     | Security / Controls                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring authentication spec       |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Authentication Spec                       |

## 2. Purpose

Define the baseline security requirements for the product as a checklist of enforceable controls (what must be true). This document is the "security bar" used by reviews and gates and must align with system trust boundaries, AuthN/AuthZ model, and audit requirements.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- Security overview: `{{xref:SEC-01}}` | OPTIONAL
- Security architecture: `{{xref:SEC-02}}` | OPTIONAL
- Role/permission model: `{{xref:IAM-01}}` | OPTIONAL
- Audit event catalog: `{{xref:AUDIT-01}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Control registry (control_id list) | spec | No |
| Control categories (AuthN, AuthZ, Data, Network, Logging, SDLC) | spec | No |
| Minimum required controls per category | spec | No |
| Evidence requirement per control (what proves it) | spec | No |
| Owner per control (team/role) | spec | No |
| Severity/priority per control (high/med/low) | spec | Yes |
| Verification method per control (test/check/manual) | spec | No |
| Exception policy reference (SEC-08) | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Per-surface control deltas (web/mobile/api) | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Controls must be testable or have explicit evidence requirements.
- Do not list vague controls ("be secure"); every control must be enforceable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:SEC-01}}`, `{{xref:SEC-02}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:SEC-07}}`, `{{xref:COMP-02}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define categories and at least a starter control registry with UNKNOWN where needed. |
| intermediate | Required. Add evidence + verification method per control. |
| advanced | Required. Add severity, ownership, and explicit references/evidence artifacts per control. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, refs/notes, evidence summary fields, exceptions rules, per-surface deltas, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `controls.categories` is UNKNOWN → block Completeness Gate.
- If `controls.items[].control_id` is UNKNOWN → block Completeness Gate.
- If `controls.items[].requirement` is UNKNOWN → block Completeness Gate.
- If `controls.items[].owner` is UNKNOWN → block Completeness Gate.
- If `controls.items[].verification_method` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SEC
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] control_registry_defined == true
  - [ ] each_control_has_evidence_and_verification == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

