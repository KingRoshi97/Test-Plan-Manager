# TMA-06 — Rate Limit & Bot Defense Strategy (captcha, device signals)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-06                                             |
| Template Type     | Security / Threat Modeling                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring rate limit & bot defense strategy (captcha, device signals)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Rate Limit & Bot Defense Strategy (captcha, device signals) Document                         |

## 2. Purpose

Define the canonical strategy for bot defense and rate limiting: what surfaces are protected,
what signals are used, what enforcement actions exist, and how users recover from false
positives. This template must align with rate limit policies/catalogs and the attack surface
inventory.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Attack surface inventory: {{xref:TMA-03}} | OPTIONAL
- Rate limit policy: {{xref:RLIM-01}} | OPTIONAL
- Rate limit catalog: {{xref:RLIM-02}} | OPTIONAL
- Abuse signals: {{xref:RLIM-03}} | OPTIONAL
- Enforcement matrix: {{xref:RLIM-04}} | OPTIONAL
- Form anti-abuse: {{xref:FORM-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Protected surfaces list (surface_id refs)
Bot signal sources (ip/device/user behavior)
Challenge mechanisms supported (captcha/email verify/UNKNOWN)
Rate limit strategy (global + per surface)
Escalation ladder (warn → throttle → block)
False positive recovery process
Exemptions/allowlist policy
Telemetry requirements (bot blocks, captcha pass rate)
Privacy constraints (minimize device fingerprinting)
Runbook references (RLIM-06 / SEC-10)

Optional Fields
Adaptive risk scoring notes | OPTIONAL
Geo-based rules | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Bot defense must not rely on collecting excessive PII; prefer coarse signals where possible.
Recovery process must exist and be documented.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Protected Surfaces
surfaces: {{protect.surfaces}}
2. Signals
signals: {{signals.list}}
collection_rules: {{signals.collection_rules}} | OPTIONAL
3. Challenges
supported: {{challenge.supported}}
types: {{challenge.types}} | OPTIONAL
4. Rate Limit Strategy
policy_ref: {{rate.policy_ref}} (expected: {{xref:RLIM-01}}) | OPTIONAL
catalog_ref: {{rate.catalog_ref}} (expected: {{xref:RLIM-02}}) | OPTIONAL
5. Escalation Ladder
ladder: {{enforce.ladder}}
6. False Positives
recovery_process: {{fp.recovery_process}}
appeals_rule: {{fp.appeals_rule}} | OPTIONAL
7. Exemptions
exemptions_supported: {{exempt.supported}}
allowlist_policy: {{exempt.allowlist_policy}} | OPTIONAL
8. Telemetry
bot_block_metric: {{telemetry.bot_block_metric}}
captcha_pass_metric: {{telemetry.captcha_pass_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
9. Privacy Constraints
minimization_rule: {{privacy.minimization_rule}}
device_id_policy: {{privacy.device_id_policy}} | OPTIONAL
10.References
Rate limit catalog: {{xref:RLIM-02}} | OPTIONAL
Abuse signals: {{xref:RLIM-03}} | OPTIONAL
Enforcement matrix: {{xref:RLIM-04}} | OPTIONAL
Security runbooks: {{xref:SEC-10}} | OPTIONAL

Cross-References
Upstream: {{xref:TMA-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:TMA-07}}, {{xref:RLIM-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define protected surfaces, escalation ladder, and recovery process.
intermediate: Required. Define challenges and exemptions and telemetry metrics.
advanced: Required. Add adaptive/geo rules and strict minimization and evidence pointers.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, collection rules, challenge types, refs,
appeals, allowlist policy, captcha metric/fields, device id policy, adaptive/geo notes,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If protect.surfaces is UNKNOWN → block Completeness Gate.
If enforce.ladder is UNKNOWN → block Completeness Gate.
If fp.recovery_process is UNKNOWN → block Completeness Gate.
If telemetry.bot_block_metric is UNKNOWN → block Completeness Gate.
If privacy.minimization_rule is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.TMA
Pass conditions:
required_fields_present == true
surfaces_and_signals_defined == true
escalation_and_recovery_defined == true
privacy_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

TMA-07

TMA-07 — Content/Message Abuse Controls (spam, harassment, scams)
Header Block

## 5. Optional Fields

Adaptive risk scoring notes | OPTIONAL
Geo-based rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Bot defense must not rely on collecting excessive PII; prefer coarse signals where possible.**
- **Recovery process must exist and be documented.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Protected Surfaces`
2. `## Signals`
3. `## Challenges`
4. `## Rate Limit Strategy`
5. `## Escalation Ladder`
6. `## False Positives`
7. `## Exemptions`
8. `## Telemetry`
9. `## Privacy Constraints`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:TMA-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:TMA-07}}, {{xref:RLIM-06}} | OPTIONAL**
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
