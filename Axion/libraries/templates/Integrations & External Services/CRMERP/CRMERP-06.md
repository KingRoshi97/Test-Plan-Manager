# CRMERP-06 — Authentication & Credential Management (OAuth, API keys)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CRMERP-06                                        |
| Template Type     | Integration / CRM-ERP                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring authentication & credenti |
| Filled By         | Internal Agent                                   |
| Consumes          | CRMERP-01, IXS-03, RLIM-01                       |
| Produces          | Filled Authentication & Credential Management (OA|

## 2. Purpose

Define the canonical vendor rate limit and quota rules for CRM/ERP integrations, including documented vendor limits, internal concurrency caps, backoff behavior, and how sync scheduling adapts under throttling. This template must be consistent with integration connectivity policy and internal rate limit governance.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- IXS-03 Connectivity & Network Policy: {{ixs.network_policy}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- RLIM-02 Rate Limit Catalog: {{rlim.catalog}} | OPTIONAL
- CER-02 Retry/Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| system_id binding         | spec         | No              |
| Vendor limit registry (li | spec         | No              |
| Vendor documented limits  | spec         | No              |
| Quota reset behavior (win | spec         | No              |
| Retry-after handling (429 | spec         | No              |
| Backoff policy (exponenti | spec         | No              |
| Internal concurrency caps | spec         | No              |
| Scheduling adaptation rul | spec         | No              |
| Exemptions/allowlist poli | spec         | No              |
| Telemetry requirements (t | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Cost/usage budgeting note | spec         | Enrichment only, no new truth  |
| Burst allowance rules     | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not exceed vendor limits; must degrade safely under throttling.
- Backoff must be bounded; do not spin.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Authentication & Credential Management (OAuth, API keys)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CRMERP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:CRMERP-04}}, {{xref:CRMERP-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, reset rules/notes, 429 header/fallback,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If limits list is UNKNOWN → block Completeness Gate.
- If backoff.max_delay_ms is UNKNOWN → block Completeness Gate.
- If adapt.on_throttle_behavior is UNKNOWN → block Completeness Gate.
- If telemetry.throttle_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CRMERP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] vendor_limits_defined == true
- [ ] 429_and_backoff_defined == true
- [ ] internal_caps_defined == true
- [ ] adaptation_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CRMERP-07
