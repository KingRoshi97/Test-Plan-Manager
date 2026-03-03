# AUDIT-03 — Audit Trail Retention Policy (duration, archival, purge)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-03                                         |
| Template Type     | Security / Audit                                 |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring audit trail retention pol |
| Filled By         | Internal Agent                                   |
| Consumes          | AUDIT-01, AUDIT-02, IAM-04                       |
| Produces          | Filled Audit Trail Retention Policy (duration, ar|

## 2. Purpose

Define the canonical rules for capturing audit events: what must be logged, where capture occurs (API middleware, job workers, admin UI), how events are enriched (correlation IDs), and how failures are handled. This template must align with the audit catalog and auth enforcement points.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit event catalog: {{xref:AUDIT-01}} | OPTIONAL
- Audit schema: {{xref:AUDIT-02}} | OPTIONAL
- AuthZ enforcement points: {{xref:IAM-04}} | OPTIONAL
- Privileged API surface: {{xref:ADMIN-05}} | OPTIONAL
- Jobs inventory: {{xref:JBS-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Capture points list (api/ | spec         | No              |
| Event coverage rules (whi | spec         | No              |
| Enrichment rules (request | spec         | No              |
| Write path (queue/sync wr | spec         | No              |
| Failure behavior (fail op | spec         | No              |
| Deduping/idempotency rule | spec         | No              |
| Storage target (audit sto | spec         | No              |
| Access controls for audit | spec         | No              |
| Telemetry requirements (a | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Sampling rules (for non-c | spec         | Enrichment only, no new truth  |
| Backfill/replay rules     | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Privileged actions and security-relevant events must not be sampled away.
- Audit capture must not fail silently; failures must be monitored.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Audit Trail Retention Policy (duration, archival, purge)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:AUDIT-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:AUDIT-05}}, {{xref:AUDIT-09}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, trace rule, idempotency, alert rule,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If capture.points is UNKNOWN → block Completeness Gate.
- If write.model is UNKNOWN → block Completeness Gate.
- If fail.on_write_fail is UNKNOWN → block Completeness Gate.
- If store.target is UNKNOWN → block Completeness Gate.
- If telemetry.write_fail_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.AUDIT
- Pass conditions:
- [ ] required_fields_present == true
- [ ] capture_and_write_model_defined == true
- [ ] failure_behavior_defined == true
- [ ] storage_and_access_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] AUDIT-04
