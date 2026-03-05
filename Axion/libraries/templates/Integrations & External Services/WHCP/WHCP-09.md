# WHCP-09 — Payload Versioning & Compatibility (schema evolution)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-09                                             |
| Template Type     | Integration / Webhooks                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring payload versioning & compatibility (schema evolution)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Payload Versioning & Compatibility (schema evolution) Document                         |

## 2. Purpose

Define the canonical payload versioning and compatibility rules for webhooks: how schemas
evolve, how versions are signaled, compatibility windows, breaking change rules, and
migration/rollback strategy. This template must be consistent with event schema versioning and
integration change management policies.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- EVT-02 Event Schema Spec: {{evt.schema_spec}} | OPTIONAL
- IXS-10 Versioning & Change Management: {{ixs.change_mgmt}} | OPTIONAL
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Versioning model (semv... | spec         | Yes             |
| Where version is carri... | spec         | Yes             |
| Per-webhook version tr... | spec         | Yes             |
| Backward compatibility... | spec         | Yes             |
| Breaking change defini... | spec         | Yes             |
| Deprecation policy (no... | spec         | Yes             |
| Migration strategy (du... | spec         | Yes             |
| Rollback strategy (ver... | spec         | Yes             |
| Validation behavior by... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Consumer capability negotiation | OPTIONAL

Schema registry links | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **A breaking change requires a new major version (or explicit breaking bump rule) and a**
- **migration plan.**
- **Compatibility window must be explicit; do not support “all old versions forever.”**
- **Version parsing must be deterministic and validated.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Versioning Model`
2. `## Per-Webhook Current Versions`
3. `## Entry`
4. `## (Repeat per webhook.)`
5. `## Compatibility Rules`
6. `## Deprecation Policy`
7. `## Migration Strategy`
8. `## Rollback Strategy`
9. `## Validation Behavior`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:WHCP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:WHCP-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
