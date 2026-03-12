# ANL-08 — Experimentation Support (flags/assignments)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ANL-08                                             |
| Template Type     | Operations / Analytics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring experimentation support (flags/assignments)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Experimentation Support (flags/assignments) Document                         |

## 2. Purpose

Define the canonical support for experimentation in analytics: how users are assigned to
variants, how assignments are logged, what fields are required in events for analysis, and how
experiments interact with feature flags and privacy constraints.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Feature flag registry: {{xref:FFCFG-01}} | OPTIONAL
- Flag behavior spec: {{xref:FFCFG-02}} | OPTIONAL
- Identity model: {{xref:ANL-04}} | OPTIONAL
- Funnels/KPIs: {{xref:ANL-07}} | OPTIONAL
- Event schema spec: {{xref:ANL-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Experiment identifier ... | spec         | Yes             |
| Assignment unit (user/... | spec         | Yes             |
| Randomization rule (ha... | spec         | Yes             |
| Sticky assignment rule... | spec         | Yes             |
| Exposure event require... | spec         | Yes             |
| Event enrichment rule ... | spec         | Yes             |
| Analysis constraints (... | spec         | Yes             |
| Privacy constraints (n... | spec         | Yes             |
| Kill-switch behavior (... | spec         | Yes             |

## 5. Optional Fields

Multi-armed bandit notes | OPTIONAL

A/A testing rule | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Assignments must be deterministic for a given unit during an experiment.**
- **Exposure events should be logged once per user per experiment (or defined frequency).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Identifiers`
2. `## Assignment`
3. `## Exposure`
4. `## Event Enrichment`
5. `## Analysis Constraints`
6. `## Privacy`
7. `## Kill-Switch`
8. `## Telemetry`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:FFCFG-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ANL-07}}, {{xref:ANL-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define assignment unit, sticky rule, and exposure rule.**
- **intermediate: Required. Define enrichment fields and privacy segmentation rule and telemetry.**
- **advanced: Required. Add A/A rules, bandit notes, and stricter analysis constraints and**
- kill-switch governance.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, exposure event name, optional telemetry**
- metric, bandit/A-A notes, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If assign.unit is UNKNOWN → block

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
