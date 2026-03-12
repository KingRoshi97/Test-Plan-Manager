# SEC-09 — Security Testing Plan (SAST/DAST/pen test, coverage)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-09                                             |
| Template Type     | Security / Core                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security testing plan (sast/dast/pen test, coverage)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security Testing Plan (SAST/DAST/pen test, coverage) Document                         |

## 2. Purpose

Define the canonical security testing plan: what security tests run (static, dependency, dynamic),
when they run, what coverage is required, how findings are triaged, and what evidence is
produced. This template must be consistent with Secure SDLC gates and vulnerability
management SLAs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Secure SDLC policy: {{xref:SEC-07}} | OPTIONAL
- Vulnerability management: {{xref:SEC-04}} | OPTIONAL
- Threat→control mapping: {{xref:TMA-05}} | OPTIONAL
- Test plan: {{xref:TESTPLAN-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Test types list (SAST,... | spec         | Yes             |
| Execution cadence (per... | spec         | Yes             |
| Scope/targets (repos, ... | spec         | Yes             |
| Coverage expectations ... | spec         | Yes             |
| Failing thresholds (wh... | spec         | Yes             |
| Triaging rules (who tr... | spec         | Yes             |
| Evidence artifacts pro... | spec         | Yes             |
| Retention policy for t... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Red team/tabletop drills | OPTIONAL

Bug bounty policy link | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Testing must map to controls/threats (traceability).**
- **Failing thresholds must be explicit and enforceable.**
- **Evidence artifacts must be saved for compliance/audit as required.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Test Types`
2. `## Cadence`
3. `## Scope / Targets`
4. `## Coverage Expectations`
5. `## Failing Thresholds`
6. `## Triaging`
7. `## Evidence`
8. `## Telemetry`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:SEC-07}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-10}}, {{xref:COMP-09}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define test types and cadence and retention days.**
- **intermediate: Required. Define thresholds and triage process and evidence artifacts.**
- **advanced: Required. Add traceability to threats/controls and red team/bounty policies.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, endpoint scope ref, traceability rule,**
- release thresholds, trend metric, storage location, red team/bounty, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If tests.types is UNKNOWN → block

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
