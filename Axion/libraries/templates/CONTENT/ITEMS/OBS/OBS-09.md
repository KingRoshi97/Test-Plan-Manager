# OBS-09 — Sampling & Cardinality Policy (limits, hashing, budgets)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OBS-09                                             |
| Template Type     | Operations / Observability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring sampling & cardinality policy (limits, hashing, budgets)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Sampling & Cardinality Policy (limits, hashing, budgets) Document                         |

## 2. Purpose

Define the canonical policy for sampling and cardinality control across telemetry: which signals
can be sampled, how sample rates are chosen, how high-cardinality dimensions are handled,
and how budgets are enforced to control cost and reliability.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Telemetry schema standard: {{xref:OBS-02}} | OPTIONAL
- Telemetry redaction/privacy rules: {{xref:OBS-06}} | OPTIONAL
- Log volume controls: {{xref:LTS-08}} | OPTIONAL
- Cost drivers: {{xref:COST-02}} | OPTIONAL
- Noise reduction rules: {{xref:ALRT-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Sampling scope (logs/t... | spec         | Yes             |
| Default sampling rates... | spec         | Yes             |
| Override rules (incide... | spec         | Yes             |
| Cardinality limits pol... | spec         | Yes             |
| Hashing/anonymization ... | spec         | Yes             |
| Budget model (max volu... | spec         | Yes             |
| Enforcement mechanism ... | spec         | Yes             |

## 5. Optional Fields

Per-team budgets | OPTIONAL

Adaptive sampling notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Never sample away audit/privileged/security-critical events.**
- **High-cardinality controls must be enforceable (bounded labels only).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Sampling Scope`
2. `## Non-Sampled Signals`
3. `## Default Rates`
4. `## Overrides`
5. `## Cardinality Limits`
6. `## Prohibited Fields`
7. `## Hashing`
8. `## Budgets`
9. `## Enforcement`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:OBS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OBS-10}}, {{xref:COST-04}} | OPTIONAL**
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
