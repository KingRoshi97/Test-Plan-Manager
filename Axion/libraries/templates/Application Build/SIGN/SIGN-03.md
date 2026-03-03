# SIGN-03 — Store Submission Checklist (iOS/Android)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIGN-03                                          |
| Template Type     | Build / Signing                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring store submission checklis |
| Filled By         | Internal Agent                                   |
| Consumes          | SIGN-01, SIGN-02, PRD-06                         |
| Produces          | Filled Store Submission Checklist (iOS/Android)  |

## 2. Purpose

Define the canonical store submission checklist for iOS App Store / TestFlight and Android Play Console, including required metadata, privacy declarations, build artifacts, signing validations, compliance checks, and release readiness gates. This template must be consistent with build/signing policies and must not invent store requirements not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SIGN-01 Build Artifact Types: {{sign.artifacts}}
- SIGN-02 Signing Keys Policy: {{sign.keys}} | OPTIONAL
- PRD-06 NFRs: {{prd.nfrs}} | OPTIONAL
- CSec-02 Data Protection: {{csec.data_protection}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Submission scope (iOS/And | spec         | No              |
| Build artifact requiremen | spec         | No              |
| Signing verification step | spec         | No              |
| Store metadata checklist  | spec         | No              |
| Privacy/security declarat | spec         | No              |
| Permissions declarations  | spec         | No              |
| Testing checklist (smoke/ | spec         | No              |
| Compliance gate checklist | spec         | No              |
| Release notes requirement | spec         | No              |
| Rollback plan reference   | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Localization checklist    | spec         | Enrichment only, no new truth  |
| Phased rollout options    | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- No submission unless required gates passed (tests, perf, security).
- Privacy declarations MUST reflect CSec policies.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Store Submission Checklist (iOS/Android)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:SIGN-01}}, {{xref:SIGN-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SIGN-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, optional descriptions/permissions strings,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If ios.meta.screenshots is UNKNOWN → block Completeness Gate.
- If android.meta.data_safety_form is UNKNOWN → block Completeness Gate.
- If gates.must_pass is UNKNOWN → block Completeness Gate.
- If rollback.ref is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SIGN
- Pass conditions:
- [ ] required_fields_present == true
- [ ] ios_and_android_checklists_defined == true
- [ ] gates_required_defined == true
- [ ] rollback_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] SIGN-04
