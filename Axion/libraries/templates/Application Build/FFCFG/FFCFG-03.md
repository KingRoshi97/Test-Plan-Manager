# FFCFG-03 — Rollout Plan

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FFCFG-03                                         |
| Template Type     | Build / Feature Flags                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring rollout plan              |
| Filled By         | Internal Agent                                   |
| Consumes          | FFCFG-01, FFCFG-02                               |
| Produces          | Filled Rollout Plan                              |

## 2. Purpose

Define the canonical rollout plan format for a feature flag, including staged deployment (dev → stage → prod), canary cohorts, percent ramp schedules, monitoring requirements, rollback steps, and exit criteria. This template must be consistent with the flag registry and behavior specs and must not invent flag_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.registry}}
- FFCFG-02 Flag Behavior Specs: {{ffcfg.behavior_specs}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| flag_id (must exist in FFCFG-01) | spec | No |
| rollout objective (why/what success means) | spec | No |
| environments sequence (dev/stage/prod) | spec | No |
| phases (ordered list) | spec | No |
| phase entry criteria | spec | No |
| phase ramp plan (% or cohort) | spec | Yes |
| monitoring plan (what to watch) | spec | No |
| rollback plan (what to do if issues) | spec | No |
| kill-switch instructions | spec | No |
| exit criteria (when rollout is "done") | spec | No |
| audit/change control requirements (who can flip, logging) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Stakeholders/approvers | spec | OPTIONAL |
| Communication plan | spec | OPTIONAL |
| Experiment design notes | spec | OPTIONAL |
| Sunset plan (remove flag) | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new flag_ids; use only those in {{xref:FFCFG-01}}.
- Rollout phases MUST be strictly ordered and must define entry criteria.
- Rollback MUST reference the kill-switch behavior from {{xref:FFCFG-02}} (or be UNKNOWN flagged).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not restate full flag behavior; reference FFCFG-02.

## 7. Cross-References

- **Upstream**: {{xref:FFCFG-01}}, {{xref:FFCFG-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FFCFG-04}}, {{xref:FFCFG-05}}, {{xref:FFCFG-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Use UNKNOWN for metrics/criteria if not defined; do not invent phases. | Required. Define phase ordering, monitoring, rollback, and kill-switch steps. | Required. Add crisp exit criteria and change control rigor with approvers and audit fields. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, owner, env_notes, ramp percent/cohort, duration, notes, dashboards, alert_refs, kill_switch_steps, recovery_validation, post_rollout_steps, approval_required, audit_fields, stakeholders, comms, experiment notes, sunset plan, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If phases list is UNKNOWN → block Completeness Gate.
- If rollback plan is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.FFCFG
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] flag_id exists in FFCFG-01 (no new IDs introduced)
  - [ ] phase_order_defined == true
  - [ ] rollback_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

