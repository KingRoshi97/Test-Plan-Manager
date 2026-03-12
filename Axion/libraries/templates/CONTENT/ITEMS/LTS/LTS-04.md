# LTS-04 — PII/Secret Redaction Standard (denylist, masking)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LTS-04                                             |
| Template Type     | Operations / Logging & Tracing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring pii/secret redaction standard (denylist, masking)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled PII/Secret Redaction Standard (denylist, masking) Document                         |

## 2. Purpose

Define the canonical redaction standard used across logs, traces, analytics, crash reports, and
audit-adjacent logs: denylist fields, masking rules, hashing rules, and enforcement. This is the
global rulebook for “what must never appear” in telemetry.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PII classification model: {{xref:PRIV-02}} | OPTIONAL
- Data minimization rules: {{xref:PRIV-03}} | OPTIONAL
- Secrets logging rules: {{xref:SKM-09}} | OPTIONAL
- Telemetry redaction rules: {{xref:OBS-06}} | OPTIONAL
- Audit PII handling: {{xref:AUDIT-08}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Global denylist fields (auth headers, cookies, tokens, secrets)
PII tier rules (what is masked/hashed/dropped)
Masking patterns (email/phone)
Hashing rule (salted hash)
Structured redaction rule (field-based)
Unstructured redaction rule (regex scanning)
Redaction application points (before export, before sink)
Allowlist policy (what can remain)
Verification rule (tests/scanners)
Incident procedure if leakage detected (SKM-08)
Telemetry requirements (redaction hits, leakage detections)

Optional Fields
Per-sink differences (SIEM vs app logs) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Redaction must occur before data leaves the process (not just downstream).
Default to drop over mask when uncertain.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Denylist
fields: {{deny.fields}}
2. PII Tier Rules
tier_rules: {{pii.tier_rules}}
3. Masking
patterns: {{mask.patterns}}
examples: {{mask.examples}} | OPTIONAL
4. Hashing
hash_rule: {{hash.rule}}
salt_key_ref: {{hash.salt_key_ref}} | OPTIONAL
5. Structured Redaction
field_based_rule: {{struct.rule}}
6. Unstructured Redaction
regex_rule: {{unstruct.regex_rule}}
scanner_rule: {{unstruct.scanner_rule}} | OPTIONAL
7. Application Points
apply_before_emit_rule: {{apply.before_emit_rule}}
apply_before_export_rule: {{apply.before_export_rule}} | OPTIONAL
8. Allowlist
allowlist_policy: {{allow.policy}}
allow_fields: {{allow.fields}} | OPTIONAL
9. Verification
verification_rule: {{verify.rule}}
tooling_ref: {{verify.tooling_ref}} | OPTIONAL
10.Leakage Procedure
leak_rule: {{leak.rule}}
compromise_ref: {{xref:SKM-08}} | OPTIONAL
11.Telemetry
redaction_hit_metric: {{telemetry.redaction_hit_metric}}
leak_detect_metric: {{telemetry.leak_detect_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:PRIV-02}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:LTS-09}}, {{xref:ALRT-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define denylist, tier rules, apply-before-emit rule, verification rule.
intermediate: Required. Define masking patterns and hashing rule and telemetry metrics.
advanced: Required. Add per-sink differences and strict allowlist governance and scanner
coverage targets.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, examples, salt key ref, scanner rule,
apply-before-export, allow fields, tooling ref, optional metric, per-sink, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If deny.fields is UNKNOWN → block Completeness Gate.
If pii.tier_rules is UNKNOWN → block Completeness Gate.
If apply.before_emit_rule is UNKNOWN → block Completeness Gate.
If verify.rule is UNKNOWN → block Completeness Gate.
If telemetry.redaction_hit_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LTS
Pass conditions:
required_fields_present == true
denylist_and_tier_rules_defined == true
masking_and_hashing_defined == true
verification_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LTS-05

LTS-05 — Log Routing & Storage (sinks, retention classes)
Header Block

## 5. Optional Fields

Per-sink differences (SIEM vs app logs) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Redaction must occur before data leaves the process (not just downstream).**
- **Default to drop over mask when uncertain.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Denylist`
2. `## PII Tier Rules`
3. `## Masking`
4. `## Hashing`
5. `## Structured Redaction`
6. `## Unstructured Redaction`
7. `## Application Points`
8. `## Allowlist`
9. `## Verification`
10. `## Leakage Procedure`

## 8. Cross-References

- **Upstream: {{xref:PRIV-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LTS-09}}, {{xref:ALRT-02}} | OPTIONAL**
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
