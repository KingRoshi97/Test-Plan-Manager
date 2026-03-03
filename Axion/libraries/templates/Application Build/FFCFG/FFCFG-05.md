# FFCFG-05 — Safe Degradation Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FFCFG-05                                         |
| Template Type     | Build / Feature Flags                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring safe degradation rules    |
| Filled By         | Internal Agent                                   |
| Consumes          | FFCFG-01, FFCFG-02                               |
| Produces          | Filled Safe Degradation Rules                    |

## 2. Purpose

Define the canonical safe degradation requirements when a feature flag is OFF (or kill-switched), including UI/API fallbacks, data write behavior, compatibility guarantees, and user experience rules. This template must be consistent with flag behavior specs and must not invent flag_ids or fallback behaviors not present in upstream inputs.

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
| Degradation policy statement (system-wide expectations) | spec | No |
| Per-flag degradation entries (flag_id binding) | spec | No |
| When-off behavior (what is disabled) | spec | No |
| Fallback path (UI routing/component fallback) | spec | No |
| API behavior when off (error vs no-op vs alternate impl) | spec | No |
| Data write behavior when off (block writes, queue, alternate storage) | spec | No |
| Backward compatibility rules (old clients/new servers) | spec | No |
| User messaging policy (what user sees) | spec | Yes |
| Security implications (ensure disabled means inaccessible) | spec | No |
| Observability hooks (metric/log for flag-off path usage) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Per-environment degradation differences | spec | OPTIONAL |
| Manual override behaviors | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new flag_ids; use only those in {{xref:FFCFG-01}}.
- Safe degradation MUST prevent data corruption and avoid breaking core flows.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Security rule: if feature is off, protected operations MUST remain denied (no "hidden but callable" endpoints).
- Do not restate full targeting/rollout details; those belong in FFCFG-02/03.

## 7. Cross-References

- **Upstream**: {{xref:FFCFG-01}}, {{xref:FFCFG-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FFCFG-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-SECURITY]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Use UNKNOWN where fallback behavior is not defined; do not invent per-flag entries. | Required. Define UI/API/data behaviors and ensure security-deny when off. | Required. Add compatibility matrix and robust observability requirements. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, compatibility_notes, user_message_policy, security_notes, logs_required_fields, compat.matrix, version_gating_policy, dashboards, alerts, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If entries list is UNKNOWN → block Completeness Gate.
- If api_off_behavior is UNKNOWN for any entry → flag in Open Questions.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.FFCFG
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] all flag_ids exist in FFCFG-01 (no new IDs introduced)
  - [ ] off_behavior_defined_per_flag == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

