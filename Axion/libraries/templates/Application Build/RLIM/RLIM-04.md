# RLIM-04 — Enforcement Actions Matrix (throttle/ban/captcha)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLIM-04                                             |
| Template Type     | Build / Rate Limiting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring enforcement actions matrix (throttle/ban/captcha)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Enforcement Actions Matrix (throttle/ban/captcha) Document                         |

## 2. Purpose

Define the canonical matrix of enforcement actions that can be applied when rate limiting or
abuse rules trigger, including throttling, temporary blocks, bans, step-up challenges (captcha),
and escalation procedures. This template must be consistent with the rate limit policy and
detection rules and must not invent enforcement capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}}
- RLIM-03 Abuse Signals & Detection Rules: {{abuse.rules}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Action catalog (action... | spec         | Yes             |
| Action definitions (wh... | spec         | Yes             |
| Applicability (what su... | spec         | Yes             |
| Duration model (fixed/... | spec         | Yes             |
| Escalation ladder (rep... | spec         | Yes             |
| Reversal/unban policy ... | spec         | Yes             |
| Safety constraints (av... | spec         | Yes             |

## 5. Optional Fields

Captcha/challenge provider integration notes | OPTIONAL
Per-tenant enforcement overrides | OPTIONAL

Manual review workflow | OPTIONAL
Progressive trust scoring notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not define detection rules here; bind to {{xref:RLIM-03}}.
- **Actions MUST be deterministic in effect (clear scope + duration + enforcement point).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **User-facing responses MUST map to {{xref:API-03}} | OPTIONAL**
- All overrides/unbans MUST be audited (or UNKNOWN flagged).

## 7. Output Format

### Required Headings (in order)

1. `## Action Catalog (by action_id)`
2. `## Action`
3. `## response_mapping:`
4. `## (Repeat for each action_id.)`
5. `## Severity → Action Bindings (Matrix)`
6. `## Binding`
7. `## (Repeat for each severity or mapping class.)`
8. `## Escalation Ladder`
9. `## stages:`
10. `## Reversal / Unban Policy`

## 8. Cross-References

- **Upstream: {{xref:RLIM-01}}, {{xref:RLIM-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:RLIM-05}}, {{xref:RLIM-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}}
- | OPTIONAL

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
