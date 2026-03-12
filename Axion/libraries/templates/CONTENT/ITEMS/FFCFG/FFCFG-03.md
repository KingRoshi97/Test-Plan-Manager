# FFCFG-03 — Rollout Plan (phased, canary, % ramp)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FFCFG-03                                             |
| Template Type     | Build / Feature Flags                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring rollout plan (phased, canary, % ramp)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Rollout Plan (phased, canary, % ramp) Document                         |

## 2. Purpose

Define the canonical rollout plan format for a feature flag, including staged deployment (dev →
stage → prod), canary cohorts, percent ramp schedules, monitoring requirements, rollback
steps, and exit criteria. This template must be consistent with the flag registry and behavior
specs and must not invent flag_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.registry}}
- FFCFG-02 Flag Behavior Specs: {{ffcfg.behavior_specs}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| flag_id (must exist in... | spec         | Yes             |
| rollout objective (why... | spec         | Yes             |
| environments sequence ... | spec         | Yes             |
| phases (ordered list)     | spec         | Yes             |
| phase entry criteria      | spec         | Yes             |
| phase ramp plan (% or ... | spec         | Yes             |
| monitoring plan (what ... | spec         | Yes             |
| rollback plan (what to... | spec         | Yes             |
| kill-switch instructions  | spec         | Yes             |
| exit criteria (when ro... | spec         | Yes             |
| audit/change control r... | spec         | Yes             |

## 5. Optional Fields

Stakeholders/approvers | OPTIONAL
Communication plan | OPTIONAL

Experiment design notes | OPTIONAL
Sunset plan (remove flag) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new flag_ids; use only those in {{xref:FFCFG-01}}.
- **Rollout phases MUST be strictly ordered and must define entry criteria.**
- **Rollback MUST reference the kill-switch behavior from {{xref:FFCFG-02}} (or be UNKNOWN**
- **flagged).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not restate full flag behavior; reference FFCFG-02.

## 7. Output Format

### Required Headings (in order)

1. `## Rollout Identity`
2. `## Environment Sequence`
3. `## env_sequence:`
4. `## Phases (Ordered)`
5. `## Phase`
6. `## ramp:`
7. `## (Repeat the “Phase” block for each rollout phase.)`
8. `## Monitoring Plan (Global)`
9. `## metrics_to_watch:`
10. `## Rollback Plan (Global)`

## 8. Cross-References

- **Upstream: {{xref:FFCFG-01}}, {{xref:FFCFG-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FFCFG-04}}, {{xref:FFCFG-05}}, {{xref:FFCFG-06}} | OPTIONAL**
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
