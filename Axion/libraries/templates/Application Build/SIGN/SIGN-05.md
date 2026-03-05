# SIGN-05 — Release Channel Policy (internal/beta/GA)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIGN-05                                             |
| Template Type     | Build / Release & Signing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring release channel policy (internal/beta/ga)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Release Channel Policy (internal/beta/GA) Document                         |

## 2. Purpose

Define the canonical release channel policy: what channels exist (internal/beta/GA), promotion
criteria, gating requirements, rollout strategies, rollback procedures, and roles/responsibilities.
This template must be consistent with versioning, store submission, and perf gates and must
not invent channels not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SIGN-01 Build Artifact Types: {{sign.artifacts}}
- SIGN-03 Store Submission Checklist: {{sign.submission}} | OPTIONAL
- SIGN-04 Versioning Rules: {{sign.versioning}} | OPTIONAL
- CPR-05 Perf Regression Gates: {{cpr.perf_gates}} | OPTIONAL
- MBAT-05 Mobile Perf Gates: {{mbat.perf_gates}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Channel registry (inte... | spec         | Yes             |
| Eligibility (who gets ... | spec         | Yes             |
| Promotion criteria (ga... | spec         | Yes             |
| Approval requirements ... | spec         | Yes             |
| Rollout strategy (phas... | spec         | Yes             |
| Monitoring window (time)  | spec         | Yes             |
| Rollback criteria and ... | spec         | Yes             |
| Hotfix lane rules         | spec         | Yes             |
| Telemetry/health check... | spec         | Yes             |

## 5. Optional Fields

Feature flag default policies per channel | OPTIONAL

Regional phased rollout | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **No promotion unless required gates passed.**
- **Rollouts must be reversible (rollback plan).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Channels`
2. `## Eligibility`
3. `## Promotion Criteria`
4. `## Approvals`
5. `## Rollout Strategy`
6. `## Monitoring Window`
7. `## Rollback`
8. `## Hotfix Lane`
9. `## Health Checks`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:SIGN-01}}, {{xref:SIGN-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:RELEASE-GATE}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
