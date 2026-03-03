# MDC-01 — Device Capability Inventory

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDC-01                                           |
| Template Type     | Build / Device Capabilities                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring device capability invento |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Device Capability Inventory               |

## 2. Purpose

Create the canonical inventory of mobile device capabilities used by the app, indexed by capability_id, including what features/screens use them and the high-level purpose. This template must be consistent with mobile integration maps and must not invent capability_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- MOB-03: `{{mob.native_integrations}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Capability registry (capability_id list) | SPEC/MOB-03 | No |
| capability_id (stable identifier) | spec | No |
| name (human-readable) | spec | No |
| category (camera/location/files/push/etc.) | spec | No |
| purpose (what it enables) | spec | No |
| screens/features using it (screen_id list) | MOB-02 | No |
| permissions required pointer (MDC-02) | MDC-02 | Yes |
| security constraints pointer (MDC-03) | MDC-03 | Yes |
| fallback behavior pointer (MDC-04) | MDC-04 | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Platform availability notes | spec | iOS vs Android differences |
| Open questions | agent | Enrichment only |

## 6. Rules

- Do not introduce new capability_ids unless explicitly allowed; otherwise use UNKNOWN and flag.
- Each capability MUST bind to at least one screen/feature or be flagged as unused.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Inventory Summary` — total_capabilities, categories
2. `## Capability Entries` — Per capability: capability_id, name, category, purpose, screens, permissions_ref, security_ref, fallback_ref, platform_notes, open_questions

## 8. Cross-References

- **Upstream**: MOB-03, SPEC_INDEX
- **Downstream**: MDC-02, MDC-03, MDC-04, MDC-05
- **Standards**: STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Capability registry basics | Required | Required | Required |
| Screens + permission/security/fallback refs | Optional | Required | Required |
| Platform availability nuances | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, categories summary, refs, platform notes, open_questions
- If capability registry is UNKNOWN → block Completeness Gate.
- If items[*].category is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] capability_registry_defined == true
- [ ] each capability binds to screens/features
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
