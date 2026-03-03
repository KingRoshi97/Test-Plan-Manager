# MPUSH-06 — Push Observability (delivery rate, open rate, failures)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MPUSH-06                                         |
| Template Type     | Build / Push Notifications                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring push observability (deliv |
| Filled By         | Internal Agent                                   |
| Consumes          | MPUSH-04, RLIM-01, RLIM-03, RLIM-04              |
| Produces          | Filled Push Observability (delivery rate, open ra|

## 2. Purpose

Define the canonical abuse/spam controls for notifications: rate caps per user/type, detection signals for abusive senders, enforcement actions, and kill switches. This template must be consistent with rate limit policy and delivery rules and must not invent enforcement mechanisms not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MPUSH-01 Notification Types Catalog: {{mpush.types}} | OPTIONAL
- MPUSH-04 Delivery/Retry Rules: {{mpush.delivery_rules}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}}
- RLIM-03 Abuse Signals & Detection: {{rlim.abuse_signals}} | OPTIONAL
- RLIM-04 Enforcement Actions Matrix: {{rlim.actions}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.flags}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Rate caps (per user, per  | spec         | No              |
| Abuse signals (high frequ | spec         | No              |
| Detection rules (threshol | spec         | No              |
| Enforcement actions (thro | spec         | No              |
| Kill switch rules (global | spec         | No              |
| User experience rules (ho | spec         | No              |
| Telemetry requirements (b | spec         | No              |
| Audit logging requirement | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Allowlists/exemptions     | spec         | Enrichment only, no new truth  |
| Regional/legal constraint | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Controls MUST bind to RLIM action matrix where possible.
- Kill switches MUST be quickly actionable (flag-based) if available.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Push Observability (delivery rate, open rate, failures)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:RLIM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:ADMIN-02}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, signals notes, threshold model, actions
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If caps.definitions is UNKNOWN → block Completeness Gate.
- If enforce.action_rules is UNKNOWN → block Completeness Gate.
- If telemetry.caps_hit_metric is UNKNOWN → block Completeness Gate.
- If audit.fields is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.MPUSH
- Pass conditions:
- [ ] required_fields_present == true
- [ ] rate_caps_defined == true
- [ ] enforcement_defined == true
- [ ] telemetry_defined == true
- [ ] audit_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] App Store Release & Signing (SIGN)
- [ ] App Store Release & Signing (SIGN)
- [ ] SIGN-01 Build Artifact Types (debug/beta/prod)
- [ ] SIGN-02 Signing Keys & Rotation Policy
- [ ] SIGN-03 Store Submission Checklist (iOS/Android)
- [ ] SIGN-04 Versioning Rules (build numbers, semver mapping)
- [ ] SIGN-05 Release Channel Policy (internal/beta/GA)
- [ ] SIGN-01
