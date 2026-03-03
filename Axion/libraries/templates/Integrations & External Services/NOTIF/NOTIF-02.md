# NOTIF-02 — Template Registry (per notification: content, variables)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-02                                         |
| Template Type     | Integration / Notifications                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring template registry (per no |
| Filled By         | Internal Agent                                   |
| Consumes          | NOTIF-01, IXS-01                                 |
| Produces          | Filled Template Registry (per notification: conte|

## 2. Purpose

Create the canonical inventory of notification/comms providers (email/SMS/push/in-app vendors), indexed by provider_id, including which channels each provider supports, enabled environments, credential references, and operational constraints. This document must not invent provider_ids beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- IXS-04 Secrets/Credential Handling: {{ixs.secrets_policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Provider registry (provid | spec         | No              |
| provider_id (stable ident | spec         | No              |
| provider name/vendor      | spec         | No              |
| supported channels (email | spec         | No              |
| integration_id binding (I | spec         | No              |
| credentials reference (IX | spec         | No              |
| environments enabled (dev | spec         | No              |
| rate limits/quotas summar | spec         | No              |
| deliverability constraint | spec         | No              |
| criticality (low/med/high | spec         | No              |
| owner (team/role)         | spec         | No              |
| references to detailed sp | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Status (planned/active/de | spec         | Enrichment only, no new truth  |
| SLA/uptime notes          | spec         | Enrichment only, no new truth  |
| Regional availability not | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent provider_ids; use only {{spec.notif_providers_by_id}} if present, else mark
- UNKNOWN and flag.
- Each provider must bind to an integration_id and have a credential reference (or approved
- UNKNOWN).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Template Registry (per notification: content, variables)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:NOTIF-01}}, {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:NOTIF-04}}, {{xref:NOTIF-05}}, {{xref:NOTIF-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, inv notes, credential ref, constraints,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If providers[].provider_id is UNKNOWN → block Completeness Gate.
- If providers[].integration_id is UNKNOWN → block Completeness Gate.
- If providers[].supported_channels is UNKNOWN → block Completeness Gate.
- If providers[].rate_limits is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.NOTIF
- Pass conditions:
- [ ] required_fields_present == true
- [ ] provider_ids_unique == true
- [ ] integration_ids_exist_in_IXS_01 == true
- [ ] channels_supported_valid == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] NOTIF-03
