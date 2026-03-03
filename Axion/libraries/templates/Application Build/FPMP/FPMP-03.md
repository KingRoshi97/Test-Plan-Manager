# FPMP-03 — Processing Pipeline Stages (transcode/resize/parse)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-03                                          |
| Template Type     | Build / File Processing                          |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring processing pipeline stage |
| Filled By         | Internal Agent                                   |
| Consumes          | FPMP-01, FPMP-02                                 |
| Produces          | Filled Processing Pipeline Stages (transcode/resi|

## 2. Purpose

Define the canonical specification format for file/media processing pipelines, including stage inventory, stage inputs/outputs, transforms (transcode/resize/parse), error handling, and how stages map to background jobs. This template must be consistent with upload/storage strategy and must not invent pipeline stages or job_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FPMP-01 Upload Contract: {{fpmp.upload_contract}}
- FPMP-02 Storage Strategy: {{fpmp.storage_strategy}}
- API-06 Background Jobs Spec: {{api.background_jobs}} | OPTIONAL
- JBS-01 Jobs Inventory: {{jbs.jobs_inventory}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Pipeline inventory (pipel | spec         | No              |
| Stage inventory (stage_id | spec         | No              |
| Stage ordering rules (det | spec         | No              |
| Stage inputs (object refs | spec         | No              |
| Stage outputs (derived ar | spec         | No              |
| Stage type (scan/parse/tr | spec         | No              |
| Stage execution model (sy | spec         | No              |
| Job binding rules (stage  | spec         | No              |
| Failure handling per stag | spec         | No              |
| Resource limits (cpu/mem/ | spec         | No              |
| Observability requirement | spec         | No              |
| Security/compliance const | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Conditional stages (type- | spec         | Enrichment only, no new truth  |
| Parallel stages policy    | spec         | Enrichment only, no new truth  |
| Caching/dedupe of process | spec         | Enrichment only, no new truth  |
| Manual reprocess controls | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new job_ids; bind to {{xref:JBS-01}} when used.
- Stage order MUST be deterministic; if conditional, conditions must be explicit.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Failure handling MUST bind to FPMP-04/JBS retry policy if present (or UNKNOWN).

## 7. Output Format

### Required Headings (in order)

1. `## Processing Pipeline Stages (transcode/resize/parse)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FPMP-01}}, {{xref:FPMP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FPMP-04}}, {{xref:FPMP-06}}, {{xref:FPMP-07}} | OPTIONAL
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL, {{standards.rules[STD-OBSERVABILITY]}} |
- OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, pipeline name, applies_to_types,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If stage ordering is UNKNOWN → block Completeness Gate.
- If execution_model == async and job_id is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FPMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] pipeline_inventory_defined == true
- [ ] stage_order_defined == true
- [ ] async_stages_have_job_ids == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FPMP-04
