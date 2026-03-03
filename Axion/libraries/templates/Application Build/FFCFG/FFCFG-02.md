# FFCFG-02 — Flag Behavior Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FFCFG-02                                         |
| Template Type     | Build / Feature Flags                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring flag behavior spec        |
| Filled By         | Internal Agent                                   |
| Consumes          | FFCFG-01                                         |
| Produces          | Filled Flag Behavior Spec                        |

## 2. Purpose

Define the canonical specification format for a single feature flag's behavior: default state, targeting rules, rollout controls, kill-switch behavior, safe degradation expectations, and audit requirements. This template must be consistent with the feature flag registry and must not invent flag_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.registry}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| flag_id (must exist in FFCFG-01) | spec | No |
| flag_name (human-readable) | spec | No |
| flag_description (one paragraph) | spec | No |
| default_state (on/off) per environment | spec | No |
| targeting model (who gets it) | spec | No |
| targeting predicates (rules list) | spec | No |
| rollout controls (percent ramp, allowlist, segments) | spec | Yes |
| kill_switch behavior (what happens when forced off) | spec | No |
| safe degradation rules (what features disable / fallback paths) | spec | No |
| dependencies (other flags/configs) | spec | Yes |
| audit/change control fields (who can change, logging required) | spec | No |
| observability hooks (metrics/logs when evaluated) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Owner/team | spec | OPTIONAL |
| User messaging copy | spec | OPTIONAL |
| Experiment binding (A/B test id) | spec | OPTIONAL |
| Expiration / sunset date | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new flag_ids; use only those in {{xref:FFCFG-01}}.
- Each flag spec MUST define default_state for every defined environment (or UNKNOWN).
- Kill-switch MUST specify safe degradation behavior (or UNKNOWN flagged).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not restate rollout plan details that belong in {{xref:FFCFG-03}}; reference it.

## 7. Cross-References

- **Upstream**: {{xref:FFCFG-01}}, {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:STANDARDS_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FFCFG-03}}, {{xref:FFCFG-05}}, {{xref:FFCFG-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Use UNKNOWN where targeting/rollout details are missing; do not invent flag_ids. | Required. Define defaults, targeting predicates, and kill-switch behavior. | Required. Add safe degradation rigor and observability/audit completeness. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, owner, stage defaults, other_envs, targeting.population, rule priority/notes, segments, allowlist, ramp_schedule_ref, kill switch details, fallback components, api behavior, data consistency notes, deps.*, audit_fields, change_control_ref, exposure_metric, trace_attrs, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If flag_id is UNKNOWN → block Completeness Gate.
- If defaults.prod is UNKNOWN → block Completeness Gate.
- If kill_switch_supported is true and degrade.when_off_behavior is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.FFCFG
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] flag_id exists in FFCFG-01 (no new IDs introduced)
  - [ ] default_state_defined_for_envs == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

