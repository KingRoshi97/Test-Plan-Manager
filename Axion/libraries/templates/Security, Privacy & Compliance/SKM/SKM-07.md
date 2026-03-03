# SKM-07 — Secret Lifecycle Management

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-07                                           |
| Template Type     | Security / Secrets                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring secret lifecycle manageme |
| Filled By         | Internal Agent                                   |
| Consumes          | SKM-02, IAM-05, SEC-07                           |
| Produces          | Filled Secret Lifecycle Management               |

## 2. Purpose

Define the canonical mechanisms for distributing secrets to runtime workloads and CI/CD: how services fetch secrets, how identities are used, how secrets are refreshed, and what is prohibited. This template must align with storage/access policy and Secure SDLC rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Storage/access policy: {{xref:SKM-02}} | OPTIONAL
- Service-to-service identity: {{xref:IAM-05}} | OPTIONAL
- Secure SDLC: {{xref:SEC-07}} | OPTIONAL
- Scheduling rules (jobs/workers): {{xref:JBS-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | UNKNOWN Allowed |
|---|---|
| Runtime distribution model (fetch at startup, sidecar, env inject, UNKNOWN) | Yes |
| CI distribution model (ephemeral tokens, secrets vault integration) | No |
| Identity binding rule (service identity → secret access) | No |
| Refresh/renewal rule (how secrets updated without redeploy) | Yes |
| Caching rules (in-memory only, TTL) | No |
| Least privilege distribution rule (only what needed) | No |
| Prohibited patterns (write secrets to disk/logs) | No |
| Failure behavior (fail closed vs degrade) | No |
| Telemetry requirements (fetch failures, denied access) | No |
| Audit requirements (secret reads) | No |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Local dev workflow | OPTIONAL |
| Multi-region considerations | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Secrets should be fetched dynamically where possible; avoid long-lived env vars in prod.
- Do not store secrets on disk unless explicitly approved and encrypted.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:SKM-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SKM-08}}, {{xref:SKM-10}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. Define runtime/CI models and prohibited patterns and fail behavior. |
| Intermediate | Required. Define refresh/caching rules and telemetry and audit requirement. |
| Advanced | Required. Add local dev workflow and multi-region notes and strict binding rules. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, fetch rule, ephemeral token rule, refresh rule, cache ttl, access denied behavior, audit ref, local dev/multi-region, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If runtime.model is UNKNOWN → block Completeness Gate.
- If ci.model is UNKNOWN → block Completeness Gate.
- If id.binding_rule is UNKNOWN → block Completeness Gate.
- If ban.list is UNKNOWN → block Completeness Gate.
- If telemetry.fetch_failure_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SKM
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] distribution_models_defined == true
- [ ] binding_and_fail_behavior_defined == true
- [ ] prohibited_patterns_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

