# SKM-09 — Secrets Observability

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-09                                           |
| Template Type     | Security / Secrets                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring secrets observability     |
| Filled By         | Internal Agent                                   |
| Consumes          | SEC-07, CER-05, SKM-02                           |
| Produces          | Filled Secrets Observability                     |

## 2. Purpose

Define the canonical logging and redaction rules to prevent secrets/key material from being emitted into logs, traces, crash reports, or analytics. This template must align with SDLC secret scanning, application logging policy, and audit schema constraints.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Secure SDLC policy: {{xref:SEC-07}} | OPTIONAL
- Client/server logging policy: {{xref:CER-05}} | OPTIONAL
- Secrets storage/access policy: {{xref:SKM-02}} | OPTIONAL
- Audit schema: {{xref:AUDIT-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | UNKNOWN Allowed |
|---|---|
| No-secrets-in-logs rule (explicit) | No |
| Sensitive fields allowlist (what can be logged) | No |
| Sensitive fields denylist (tokens, keys, auth headers) | No |
| Redaction strategy (mask/hash/drop) | No |
| Logging wrappers/middleware rule (centralized logging) | No |
| Trace/span redaction rule | Yes |
| Crash report redaction rule | Yes |
| Verification rule (tests/scanners confirm no leakage) | No |
| Incident procedure if leakage detected (SKM-08 ref) | No |
| Telemetry requirements (redaction hits, leakage detections) | No |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| PII redaction coupling (PRIV-02) | OPTIONAL |
| Sampling rules | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Auth headers, cookies, tokens must never be logged.
- Redaction must occur before logs leave the process (not only in SIEM).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:SKM-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SEC-06}}, {{xref:COMP-09}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. Define denylist and core rule and verification rule. |
| Intermediate | Required. Define redaction strategy and crash/trace rules and telemetry. |
| Advanced | Required. Add PII coupling and sampling and strict tooling references. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, examples, trace/crash rules, tooling ref, optional metrics, pii coupling, sampling, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If core.no_secrets_rule is UNKNOWN → block Completeness Gate.
- If fields.denylist is UNKNOWN → block Completeness Gate.
- If redact.strategy is UNKNOWN → block Completeness Gate.
- If verify.rule is UNKNOWN → block Completeness Gate.
- If telemetry.redaction_hit_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SKM
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] denylist_defined == true
- [ ] redaction_defined == true
- [ ] verification_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

