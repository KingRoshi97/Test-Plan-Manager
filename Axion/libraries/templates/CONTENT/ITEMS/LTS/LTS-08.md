# LTS-08 — Log Volume Controls (sampling, rate limits)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LTS-08                                             |
| Template Type     | Operations / Logging & Tracing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring log volume controls (sampling, rate limits)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Log Volume Controls (sampling, rate limits) Document                         |

## 2. Purpose

Define the canonical controls for log volume and cost: per-level policies, sampling rules, rate
limiting, and guardrails that prevent log storms. This template must align with
sampling/cardinality policy and log routing/storage costs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Logging standard: {{xref:LTS-01}} | OPTIONAL
- Sampling/cardinality policy: {{xref:OBS-09}} | OPTIONAL
- Log routing/storage: {{xref:LTS-05}} | OPTIONAL
- Cost drivers: {{xref:COST-02}} | OPTIONAL
- Noise reduction: {{xref:ALRT-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Volume control scope (server/client)
Per-level volume rule (debug in prod?)
Sampling rules for noisy logs
Rate limiting rule (per message key)
Burst handling (log storms)
Allowlist for non-sampled critical logs (security/audit-adjacent)
Backpressure rule (drop strategy)
Telemetry requirements (dropped logs, rate-limit hits)
Runbook references (how to respond to log storms)
Change control rule (who can change sampling)

Optional Fields
Auto-throttling notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Do not sample away security/audit-critical logs beyond defined allowlist.
Prefer dropping DEBUG/INFO before WARN/ERROR under pressure.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Scope
scope: {{scope.value}}
2. Per-Level Rules
rules: {{levels.rules}}
3. Sampling
sampling_rules: {{sampling.rules}}
critical_allowlist: {{sampling.critical_allowlist}} | OPTIONAL
4. Rate Limiting
rate_limit_rule: {{rl.rule}}
keying_rule: {{rl.keying_rule}} | OPTIONAL
5. Burst Handling
storm_rule: {{storm.rule}}
drop_priority_rule: {{storm.drop_priority_rule}} | OPTIONAL
6. Backpressure
backpressure_rule: {{bp.rule}}
7. Telemetry
dropped_log_metric: {{telemetry.dropped_log_metric}}
rate_limit_hit_metric: {{telemetry.rate_limit_hit_metric}} | OPTIONAL
8. Runbooks
log_storm_runbook_ref: {{xref:LTS-10}} | OPTIONAL
incident_ref: {{xref:IRP-02}} | OPTIONAL
9. Change Control
who_can_change: {{change.who_can_change}}
approval_rule: {{change.approval_rule}} | OPTIONAL
Cross-References
Upstream: {{xref:OBS-09}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ALRT-02}}, {{xref:COST-04}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define per-level rules, sampling rules, and telemetry metric(s).

intermediate: Required. Define rate limiting, storm handling, and change control.
advanced: Required. Add auto-throttling and strict critical allowlists + runbook mapping.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, critical allowlist, keying rule, drop priority
rule, optional metrics, runbook refs, approval rule, auto-throttling, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If levels.rules is UNKNOWN → block Completeness Gate.
If sampling.rules is UNKNOWN → block Completeness Gate.
If bp.rule is UNKNOWN → block Completeness Gate.
If telemetry.dropped_log_metric is UNKNOWN → block Completeness Gate.
If change.who_can_change is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LTS
Pass conditions:
required_fields_present == true
volume_controls_defined == true
storm_and_backpressure_defined == true
telemetry_defined == true
change_control_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LTS-09

LTS-09 — Logging Verification (tests, scanners)
Header Block

## 5. Optional Fields

Auto-throttling notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- Do not sample away security/audit-critical logs beyond defined allowlist.
- **Prefer dropping DEBUG/INFO before WARN/ERROR under pressure.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Scope`
2. `## Per-Level Rules`
3. `## Sampling`
4. `## Rate Limiting`
5. `## Burst Handling`
6. `## Backpressure`
7. `## Telemetry`
8. `## Runbooks`
9. `## Change Control`

## 8. Cross-References

- **Upstream: {{xref:OBS-09}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-02}}, {{xref:COST-04}} | OPTIONAL**
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
