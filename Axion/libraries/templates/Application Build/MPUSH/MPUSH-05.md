# MPUSH-05 — Opt-In/Opt-Out & Preferences Model

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MPUSH-05                                         |
| Template Type     | Build / Push Notifications                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring opt-in/opt-out & preferen |
| Filled By         | Internal Agent                                   |
| Consumes          | MPUSH-01, MPUSH-02, MDL-02                       |
| Produces          | Filled Opt-In/Opt-Out & Preferences Model        |

## 2. Purpose

Define the canonical behavior when a user taps a push notification: how the payload routing fields are parsed, how deep link routing is invoked, and how cold start vs warm start behavior differs. This template must be consistent with payload contract and mobile routing rules and must not invent notification targets not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MPUSH-01 Notification Types Catalog: {{mpush.types}}
- MPUSH-02 Payload Contract: {{mpush.payload_contract}}
- MDL-02 Routing Rules: {{mobile.routing_rules}}
- MDL-04 Fallback Behavior: {{mobile.fallback}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Tap handling entrypoint ( | spec         | No              |
| Routing field extraction  | spec         | No              |
| Cold start tap behavior ( | spec         | No              |
| Warm start tap behavior ( | spec         | No              |
| Auth gating on tap (logge | spec         | No              |
| Invalid routing handling  | spec         | No              |
| Telemetry (tap events, ro | spec         | No              |
| Analytics event fields (n | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Action buttons behavior ( | spec         | Enrichment only, no new truth  |
| Badge clearing rules      | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Tap routing MUST use MDL routing rules and deep link allowlists.
- Invalid/unknown routes MUST follow MDL-04 fallback.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Opt-In/Opt-Out & Preferences Model`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:MPUSH-01}}, {{xref:MPUSH-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:MPUSH-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, campaign fields, init order, preserve
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If handler.function is UNKNOWN → block Completeness Gate.
- If extract.routing_fields_rule is UNKNOWN → block Completeness Gate.
- If fallback.invalid_payload_behavior is UNKNOWN → block Completeness Gate.
- If telemetry.tap_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.MPUSH
- Pass conditions:
- [ ] required_fields_present == true
- [ ] tap_handling_defined == true
- [ ] routing_and_fallback_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] MPUSH-06
