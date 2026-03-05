# SIGN-06 — Release Readiness & Go/No-Go Gate

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIGN-06                                             |
| Template Type     | Build / Release & Signing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring release readiness & go/no-go gate    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Release Readiness & Go/No-Go Gate Document                         |

## 2. Purpose

Define the canonical release readiness checklist and the single go/no-go decision gate for
promoting a build to the next release channel. This document collects required evidence
(tests/gates/compliance/monitoring plan) and defines pass/fail conditions. This template must be
consistent with existing signing, versioning, submission, and perf gates and must not invent new
gates beyond upstream references.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SIGN-01 Build Artifact Types: {{sign.artifacts}} | OPTIONAL
- SIGN-03 Store Submission Checklist: {{sign.submission}} | OPTIONAL
- SIGN-04 Versioning Rules: {{sign.versioning}} | OPTIONAL
- SIGN-05 Release Channel Policy: {{sign.channels}} | OPTIONAL
- CPR-05 Perf Regression Gates (web): {{cpr.perf_gates}} | OPTIONAL
- MBAT-05 Perf Regression Gates (mobile): {{mbat.perf_gates}} | OPTIONAL
- CER-05 Client Logging/Crash Reporting: {{cer.logging}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Release target (channe... | spec         | Yes             |
| Build identifiers (app... | spec         | Yes             |
| Required gates checkli... | spec         | Yes             |
| Evidence bundle pointe... | spec         | Yes             |
| Known issues list (mus... | spec         | Yes             |
| Rollout plan (phased %... | spec         | Yes             |
| Monitoring plan (signa... | spec         | Yes             |
| Rollback plan (criteri... | spec         | Yes             |
| Approvals (who approve... | spec         | Yes             |
| Final go/no-go decisio... | spec         | Yes             |

## 5. Optional Fields

Canary cohort definition | OPTIONAL
Customer/support comms plan | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new gates; reference existing gate IDs/docs only.
- If any required evidence is missing, decision MUST be NO-GO unless explicitly allowed by
- **standards.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Release Target`
2. `## Build Identification`
3. `## Required Gates Checklist`
4. `## GATE`
5. `## (Repeat per required gate.)`
6. `## Evidence Bundle`
7. `## Known Issues`
8. `## issues:`
9. `## Rollout Plan`
10. `## Monitoring Plan`

## 8. Cross-References

- **Upstream: {{xref:SIGN-01}} | OPTIONAL, {{xref:SIGN-05}} | OPTIONAL, {{xref:**

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
