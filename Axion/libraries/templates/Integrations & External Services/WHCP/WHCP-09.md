# WHCP-09 — Webhook Observability (delivery rate, latency, failures)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-09                                          |
| Template Type     | Integration / Webhooks                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring webhook observability (de |
| Filled By         | Internal Agent                                   |
| Consumes          | WHCP-01, EVT-02, IXS-10                          |
| Produces          | Filled Webhook Observability (delivery rate, late|

## 2. Purpose

Define the canonical payload versioning and compatibility rules for webhooks: how schemas evolve, how versions are signaled, compatibility windows, breaking change rules, and migration/rollback strategy. This template must be consistent with event schema versioning and integration change management policies.

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
| Versioning model (semver/ | spec         | No              |
| Where version is carried  | spec         | No              |
| Per-webhook version track | spec         | No              |
| Backward compatibility ru | spec         | No              |
| Breaking change definitio | spec         | No              |
| Deprecation policy (notic | spec         | No              |
| Migration strategy (dual  | spec         | No              |
| Rollback strategy (versio | spec         | No              |
| Validation behavior by ve | spec         | No              |
| Telemetry requirements (v | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Consumer capability negot | spec         | Enrichment only, no new truth  |
| Schema registry links     | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- A breaking change requires a new major version (or explicit breaking bump rule) and a
- migration plan.
- Compatibility window must be explicit; do not support “all old versions forever.”
- Version parsing must be deterministic and validated.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Webhook Observability (delivery rate, latency, failures)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:WHCP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:WHCP-10}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Core Fields                | Required  | Required     | Required |
| Extended Fields             | Optional  | Required     | Required |
| Coverage Checks            | Optional  | Optional     | Required |

## 10. Unknown Handling

Unknowns must be written in the following format:

```
UNKNOWN-<NNN>: [Area] <summary>
Impact: Low|Med|High
Blocking: Yes|No
Needs: <what input resolves it>
Refs: <spec_id/entity_id/field_path>
```

- UNKNOWN_ALLOWED: domain.map, glossary.terms, version field/header, supported versions,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If version.model is UNKNOWN → block Completeness Gate.
- If version.location is UNKNOWN → block Completeness Gate.
- If compat.window_days is UNKNOWN → block Completeness Gate.
- If validate.unknown_version_behavior is UNKNOWN → block Completeness Gate.
- If telemetry.version_usage_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.WHCP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] version_model_and_location_defined == true
- [ ] per_webhook_versions_defined == true
- [ ] compat_and_deprecation_defined == true
- [ ] unknown_version_handling_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] WHCP-10
