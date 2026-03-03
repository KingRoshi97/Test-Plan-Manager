# PFS-05 — Performance Constraints (limits, indexed fields policy)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PFS-05                                           |
| Template Type     | Build / Pagination                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring performance constraints ( |
| Filled By         | Internal Agent                                   |
| Consumes          | PFS-01, PFS-02, PFS-03                           |
| Produces          | Filled Performance Constraints (limits, indexed f|

## 2. Purpose

Define the canonical performance constraints for queryable endpoints, including max page sizes, query complexity limits, indexed fields policy for filters/sorts, and safeguards against expensive scans. This template must be consistent with query/pagination contracts and must not invent datastore/index capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PFS-01 Query Contract: {{pfs.query_contract}}
- PFS-02 Pagination Rules: {{pfs.pagination_rules}}
- PFS-03 Default Ordering Rules: {{pfs.ordering_rules}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Performance budget statem | spec         | No              |
| Max limit policy (hard ca | spec         | No              |
| Complexity constraints (m | spec         | No              |
| Indexed fields policy (wh | spec         | No              |
| Full-scan prevention rule | spec         | No              |
| Timeout policy (query tim | spec         | No              |
| Safe defaults (default li | spec         | No              |
| Caching policy (if any)   | spec         | No              |
| Per-endpoint performance  | spec         | No              |
| Observability requirement | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Search engine integration | spec         | Enrichment only, no new truth  |
| Adaptive query throttling | spec         | Enrichment only, no new truth  |
| Warm cache vs cold cache  | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Fields MUST NOT be marked filterable/sortable unless they comply with indexed fields policy
- (or explicit override).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Performance failures SHOULD map to API-03 as dependency/internal per policy (or validation if
- rejected up-front).

## 7. Output Format

### Required Headings (in order)

1. `## Performance Constraints (limits, indexed fields policy)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PFS-01}}, {{xref:PFS-02}}, {{xref:PFS-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:API-02}} | OPTIONAL, {{xref:OPS-OBS}} | OPTIONAL
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, throughput_targets, max_include_depth,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If limits.max_limit is UNKNOWN → block Completeness Gate.
- If index.policy_statement is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PFS
- Pass conditions:
- [ ] required_fields_present == true
- [ ] hard_limits_defined == true
- [ ] indexed_fields_policy_defined == true
- [ ] timeout_policy_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] File Processing & Media Pipelines
- [ ] (FPMP)
- [ ] File Processing & Media Pipelines (FPMP)
- [ ] FPMP-01 Upload Contract (types, limits, auth, scanning)
- [ ] FPMP-02 Storage Strategy (buckets, paths, access modes)
- [ ] FPMP-03 Processing Pipeline Stages (transcode/resize/parse)
- [ ] FPMP-04 Async Processing & Status Model (jobs, retries, DLQ)
- [ ] FPMP-05 CDN/Delivery Rules (cache headers, variants)
- [ ] FPMP-06 Security & Compliance for Files (PII, retention, malware)
- [ ] FPMP-07 Media Observability (latency, failure rates, QoS)
- [ ] FPMP-01
