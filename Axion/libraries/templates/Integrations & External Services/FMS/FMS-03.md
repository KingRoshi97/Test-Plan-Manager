# FMS-03 — Storage Organization (buckets, paths, naming conventions)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-03                                           |
| Template Type     | Integration / File Management                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring storage organization (buc |
| Filled By         | Internal Agent                                   |
| Consumes          | FPMP-03, FPMP-04, FMS-01, JBS-02                 |
| Produces          | Filled Storage Organization (buckets, paths, nami|

## 2. Purpose

Define the canonical integration spec for media/file processing: which processing stages exist (transcode/resize/scan/parse), which vendors or internal services perform them, job triggers, inputs/outputs, retries, and security constraints. This template must be consistent with file processing pipeline stages and async status models.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Provider Inventory: {{fms.storage_inventory}}
- FPMP-03 Processing Pipeline Stages: {{fpmp.stages}}
- FPMP-04 Async Processing & Status Model: {{fpmp.async_status}} | OPTIONAL
- FPMP-06 File Security/Compliance: {{fpmp.security}} | OPTIONAL
- JBS-01 Jobs Inventory: {{jobs.inventory}} | OPTIONAL
- JBS-02 Job Specs: {{jobs.specs}} | OPTIONAL
- EVT-01 Event Catalog (processing events): {{evt.catalog}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Processing stage registry | spec         | No              |
| Stage definitions (input  | spec         | No              |
| Which stages use vendor v | spec         | No              |
| Job trigger rules (upload | spec         | No              |
| Job IDs involved (JBS bin | spec         | No              |
| Storage IO paths (source  | spec         | No              |
| Retry/DLQ binding (JBS-04 | spec         | No              |
| Idempotency rules (per fi | spec         | No              |
| Security constraints (sca | spec         | No              |
| Telemetry requirements (l | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Parallelization rules     | spec         | Enrichment only, no new truth  |
| Resource limits (CPU/memo | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Files must not be publicly served until required security scanning passes.
- Stage outputs must be deterministic and versioned (input hash → output variant).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Storage Organization (buckets, paths, naming conventions)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FPMP-03}}, {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FMS-06}}, {{xref:FMS-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, job refs, path rules, retry refs, security
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If stages.ids is UNKNOWN → block Completeness Gate.
- If items[*].idempotency_rule is UNKNOWN → block Completeness Gate.
- If security.scan_before_publish_rule is UNKNOWN → block Completeness Gate.
- If telemetry.pipeline_success_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FMS
- Pass conditions:
- [ ] required_fields_present == true
- [ ] stages_defined == true
- [ ] idempotency_defined == true
- [ ] security_gates_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FMS-04
