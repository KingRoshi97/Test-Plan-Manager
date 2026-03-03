# TMA-06 — Security Testing Requirements (pen test, SAST, DAST)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-06                                           |
| Template Type     | Security / Threat Modeling                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring security testing requirem |
| Filled By         | Internal Agent                                   |
| Consumes          | RLIM-01, RLIM-03, RLIM-04, TMA-03                |
| Produces          | Filled Security Testing Requirements (pen test, S|

## 2. Purpose

Define the canonical strategy for bot defense and rate limiting: what surfaces are protected, what signals are used, what enforcement actions exist, and how users recover from false positives. This template must align with rate limit policies/catalogs and the attack surface inventory.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Attack surface inventory: {{xref:TMA-03}} | OPTIONAL
- Rate limit policy: {{xref:RLIM-01}} | OPTIONAL
- Rate limit catalog: {{xref:RLIM-02}} | OPTIONAL
- Abuse signals: {{xref:RLIM-03}} | OPTIONAL
- Enforcement matrix: {{xref:RLIM-04}} | OPTIONAL
- Form anti-abuse: {{xref:FORM-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Protected surfaces list ( | spec         | No              |
| Bot signal sources (ip/de | spec         | No              |
| Challenge mechanisms supp | spec         | No              |
| Rate limit strategy (glob | spec         | No              |
| Escalation ladder (warn → | spec         | No              |
| False positive recovery p | spec         | No              |
| Exemptions/allowlist poli | spec         | No              |
| Telemetry requirements (b | spec         | No              |
| Privacy constraints (mini | spec         | No              |
| Runbook references (RLIM- | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Adaptive risk scoring not | spec         | Enrichment only, no new truth  |
| Geo-based rules           | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Bot defense must not rely on collecting excessive PII; prefer coarse signals where possible.
- Recovery process must exist and be documented.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Security Testing Requirements (pen test, SAST, DAST)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:TMA-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:TMA-07}}, {{xref:RLIM-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, collection rules, challenge types, refs,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If protect.surfaces is UNKNOWN → block Completeness Gate.
- If enforce.ladder is UNKNOWN → block Completeness Gate.
- If fp.recovery_process is UNKNOWN → block Completeness Gate.
- If telemetry.bot_block_metric is UNKNOWN → block Completeness Gate.
- If privacy.minimization_rule is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.TMA
- Pass conditions:
- [ ] required_fields_present == true
- [ ] surfaces_and_signals_defined == true
- [ ] escalation_and_recovery_defined == true
- [ ] privacy_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] TMA-07
