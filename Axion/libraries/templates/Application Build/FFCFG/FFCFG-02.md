# FFCFG-02 — Flag Behavior Spec (default, targeting, kill-switch)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FFCFG-02                                             |
| Template Type     | Build / Feature Flags                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring flag behavior spec (default, targeting, kill-switch)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Flag Behavior Spec (default, targeting, kill-switch) Document                         |

## 2. Purpose

Define the canonical specification format for a single feature flag’s behavior: default state,
targeting rules, rollout controls, kill-switch behavior, safe degradation expectations, and audit
requirements. This template must be consistent with the feature flag registry and must not
invent flag_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.registry}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| flag_id (must exist in... | spec         | Yes             |
| flag_name (human-reada... | spec         | Yes             |
| flag_description (one ... | spec         | Yes             |
| default_state (on/off)... | spec         | Yes             |
| targeting model (who g... | spec         | Yes             |
| targeting predicates (... | spec         | Yes             |
| rollout controls (perc... | spec         | Yes             |
| kill_switch behavior (... | spec         | Yes             |
| dependencies (other fl... | spec         | Yes             |
| observability hooks (m... | spec         | Yes             |

## 5. Optional Fields

Owner/team | OPTIONAL
User messaging copy | OPTIONAL

Experiment binding (A/B test id) | OPTIONAL
Expiration / sunset date | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new flag_ids; use only those in {{xref:FFCFG-01}}.
- Each flag spec MUST define default_state for every defined environment (or UNKNOWN).
- **Kill-switch MUST specify safe degradation behavior (or UNKNOWN flagged).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not restate rollout plan details that belong in {{xref:FFCFG-03}}; reference it.

## 7. Output Format

### Required Headings (in order)

1. `## Flag Identity`
2. `## Defaults (by Environment)`
3. `## default_state:`
4. `## Targeting Model`
5. `## Targeting Predicates (Rules List)`
6. `## rule`
7. `## (Repeat for each targeting rule.)`
8. `## Rollout Controls`
9. `## OPTIONAL`
10. `## Kill-Switch Behavior`

## 8. Cross-References

- **Upstream: {{xref:FFCFG-01}}, {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:STANDARDS_INDEX}}**
- | OPTIONAL
- **Downstream: {{xref:FFCFG-03}}, {{xref:FFCFG-05}}, {{xref:FFCFG-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
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
