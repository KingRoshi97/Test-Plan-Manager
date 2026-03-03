# CER-03 — Retry & Recovery Patterns (auto-retry, circuit breaker)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CER-03                                           |
| Template Type     | Build / Error Handling                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring retry & recovery patterns |
| Filled By         | Internal Agent                                   |
| Consumes          | FE-03, FE-07, SMD-05                             |
| Produces          | Filled Retry & Recovery Patterns (auto-retry, cir|

## 2. Purpose

Define the canonical user experience for offline and degraded-error modes: what UI is shown when offline, how cached data is indicated, what actions are disabled, how queued operations are communicated, and how the client recovers when connectivity returns. This template must be consistent with UI state model and offline state handling and must not invent UX states not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FE-03 UI State Model: {{fe.state_model}}
- FE-07 Error Handling UX: {{fe.error_ux}} | OPTIONAL
- SMD-05 Offline Handling: {{smd.offline_handling}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Offline detection UX trig | spec         | No              |
| Global offline banner/ind | spec         | No              |
| Per-screen offline afford | spec         | No              |
| Cached/stale data labelin | spec         | No              |
| Queued write indicator ru | spec         | No              |
| Disabled action rules (wh | spec         | No              |
| Copy policy (what to say) | spec         | No              |
| Recovery UX (reconnect, r | spec         | No              |
| Accessibility rules (anno | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Airplane mode differences | spec         | Enrichment only, no new truth  |
| Per-route exceptions      | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Offline UX MUST match offline handling model ({{xref:SMD-05}}).
- Offline status changes SHOULD be announced for accessibility ({{xref:FE-05}}) | OPTIONAL.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Retry & Recovery Patterns (auto-retry, circuit breaker)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FE-03}}, {{xref:SMD-05}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:CER-04}}, {{xref:CER-05}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-A11Y]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, banner placement/icon rule,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If offline.trigger_rule is UNKNOWN → block Completeness Gate.
- If ui.banner_enabled is UNKNOWN → block Completeness Gate.
- If recovery.on_reconnect_behavior is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CER
- Pass conditions:
- [ ] required_fields_present == true
- [ ] offline_indicator_defined == true
- [ ] stale_and_queue_rules_defined == true
- [ ] recovery_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CER-04
