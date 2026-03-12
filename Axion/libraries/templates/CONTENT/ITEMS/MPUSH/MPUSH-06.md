# MPUSH-06 — Abuse/Spam Controls for Notifications

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MPUSH-06                                             |
| Template Type     | Build / Push Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring abuse/spam controls for notifications    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Abuse/Spam Controls for Notifications Document                         |

## 2. Purpose

Define the canonical abuse/spam controls for notifications: rate caps per user/type, detection
signals for abusive senders, enforcement actions, and kill switches. This template must be
consistent with rate limit policy and delivery rules and must not invent enforcement mechanisms
not present in upstream inputs.

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
| Rate caps (per user, p... | spec         | Yes             |
| Detection rules (thres... | spec         | Yes             |
| Enforcement actions (t... | spec         | Yes             |
| Kill switch rules (glo... | spec         | Yes             |
| User experience rules ... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Audit logging requirem... | spec         | Yes             |

## 5. Optional Fields

Allowlists/exemptions | OPTIONAL

Regional/legal constraints | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Controls MUST bind to RLIM action matrix where possible.**
- **Kill switches MUST be quickly actionable (flag-based) if available.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Rate Caps`
2. `## Abuse Signals`
3. `## Detection Rules`
4. `## Enforcement Actions`
5. `## Kill Switches`
6. `## User Experience`
7. `## Telemetry`
8. `## Audit Logging`
9. `## References`
10. `## Cross-References`

## 8. Cross-References

- **Upstream: {{xref:RLIM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ADMIN-02}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
