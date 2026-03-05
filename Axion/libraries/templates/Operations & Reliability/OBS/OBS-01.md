# OBS-01 — Observability Overview (scope, principles, toolchain)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OBS-01                                             |
| Template Type     | Operations / Observability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring observability overview (scope, principles, toolchain)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Observability Overview (scope, principles, toolchain) Document                         |

## 2. Purpose

Create the single, canonical overview of observability for the system: what is measured, why,
where telemetry lives, and the principles and toolchain used to achieve reliable operations. This
document anchors the Ops/Observability set and must align with security monitoring and audit
schema requirements.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security monitoring baseline: {{xref:SEC-06}} | OPTIONAL
- Audit schema/correlation IDs: {{xref:AUDIT-02}} | OPTIONAL
- Logging standard: {{xref:LTS-01}} | OPTIONAL
- Alerting overview: {{xref:ALRT-01}} | OPTIONAL
- SLO overview: {{xref:SLO-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Observability scope (what services/surfaces covered)
Telemetry pillars (logs/metrics/traces + optional profiles)
Primary goals (detect, diagnose, measure user impact)
Core principles (cardinality, cost awareness, privacy)
Toolchain inventory (metrics/logs/traces vendors/tools)
Environment coverage (dev/stage/prod)
Ownership model (who owns instrumentation/alerts)
Data governance rules (PII/secret redaction refs)
Oncall/alerting linkage (ALRT refs)
SLO linkage (what SLOs depend on)
Completeness definition (what “instrumented” means)

Optional Fields
Migration/rollout notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Do not log secrets or raw PII; reference redaction standards.
Every claim should be traceable to inputs or marked UNKNOWN.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Scope
In-scope surfaces:
{{scope.in[0]}}
{{scope.in[1]}}
Out-of-scope (explicit):
{{scope.out[0]}} | OPTIONAL
{{scope.out[1]}} | OPTIONAL
2. Telemetry Pillars
pillers_enabled: {{pillars.enabled}} (logs/metrics/traces/profiles)
notes: {{pillars.notes}} | OPTIONAL
3. Goals
{{goals[0]}}
{{goals[1]}}
{{goals[2]}} | OPTIONAL
4. Principles
{{principles[0]}}
{{principles[1]}}
{{principles[2]}}
5. Toolchain
metrics_tool: {{tools.metrics}}
logs_tool: {{tools.logs}}
traces_tool: {{tools.traces}}
profiling_tool: {{tools.profiling}} | OPTIONAL
6. Environment Coverage
dev: {{env.dev}}
stage: {{env.stage}}
prod: {{env.prod}}
7. Ownership
instrumentation_owner: {{owners.instrumentation_owner}}
alert_owner: {{owners.alert_owner}}
dashboard_owner: {{owners.dashboard_owner}} | OPTIONAL
8. Data Governance
redaction_ref: {{xref:LTS-04}} | OPTIONAL

audit_linkage_ref: {{xref:AUDIT-02}} | OPTIONAL
pii_rule: {{governance.pii_rule}}
secret_rule: {{governance.secret_rule}}
9. Alerting & Oncall Linkage
alerting_overview_ref: {{xref:ALRT-01}} | OPTIONAL
routing_policy_ref: {{xref:ALRT-04}} | OPTIONAL
10.SLO Linkage
slo_overview_ref: {{xref:SLO-01}} | OPTIONAL
critical_services: {{slo.critical_services}} | OPTIONAL
11.Completeness Definition
instrumented_definition: {{complete.instrumented_definition}}
minimum_required_signals: {{complete.minimum_signals}}
12.References
Telemetry schema: {{xref:OBS-02}} | OPTIONAL
Metrics catalog: {{xref:OBS-03}} | OPTIONAL
Dashboards: {{xref:OBS-07}} | OPTIONAL
Cross-References
Upstream: {{xref:SEC-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:OBS-02}}, {{xref:ALRT-02}}, {{xref:SLO-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define scope, pillars, toolchain, and completeness definition (UNKNOWN
allowed where needed).
intermediate: Required. Define ownership and governance rules and alert/SLO linkage.
advanced: Required. Add migration notes and strict traceability pointers and cost-aware
principles.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, out-of-scope items, pillars notes, profiling
tool, optional owners, slo.critical_services, migration/rollout notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If scope.in is UNKNOWN → block Completeness Gate.
If pillars.enabled is UNKNOWN → block Completeness Gate.
If tools.metrics/logs/traces are UNKNOWN → block Completeness Gate.
If complete.instrumented_definition is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.OBS
Pass conditions:
required_fields_present == true
scope_defined == true
pillars_and_toolchain_defined == true

governance_defined == true
completeness_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

OBS-02

OBS-02 — Telemetry Schema Standard (common fields, correlation IDs)
Header Block

## 5. Optional Fields

Migration/rollout notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Do not log secrets or raw PII; reference redaction standards.
- **Every claim should be traceable to inputs or marked UNKNOWN.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Scope`
2. `## In-scope surfaces:`
3. `## Out-of-scope (explicit):`
4. `## Telemetry Pillars`
5. `## Goals`
6. `## Principles`
7. `## Toolchain`
8. `## Environment Coverage`
9. `## Ownership`
10. `## Data Governance`

## 8. Cross-References

- **Upstream: {{xref:SEC-06}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OBS-02}}, {{xref:ALRT-02}}, {{xref:SLO-02}} | OPTIONAL**
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
