# FMS-10 — File Security & Compliance (encryption, PII, audit)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-10                                           |
| Template Type     | Integration / File Management                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring file security & complianc |
| Filled By         | Internal Agent                                   |
| Consumes          | FMS-01, FMS-04, FMS-05, IXS-07                   |
| Produces          | Filled File Security & Compliance (encryption, PI|

## 2. Purpose

Define the canonical observability and cost controls for files/media: storage growth tracking, egress/CDN costs, alerts for abnormal patterns, lifecycle enforcement verification, and operator runbooks to control spend. This template must be consistent with retention/CDN rules and integration observability baselines.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Inventory: {{fms.storage_inventory}}
- FMS-04 CDN/Delivery Rules: {{fms.cdn_delivery}} | OPTIONAL
- FMS-05 Retention/Lifecycle Rules: {{fms.retention}} | OPTIONAL
- FMS-06 Security/Compliance: {{fms.security}} | OPTIONAL
- IXS-07 Integration Observability: {{ixs.observability}} | OPTIONAL
- RLIM-01 Rate Limit Policy (egress throttles if any): {{rlim.policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Core metrics (total bytes | spec         | No              |
| Growth metrics (daily/wee | spec         | No              |
| Egress/CDN metrics (bytes | spec         | No              |
| Per-bucket breakdown poli | spec         | No              |
| Cost alert thresholds (gr | spec         | No              |
| Lifecycle enforcement che | spec         | No              |
| Abuse signals (hotlinking | spec         | No              |
| Operator actions (tighten | spec         | No              |
| Runbook location and form | spec         | No              |
| Telemetry requirements (c | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Budget caps by env/tenant | spec         | Enrichment only, no new truth  |
| Auto-mitigation rules     | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Cost controls must not weaken security (no opening access to reduce costs).
- Alerts must be actionable and mapped to operator actions.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## File Security & Compliance (encryption, PII, audit)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:ADMIN-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, weekly growth, hit rate, routing, archive
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If metrics.total_bytes_metric is UNKNOWN → block Completeness Gate.
- If growth.daily_metric is UNKNOWN → block Completeness Gate.
- If egress.bytes_metric is UNKNOWN → block Completeness Gate.
- If lifecycle.ttl_enforcement_check is UNKNOWN → block Completeness Gate.
- If runbooks.location is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FMS
- Pass conditions:
- [ ] required_fields_present == true
- [ ] core_and_egress_metrics_defined == true
- [ ] alerts_defined == true
- [ ] lifecycle_checks_defined == true
- [ ] operator_actions_and_runbooks_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
