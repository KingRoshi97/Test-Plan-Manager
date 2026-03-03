# SIGN-05 — Release Channel Policy (internal/beta/GA)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIGN-05                                          |
| Template Type     | Build / Signing                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring release channel policy (i |
| Filled By         | Internal Agent                                   |
| Consumes          | SIGN-01, SIGN-03, SIGN-04                        |
| Produces          | Filled Release Channel Policy (internal/beta/GA) |

## 2. Purpose

Define the canonical release channel policy: what channels exist (internal/beta/GA), promotion criteria, gating requirements, rollout strategies, rollback procedures, and roles/responsibilities. This template must be consistent with versioning, store submission, and perf gates and must not invent channels not present in upstream inputs.

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
| Channel registry (interna | spec         | No              |
| Eligibility (who gets eac | spec         | No              |
| Promotion criteria (gates | spec         | No              |
| Approval requirements (ro | spec         | No              |
| Rollout strategy (phased/ | spec         | No              |
| Monitoring window (time)  | spec         | No              |
| Rollback criteria and ste | spec         | No              |
| Hotfix lane rules         | spec         | No              |
| Telemetry/health checks r | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Feature flag default poli | spec         | Enrichment only, no new truth  |
| Regional phased rollout   | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- No promotion unless required gates passed.
- Rollouts must be reversible (rollback plan).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Release Channel Policy (internal/beta/GA)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:SIGN-01}}, {{xref:SIGN-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:RELEASE-GATE}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, beta/ga eligibility, required gates,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If channels.list is UNKNOWN → block Completeness Gate.
- If promote.beta_to_ga is UNKNOWN → block Completeness Gate.
- If rollback.criteria is UNKNOWN → block Completeness Gate.
- If monitor.window is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SIGN
- Pass conditions:
- [ ] required_fields_present == true
- [ ] channels_defined == true
- [ ] promotion_and_approvals_defined == true
- [ ] rollout_and_rollback_defined == true
- [ ] monitoring_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] SIGN-06
