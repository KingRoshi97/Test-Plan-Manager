# MPUSH-03 — Targeting & Segmentation Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MPUSH-03                                         |
| Template Type     | Build / Push Notifications                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring targeting & segmentation  |
| Filled By         | Internal Agent                                   |
| Consumes          | MPUSH-01, MDC-02                                 |
| Produces          | Filled Targeting & Segmentation Rules            |

## 2. Purpose

Define the canonical rules for push notification permission prompts and opt-in flows on iOS/Android, including when to ask, pre-prompt rationale, user preference settings, and handling of denied permissions. This template must be consistent with notification catalog and mobile permission UX rules and must not invent opt-in behaviors not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MPUSH-01 Notification Types Catalog: {{mpush.types}}
- MDC-02 Permissions UX Rules: {{mdc.permissions_ux}} | OPTIONAL
- MPUSH-06 Abuse/Spam Controls: {{mpush.abuse_controls}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| iOS permission prompt tim | spec         | No              |
| Android permission rules  | spec         | No              |
| Pre-prompt rationale rule | spec         | No              |
| Opt-in preference model ( | spec         | No              |
| Default opt-in states (pe | spec         | No              |
| Denied handling rules (ho | spec         | No              |
| Settings screen rules (wh | spec         | No              |
| Telemetry requirements (p | spec         | No              |
| Quiet hours support (if a | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Provisional authorization | spec         | Enrichment only, no new truth  |
| Topic subscriptions       | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Permission prompts SHOULD be triggered by user intent and not shown immediately on first
- launch unless explicitly required.
- Opt-in behavior MUST respect user choices and platform rules.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Targeting & Segmentation Rules`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:MPUSH-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:MPUSH-04}}, {{xref:MPUSH-06}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Core Fields                | Required  | Required     | Required |
| Extended Fields             | Optional  | Required     | Required |
| Coverage Checks            | Optional  | Optional     | Required |

## 10. Unknown Handling

Unknowns must be written in the following format:

```
UNKNOWN-<NNN>: [Area] <summary>
Impact: Low|Med|High
Blocking: Yes|No
Needs: <what input resolves it>
Refs: <spec_id/entity_id/field_path>
```

- UNKNOWN_ALLOWED: domain.map, glossary.terms, pre prompt required, android ask when,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If ios.ask_when is UNKNOWN → block Completeness Gate.
- If prefs.default_states_by_type is UNKNOWN → block Completeness Gate.
- If telemetry.prompt_shown_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.MPUSH
- Pass conditions:
- [ ] required_fields_present == true
- [ ] permission_timing_defined == true
- [ ] preference_model_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] MPUSh-04
