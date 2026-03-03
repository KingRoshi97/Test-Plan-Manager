# FFCFG-01 — Feature Flag Registry

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FFCFG-01                                         |
| Template Type     | Build / Feature Flags                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring feature flag registry     |
| Filled By         | Internal Agent                                   |
| Consumes          |                                                  |
| Produces          | Filled Feature Flag Registry                     |

## 2. Purpose

Create the single, canonical registry of all feature flags in the system, indexed by flag_id. This document must be consistent with the Canonical Spec and must not invent flag_ids not present in upstream inputs. If flags are missing, they must be marked UNKNOWN rather than invented.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Feature flag index (list of flag entries) | spec | No |
| flag_id (stable identifier) | spec | No |
| flag_name (human-readable) | spec | No |
| flag_description (one paragraph) | spec | No |
| flag_type (release/ops/experiment/kill_switch/UNKNOWN) | spec | Yes |
| owner/team | spec | No |
| default_state (on/off) baseline | spec | No |
| environments covered (dev/stage/prod/other) | spec | No |
| status (active/deprecated/retired) | spec | No |
| related feature IDs (if applicable) | spec | Yes |
| references (pointers to behavior spec FFCFG-02 and rollout plan FFCFG-03) | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Created_at / updated_at | spec | OPTIONAL |
| Expiration / sunset date | spec | OPTIONAL |
| Notes | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new flag_ids. Use only: {{spec.flags_by_id[flag_*]}} as given.
- Each flag entry MUST be unique by flag_id.
- Each flag entry SHOULD have a behavior spec reference ({{xref:FFCFG-02}}) and rollout plan reference ({{xref:FFCFG-03}}) or be marked UNKNOWN and flagged.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not restate full flag behavior here; behavior belongs in FFCFG-02.

## 7. Cross-References

- **Upstream**: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:DOMAIN_MAP}} | OPTIONAL, {{xref:STANDARDS_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FFCFG-02}}, {{xref:FFCFG-03}}, {{xref:FFCFG-04}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Fill required fields with UNKNOWN where needed; do not invent flag_ids. | Required. Populate owner/type/status and behavior/rollout references when inputs exist. | Required. Add env-specific defaults and lifecycle details (deprecated/retired) with traceability. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, stage env, related_feature_ids, behavior_spec_ref, rollout_plan_ref, created_at, updated_at, sunset_date, notes, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If flag_id list is UNKNOWN → block Completeness Gate.
- If defaults.prod is UNKNOWN for any flag → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.FFCFG
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] all flag_ids are unique (no duplicates)
  - [ ] no new flag_ids introduced (only references to existing IDs)
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

