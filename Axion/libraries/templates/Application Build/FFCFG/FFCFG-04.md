# FFCFG-04 — Config Matrix

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FFCFG-04                                         |
| Template Type     | Build / Feature Flags                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring config matrix             |
| Filled By         | Internal Agent                                   |
| Consumes          | FFCFG-01                                         |
| Produces          | Filled Config Matrix                             |

## 2. Purpose

Create the canonical matrix of configuration values by environment (env vars, runtime settings, service configs), including defaults, requiredness, secrets handling, and change control. This template must be consistent with the feature/config registry and must not invent config keys not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.registry}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Config key registry (config_id/config_key list) | spec | No |
| Description/purpose for each config key | spec | No |
| Type (string/int/bool/json/secret/UNKNOWN) | spec | Yes |
| Requiredness (required/optional) | spec | No |
| Default value policy (global default + env overrides) | spec | Yes |
| Environment columns (dev/stage/prod/other) | spec | No |
| Secret handling (where stored, not in repo) | spec | No |
| Validation rules (format/range) | spec | Yes |
| Change control policy (who can change, audit/logging) | spec | No |
| Runtime reload behavior (hot reload vs restart required) | spec | No |
| Dependencies (what relies on the config) | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Owner/team | spec | OPTIONAL |
| Rotation policy (for secrets) | spec | OPTIONAL |
| Deprecation/sunset plan | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new config keys; use only: {{spec.config_by_id[cfg_*]}} as given.
- Secrets MUST NOT be stored as plaintext in this document (store references only).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- If a config is required in prod, prod value MUST be set (not UNKNOWN) unless explicitly allowed by standards.

## 7. Cross-References

- **Upstream**: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:STANDARDS_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FFCFG-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-SECRETS]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Use UNKNOWN where values are missing; do not invent config keys. | Required. Populate env values and validation rules from inputs. | Required. Add reload behavior, dependencies, and change control rigor. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, default_policy, validation, secret_ref (as reference only), dependencies, stage/other envs, approval_required, owner, rotation_policy, deprecation_plan, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If configs list is UNKNOWN → block Completeness Gate.
- If required == true and values.prod is UNKNOWN → block Completeness Gate unless explicitly allowed by standards.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.FFCFG
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] no new config keys introduced (only references to existing IDs)
  - [ ] secret_values_not_in_plaintext == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

