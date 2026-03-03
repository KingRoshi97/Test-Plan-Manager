# SIGN-02 — Signing Keys & Rotation Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIGN-02                                          |
| Template Type     | Build / Signing                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring signing keys & rotation p |
| Filled By         | Internal Agent                                   |
| Consumes          | SIGN-01, SEC-KEYS, ADMIN-03                      |
| Produces          | Filled Signing Keys & Rotation Policy            |

## 2. Purpose

Define the canonical policy for signing keys: what keys exist (per platform), where they are stored, who can access them, how they are rotated, how compromises are handled, and audit/logging requirements. This template must be consistent with build artifact types and must not invent key material or processes not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SIGN-01 Build Artifact Types: {{sign.artifacts}}
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Key inventory (key_id lis | spec         | No              |
| Key purpose (ios signing, | spec         | No              |
| Storage location policy ( | spec         | No              |
| Access control policy (ro | spec         | No              |
| Rotation schedule (time-b | spec         | No              |
| Revocation/compromise res | spec         | No              |
| Backup/recovery policy    | spec         | No              |
| Audit logging requirement | spec         | No              |
| No-commit rule (never com | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Per-environment keys (dev | spec         | Enrichment only, no new truth  |
| Key ceremony notes        | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never expose key material in docs/logs.
- Rotation MUST be documented and testable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Signing Keys & Rotation Policy`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:SIGN-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SIGN-03}}, {{xref:SIGN-05}} | OPTIONAL
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, env scope, revocation/backup/audit refs,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If keys[*].storage_location is UNKNOWN → block Completeness Gate.
- If controls.no_commit_rule is UNKNOWN → block Completeness Gate.
- If compromise.response_steps is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SIGN
- Pass conditions:
- [ ] required_fields_present == true
- [ ] key_inventory_defined == true
- [ ] storage_and_access_defined == true
- [ ] rotation_defined == true
- [ ] compromise_response_defined == true
- [ ] audit_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] SIGN-03
