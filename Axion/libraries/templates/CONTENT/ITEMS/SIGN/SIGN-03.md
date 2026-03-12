# SIGN-03 — Store Submission Checklist (iOS/Android)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIGN-03                                             |
| Template Type     | Build / Release & Signing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring store submission checklist (ios/android)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Store Submission Checklist (iOS/Android) Document                         |

## 2. Purpose

Define the canonical store submission checklist for iOS App Store / TestFlight and Android Play
Console, including required metadata, privacy declarations, build artifacts, signing validations,
compliance checks, and release readiness gates. This template must be consistent with
build/signing policies and must not invent store requirements not present in upstream inputs.

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
| Submission scope (iOS/... | spec         | Yes             |
| Build artifact require... | spec         | Yes             |
| Signing verification s... | spec         | Yes             |
| Store metadata checkli... | spec         | Yes             |
| Privacy/security decla... | spec         | Yes             |
| Permissions declaratio... | spec         | Yes             |
| Testing checklist (smo... | spec         | Yes             |
| Compliance gate checkl... | spec         | Yes             |
| Release notes requirem... | spec         | Yes             |
| Rollback plan reference   | spec         | Yes             |

## 5. Optional Fields

Localization checklist | OPTIONAL

Phased rollout options | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **No submission unless required gates passed (tests, perf, security).**
- **Privacy declarations MUST reflect CSec policies.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## iOS Checklist`
2. `## metadata:`
3. `## Android Checklist`
4. `## metadata:`
5. `## Compliance Gates`
6. `## Rollback Plan`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:SIGN-01}}, {{xref:SIGN-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SIGN-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
