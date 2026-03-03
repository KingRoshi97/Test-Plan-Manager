# MOB-03 — Native Module Inventory

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MOB-03                                           |
| Template Type     | Build / Mobile                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring native module inventory   |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Native Module Inventory                   |

## 2. Purpose

Define the canonical map of mobile native integrations: which device capabilities are used, what bridges/modules are required, what permissions are needed, and which screens/features depend on them. This template must be consistent with capability and permission rules and must not invent capabilities not present in upstream inputs.

## 3. Inputs Required

- MDC-01: `{{mdc.capabilities}}`
- MDC-02: `{{mdc.permissions_ux}}` | OPTIONAL
- MDC-03: `{{mdc.cap_security}}` | OPTIONAL
- MOB-02: `{{mob.screens}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Integration registry (integration_id list) | MDC-01 | No |
| Capability binding (capability_id) | MDC-01 | No |
| Native module/bridge name | spec | No |
| Permissions required (platform-specific) | MDC-02 | Yes |
| Screens/features using the integration | MOB-02 | No |
| Permission request timing | MDC-02 | No |
| Fallback behavior when denied | MDC-04 | No |
| Security constraints (least privilege) | MDC-03 | No |
| Telemetry requirements | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| OS version constraints | spec | Platform min versions |
| Background mode dependencies | MBAT-01 | If bg access needed |
| Open questions | agent | Enrichment only |

## 6. Rules

- Must comply with MDC-01 capability inventory.
- Do not introduce new capability_ids; use only those in `{{xref:MDC-01}}`.
- Permission UX MUST align with `{{xref:MDC-02}}`.
- Least privilege MUST align with `{{xref:MDC-03}}`.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Integration Registry` — Per integration: integration_id, capability_id, native_module, permissions (ios/android), screens, request_timing, fallback_on_denied, security_notes, telemetry, open_questions
2. `## Global Permission Timing Rules` — default_request_timing, never_request_upfront_for

## 8. Cross-References

- **Upstream**: MDC-01, MOB-02, SPEC_INDEX
- **Downstream**: MDC-04, MDC-05
- **Standards**: STD-UNKNOWN-HANDLING, STD-SECURITY

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Integrations + basic timing | Required | Required | Required |
| Fallbacks + least privilege | Optional | Required | Required |
| Background constraints + telemetry | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, ios/android permission lists, security notes, telemetry, never request upfront list, OS/background constraints, open_questions
- If integrations list is UNKNOWN → block Completeness Gate.
- If capability_id is UNKNOWN → block Completeness Gate.
- If fallback_on_denied is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] capability_bindings_defined == true
- [ ] permission_and_fallback_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
