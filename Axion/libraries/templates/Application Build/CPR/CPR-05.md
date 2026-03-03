# CPR-05 — Perf Regression Gates (thresholds, CI checks)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CPR-05                                           |
| Template Type     | Build / Performance                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring perf regression gates (th |
| Filled By         | Internal Agent                                   |
| Consumes          | CPR-01, CPR-04                                   |
| Produces          | Filled Perf Regression Gates (thresholds, CI chec|

## 2. Purpose

Define the canonical performance regression gate rules: what metrics are gated, threshold definitions, how checks run (CI/local), what constitutes fail vs warn, and the remediation workflow. This template must be consistent with the performance budget and profiling plan and must not invent gating systems not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CPR-01 Performance Budget: {{cpr.budget}}
- CPR-04 Profiling Plan: {{cpr.profiling_plan}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Gated metrics list (start | spec         | No              |
| Threshold definitions (nu | spec         | No              |
| Fail vs warn rule (what b | spec         | No              |
| Measurement method per me | spec         | No              |
| CI execution rule (when c | spec         | No              |
| Baseline comparison metho | spec         | No              |
| Result reporting (artifac | spec         | No              |
| Remediation workflow (wha | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Per-branch differences    | spec         | Enrichment only, no new truth  |
| Manual override policy    | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Thresholds MUST be measurable and bind to CPR-01 targets.
- CI checks MUST produce artifacts usable for debugging.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Perf Regression Gates (thresholds, CI checks)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CPR-01}}, {{xref:CPR-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, warn_when, scenario, warn rules,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If gates.metrics is UNKNOWN → block Completeness Gate.
- If thresholds list is UNKNOWN → block Completeness Gate.
- If report.artifacts is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CPR
- Pass conditions:
- [ ] required_fields_present == true
- [ ] thresholds_defined == true
- [ ] ci_execution_defined == true
- [ ] reporting_defined == true
- [ ] remediation_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] Forms & Validation (FORM)
- [ ] Forms & Validation (FORM)
- [ ] FORM-01 Forms Inventory (by form_id/screen_id)
- [ ] FORM-02 Field Spec (per field: type, rules, copy)
- [ ] FORM-03 Validation UX Rules (inline, focus, announce)
- [ ] FORM-04 Schema Mapping (forms ↔ DATA-06/DQV-03)
- [ ] FORM-05 Submission & Error Recovery Patterns
- [ ] FORM-06 Anti-Abuse for Forms (spam, throttles, bot defense)
- [ ] FORM-01
