# FPMP-01 — Upload Contract (types, limits, auth, scanning)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-01                                          |
| Template Type     | Build / File Processing                          |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring upload contract (types, l |
| Filled By         | Internal Agent                                   |
| Consumes          | API-01, API-02, API-03, API-04, RLIM-01          |
| Produces          | Filled Upload Contract (types, limits, auth, scan|

## 2. Purpose

Define the canonical upload contract for files/media, including accepted types, size limits, authentication/authorization, scanning/validation, upload flow (direct vs signed URL), error mapping, and observability. This template must be consistent with API security policies and must not invent upload capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- API-02 Endpoint Specs: {{api.endpoint_specs}}
- API-03 Error & Status Code Policy: {{api.error_policy}}
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.registry}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Upload surface(s) (endpoi | spec         | No              |
| Authentication requiremen | spec         | No              |
| Authorization requirement | spec         | No              |
| Accepted file types (mime | spec         | No              |
| Size limits (max bytes pe | spec         | No              |
| Count limits (max files p | spec         | No              |
| Upload flow (multipart/fo | spec         | No              |
| Integrity checks (checksu | spec         | No              |
| Scanning policy (malware/ | spec         | No              |
| PII/compliance classifica | spec         | No              |
| Error mapping (validation | spec         | No              |
| Rate limiting policy for  | spec         | No              |
| Observability requirement | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Chunking/resumable upload | spec         | Enrichment only, no new truth  |
| Client-side prevalidation | spec         | Enrichment only, no new truth  |
| Encryption requirements   | spec         | Enrichment only, no new truth  |
| Quarantine behavior       | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Accepted types MUST be allowlisted (no “any file” unless explicitly allowed).
- If scanning is required, files MUST NOT be made available until scan passes (or explicit policy).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- AuthZ MUST bind to {{xref:API-04}}; rate limits bind to {{xref:RLIM-01}}.
- Errors MUST map to {{xref:API-03}}.

## 7. Output Format

### Required Headings (in order)

1. `## Upload Contract (types, limits, auth, scanning)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:API-01}}, {{xref:API-02}}, {{xref:API-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FPMP-02}}, {{xref:FPMP-03}}, {{xref:FPMP-04}}, {{xref:FPMP-06}},
- {{xref:FPMP-07}} | OPTIONAL
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-PII-CLASSIFICATION]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, presigned/chunked support,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If mime_allowlist is UNKNOWN → block Completeness Gate.
- If limits.max_file_bytes is UNKNOWN → block Completeness Gate.
- If scan_required is UNKNOWN → flag in Open Questions.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FPMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] type_allowlist_defined == true
- [ ] limits_defined == true
- [ ] error_mapping_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FPMP-02
