# RLIM-01 — Rate Limit Policy (global rules, scopes)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLIM-01                                             |
| Template Type     | Build / Rate Limiting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring rate limit policy (global rules, scopes)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Rate Limit Policy (global rules, scopes) Document                         |

## 2. Purpose

Define the single, canonical global rate limit policy: what surfaces are rate-limited, what scopes
exist, how limits are computed and enforced, how bursts are handled, and how rate-limit
decisions map to errors/status. This template must be consistent with standards and must not
invent enforcement capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Identity keys used for... | spec         | Yes             |
| Burst handling model (... | spec         | Yes             |
| Enforcement actions (t... | spec         | Yes             |
| Response behavior (hea... | spec         | Yes             |
| Exemptions model (allo... | spec         | Yes             |
| Override policy (who c... | spec         | Yes             |

## 5. Optional Fields

Per-surface default limits | OPTIONAL
Geo-based policies | OPTIONAL
Cost-based throttling | OPTIONAL
Dynamic limit adjustments | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not enumerate per-endpoint limits here; those belong in RLIM-02.
Rate limit errors MUST map to: {{xref:API-03}} | OPTIONAL
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
If exemptions exist, they MUST be explicit and auditable.
Output Format
1. Policy Scope
surfaces: {{policy.surfaces}}
applies_in_envs: {{policy.envs}} | OPTIONAL
notes: {{policy.notes}} | OPTIONAL
2. Scope Model (Keys)
Supported scopes:
per_ip: {{scope.per_ip}}
per_user: {{scope.per_user}}
per_token: {{scope.per_token}} | OPTIONAL
per_org: {{scope.per_org}} | OPTIONAL
per_project: {{scope.per_project}} | OPTIONAL
per_route: {{scope.per_route}} | OPTIONAL
per_endpoint_class: {{scope.per_endpoint_class}} | OPTIONAL
Identity key rules: {{scope.identity_key_rules}}
3. Limit Units
request_rate: {{units.request_rate}} (e.g., req/min)
token_rate: {{units.token_rate}} | OPTIONAL
byte_rate: {{units.byte_rate}} | OPTIONAL
concurrency: {{units.concurrency}} | OPTIONAL
4. Burst Handling
algorithm: {{burst.algorithm}} (token_bucket/leaky_bucket/UNKNOWN)
burst_capacity: {{burst.capacity}} | OPTIONAL
refill_rate: {{burst.refill_rate}} | OPTIONAL
smoothing: {{burst.smoothing}} | OPTIONAL
5. Enforcement Actions
actions_supported: {{enforcement.actions_supported}}
throttle_behavior: {{enforcement.throttle_behavior}} | OPTIONAL
reject_behavior: {{enforcement.reject_behavior}}
ban_policy_ref: {{enforcement.ban_policy_ref}} | OPTIONAL
6. Response Behavior (Errors + Headers)
error_code: {{responses.error_code}} (expected: rate-limit code from {{xref:API-03}})
status_code: {{responses.status_code}} (expected: 429)
headers:
rate_limit_limit: {{responses.headers.limit}} | OPTIONAL
rate_limit_remaining: {{responses.headers.remaining}} | OPTIONAL

rate_limit_reset: {{responses.headers.reset}} | OPTIONAL
retry_after: {{responses.headers.retry_after}} | OPTIONAL
body_policy: {{responses.body_policy}} | OPTIONAL
7. Exemptions / Allowlist Model
exempt_principals: {{exempt.principals}} | OPTIONAL
exempt_routes: {{exempt.routes}} | OPTIONAL
allowlist_policy: {{exempt.allowlist_policy}} | OPTIONAL
audit_required: {{exempt.audit_required}} | OPTIONAL
8. Overrides & Change Control
who_can_change_limits: {{change_control.who}}
audit_policy: {{change_control.audit_policy}} | OPTIONAL
rollout_rules: {{change_control.rollout_rules}} | OPTIONAL
9. Observability Requirements
metrics:
limited_count: {{obs.metrics.limited_count}}
throttle_count: {{obs.metrics.throttle_count}} | OPTIONAL
ban_count: {{obs.metrics.ban_count}} | OPTIONAL
top_keys: {{obs.metrics.top_keys}} | OPTIONAL
logs_required_fields: {{obs.logs_required_fields}}
dashboards: {{obs.dashboards}} | OPTIONAL
alerts: {{obs.alerts}} | OPTIONAL
10.Abuse Escalation Linkage (Optional)
signals_ref: {{xref:RLIM-03}} | OPTIONAL
actions_matrix_ref: {{xref:RLIM-04}} | OPTIONAL
11.References
Per-endpoint limits catalog: {{xref:RLIM-02}} | OPTIONAL
Abuse signals: {{xref:RLIM-03}} | OPTIONAL
Enforcement actions: {{xref:RLIM-04}} | OPTIONAL
Exemptions: {{xref:RLIM-05}} | OPTIONAL
Observability: {{xref:RLIM-06}} | OPTIONAL
API error mapping: {{xref:API-03}} | OPTIONAL
Cross-References
Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:STANDARDS_INDEX}} | OPTIONAL
Downstream: {{xref:RLIM-02}}, {{xref:RLIM-03}}, {{xref:RLIM-04}}, {{xref:RLIM-06}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-SECURITY]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN where enforcement details are missing; define scope
model and 429 mapping.
intermediate: Required. Define algorithm, headers, exemptions, and observability requirements.
advanced: Required. Add change control rigor and abuse escalation linkages.

Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, applies_in_envs, per_token, per_org,
per_project, per_route, per_endpoint_class, token_rate, byte_rate, concurrency, burst_capacity,
refill_rate, smoothing, throttle_behavior, ban_policy_ref, headers, body_policy,
exempt_principals, exempt_routes, allowlist_policy, audit_required, audit_policy, rollout_rules,
dashboards, alerts, signals_ref, actions_matrix_ref, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If scope.identity_key_rules is UNKNOWN → block Completeness Gate.
If responses.status_code is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.RLIM
Pass conditions:
required_fields_present == true
scope_model_defined == true
error_mapping_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

RLIM-02

RLIM-02 — Rate Limit Catalog (limits by surface/endpoint)
Header Block

## 6. Rules

- **RLIM-04 Enforcement Actions Matrix (throttle/ban/captcha)**
- **RLIM-05 Exemptions & Allowlist Policy**
- **RLIM-06 Rate Limit Observability (alerts, dashboards)**
- **RLIM-01**
- **RLIM-01 — Rate Limit Policy (global rules, scopes)**
- **Header Block**
- **template_id: RLIM-01**
- **title: Rate Limit Policy (global rules, scopes)**
- **type: rate_limit_policy**
- **template_version: 1.0.0**
- **output_path: 10_app/ratelimits/RLIM-01_Rate_Limit_Policy.md**
- **compliance_gate_id: TMP-05.PRIMARY.RLIM**
- **upstream_dependencies: []**
- **inputs_required: ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX"]**
- **required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}**
- **Purpose**
- **Define the single, canonical global rate limit policy: what surfaces are rate-limited, what scopes**
- **exist, how limits are computed and enforced, how bursts are handled, and how rate-limit**
- **decisions map to errors/status. This template must be consistent with standards and must not**
- **invent enforcement capabilities not present in upstream inputs.**
- **Inputs Required**
- **SPEC_INDEX: {{spec.index}}**
- **DOMAIN_MAP: {{domain.map}} | OPTIONAL**
- **GLOSSARY: {{glossary.terms}} | OPTIONAL**
- **STANDARDS_INDEX: {{standards.index}} | OPTIONAL**
- **Existing docs/notes: {{inputs.notes}} | OPTIONAL**
- **Required Fields**
- **Rate-limited surfaces (API, WS, webhooks, jobs triggers, admin)**
- **Scope model (per IP / per user / per token / per org / per project / per route / per endpoint class)**
- **Identity keys used for enforcement (client identifiers)**
- **Limit units (req/sec, req/min, tokens/min, bytes/min, concurrent)**
- **Burst handling model (token bucket/leaky bucket/UNKNOWN)**
- **Enforcement actions (throttle, reject, slow, ban)**
- **Response behavior (headers + error mapping)**
- **Exemptions model (allowlists, internal services, admin)**
- **Override policy (who can change limits, audit requirements)**
- **Observability requirements (metrics, logs, dashboards, alerts)**
- **Abuse escalation linkage (bind to RLIM-03/RLIM-04 if present)**
- **Optional Fields**
- **Per-surface default limits | OPTIONAL**
- **Geo-based policies | OPTIONAL**
- **Cost-based throttling | OPTIONAL**
- **Dynamic limit adjustments | OPTIONAL**
- **Open questions | OPTIONAL**
- **Rules**
- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not enumerate per-endpoint limits here; those belong in RLIM-02.
- **Rate limit errors MUST map to: {{xref:API-03}} | OPTIONAL**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- If exemptions exist, they MUST be explicit and auditable.

## 7. Output Format

### Required Headings (in order)

1. `## Policy Scope`
2. `## Scope Model (Keys)`
3. `## Supported scopes:`
4. `## Limit Units`
5. `## Burst Handling`
6. `## Enforcement Actions`
7. `## Response Behavior (Errors + Headers)`
8. `## headers:`
9. `## Exemptions / Allowlist Model`
10. `## Overrides & Change Control`

## 8. Cross-References

- **Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:STANDARDS_INDEX}} | OPTIONAL**
- **Downstream: {{xref:RLIM-02}}, {{xref:RLIM-03}}, {{xref:RLIM-04}}, {{xref:RLIM-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

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
