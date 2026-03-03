# FPMP-07 — Media Observability (latency, failure rates, QoS)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-07                                          |
| Template Type     | Build / File Processing                          |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring media observability (late |
| Filled By         | Internal Agent                                   |
| Consumes          | FPMP-01, FPMP-03, FPMP-04, FPMP-05, FPMP-06      |
| Produces          | Filled Media Observability (latency, failure rate|

## 2. Purpose

Define the canonical observability requirements for file/media upload, processing, storage, and delivery, including required metrics, logs, traces, dashboards, alerts, and QoS/SLO hooks. This template must be consistent with pipeline and delivery semantics and must not invent instrumentation that contradicts upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FPMP-01 Upload Contract: {{fpmp.upload_contract}}
- FPMP-03 Processing Pipeline Stages: {{fpmp.pipeline_stages}}
- FPMP-04 Async Status Model: {{fpmp.async_status}} | OPTIONAL
- FPMP-05 CDN/Delivery Rules: {{fpmp.delivery_rules}} | OPTIONAL
- FPMP-06 Security/Compliance: {{fpmp.security_compliance}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Core metric set (upload/p | spec         | No              |
| Latency definitions (uplo | spec         | No              |
| Success/failure rate defi | spec         | No              |
| Scan/quarantine metrics ( | spec         | No              |
| Variant generation metric | spec         | No              |
| Cache metrics (if CDN)    | spec         | No              |
| Storage error metrics     | spec         | No              |
| Log field requirements (c | spec         | No              |
| Trace propagation require | spec         | No              |
| Dashboard minimum panels  | spec         | No              |
| Alert requirements (failu | spec         | No              |
| QoS/SLO hooks (targets by | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Per-type metrics (image/v | spec         | Enrichment only, no new truth  |
| Sampling policy           | spec         | Enrichment only, no new truth  |
| Cost controls/cardinality | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Metrics MUST be keyed by stable identifiers (pipeline_id, stage_id, variant_type) and avoid
- unbounded labels.
- PII MUST be redacted in logs/traces per: {{standards.rules[STD-PII-REDACTION]}} |
- OPTIONAL
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Alerts MUST be actionable and map to operational procedures where available.

## 7. Output Format

### Required Headings (in order)

1. `## Media Observability (latency, failure rates, QoS)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FPMP-01}}, {{xref:FPMP-03}}, {{xref:FPMP-04}} | OPTIONAL,
- {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:OPS-OBS}} | OPTIONAL, {{xref:ALRT-01}} | OPTIONAL
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
- {{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, upload latency, stage/pipeline duration,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If logs required fields are UNKNOWN → block Completeness Gate.
- If alerts.threshold_model is UNKNOWN → flag in Open Questions.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FPMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] metric_set_defined == true
- [ ] log_fields_defined == true
- [ ] dashboard_minimum_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] Admin & Internal Tools APIs (ADMIN)
- [ ] Admin & Internal Tools APIs (ADMIN)
- [ ] ADMIN-01 Admin Capabilities Matrix
- [ ] ADMIN-02 Moderation/Support Tools Spec (queues, actions)
- [ ] ADMIN-03 Audit Trail Spec (actions + retention)
- [ ] ADMIN-04 Data Repair Procedures (safe backfills)
- [ ] ADMIN-05 Privileged API Surface Catalog (endpoints + authz)
- [ ] ADMIN-06 Admin Observability & Safeguards (rate limits, alerts)
- [ ] ADMIN-01
