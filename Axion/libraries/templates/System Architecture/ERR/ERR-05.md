ERR-05
ERR-05 — Retryability & Idempotency
Rules (which errors retry, how)
Header Block
   ●​ template_id: ERR-05​

   ●​ title: Retryability & Idempotency Rules (which errors retry, how)​

   ●​ type: error_model_reason_codes​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/errors/ERR-05_Retryability_Idempotency_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ERRORS​

   ●​ upstream_dependencies: ["ERR-01", "ERR-02", "WFO-03", "APIG-01"]​

   ●​ inputs_required: ["ERR-01", "ERR-02", "WFO-03", "APIG-01", "SIC-05",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define deterministic retryability rules across the system: which error classes/reason codes are
retryable, under what conditions, what backoff is used, and what idempotency guarantees are
required to safely retry without duplicating side effects.


Inputs Required
   ●​ ERR-01: {{xref:ERR-01}} | OPTIONAL​

   ●​ ERR-02: {{xref:ERR-02}} | OPTIONAL​

   ●​ WFO-03: {{xref:WFO-03}} | OPTIONAL​
  ●​ APIG-01: {{xref:APIG-01}} | OPTIONAL​

  ●​ SIC-05: {{xref:SIC-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Retry policy defaults (for client retries and server retries)​

  ●​ Retryability rules by error class (default posture)​

  ●​ Reason-code overrides (explicit list)​

  ●​ Idempotency requirements:​

          ○​ which operations must be idempotent​

          ○​ idempotency key format​

          ○​ key scope (subject/resource/action)​

          ○​ storage/ttl rules (high level)​

  ●​ Backoff rules:​

          ○​ base delay​

          ○​ multiplier​

          ○​ max delay​

          ○​ jitter​

          ○​ max attempts​

  ●​ “Do not retry” list (hard)​

  ●​ Special handling:​

          ○​ rate limiting (Retry-After)​
           ○​ conflicts (refresh-and-retry)​

           ○​ dependency timeouts (circuit behavior pointer)​



Optional Fields
   ●​ UI retry behavior pointer (DES-07) | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Never retry non-idempotent operations unless an idempotency key is enforced.​

   ●​ Client retries must be bounded; avoid retry storms.​

   ●​ Server retries (jobs/webhooks) must use DLQ/quarantine after max attempts.​

   ●​ Retry behavior must be consistent across endpoints; overrides must be explicit.​

   ●​ Any retryable reason_code must specify whether retry is automatic or user-initiated.​



Output Format
1) Defaults (required)

   ●​ Client retry default: {{defaults.client}}​

   ●​ Server retry default: {{defaults.server}}​

   ●​ Max attempts default: {{defaults.max_attempts}}​

   ●​ Jitter policy: {{defaults.jitter}} | OPTIONAL​



2) Retryability by Error Class (required)
   error_class                default_retryable                    notes
validation            false                                   {{classes.validation.notes}}

domain_rule           false                                   {{classes.domain.notes}}

authz                 false                                   {{classes.authz.notes}}

dependency            {{classes.dependency.retryable}}        {{classes.dependency.notes}}

conflict              {{classes.conflict.retryable}}          {{classes.conflict.notes}}

system_unknow         {{classes.system.retryable}}            {{classes.system.notes}}
n


3) Reason-Code Overrides (required)
 reason_c        retryable          retry_mode      backoff_prof        idempotency_re          notes
    ode                             (auto/user)         ile                 quired

{{override     {{overrides[0].r    {{overrides[0   {{overrides[0].      {{overrides[0].ide   {{overrides[0
s[0].rc}}      etryable}}          ].mode}}        backoff}}            mpotency}}           ].notes}}


4) Backoff Profiles (required)
 profile_    base_ms          multiplier      max_ms           jitter        max_attemp          notes
    id                                                                           ts

backoff_     {{backoff.d      {{backoff.d    {{backoff.d   {{backoff.d      {{backoff.def {{backoff.de
default      efault.base      efault.mult}   efault.max}   efault.jitter}   ault.attempts} fault.notes}}
             }}               }              }             }                }

backoff_     {{backoff.a      {{backoff.a    {{backoff.a   {{backoff.a      {{backoff.agg    {{backoff.ag
aggressi     ggr.base}}       ggr.mult}}     ggr.max}}     ggr.jitter}}     r.attempts}}     gr.notes}}
ve


5) Idempotency Rules (required)

   ●​ Key format: {{idempotency.key_format}} (e.g., idem_<subject><action><hash>)​

   ●​ Key scope: {{idempotency.scope}}​

   ●​ Storage/TTL rule: {{idempotency.ttl}}​

   ●​ Collision handling: {{idempotency.collision_handling}} | OPTIONAL​
6) Do-Not-Retry List (required)

  ●​ {{do_not_retry[0]}}​

  ●​ {{do_not_retry[1]}} | OPTIONAL​



7) Special Cases (required)

  ●​ Rate limits: {{special.rate_limits}}​

  ●​ Conflicts: {{special.conflicts}}​

  ●​ Dependency timeouts: {{special.dependency_timeouts}}​



Cross-References
  ●​ Upstream: {{xref:WFO-03}} | OPTIONAL, {{xref:APIG-01}} | OPTIONAL, {{xref:SIC-05}} |
     OPTIONAL​

  ●​ Downstream: {{xref:DES-07}} | OPTIONAL, {{xref:WFO-05}} | OPTIONAL, {{xref:QA-04}}
     | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Class defaults + do-not-retry list + idempotency key format.​

  ●​ intermediate: Required. Add backoff profiles and reason-code overrides.​

  ●​ advanced: Required. Add special cases and explicit retry modes.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: ui_retry_pointer, collision_handling, notes,
      aggressive_profile​
 ●​ If any retryable override lacks idempotency_required definition → block Completeness
    Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.ERRORS​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ class_defaults_present == true​

        ○​ backoff_profiles_present == true​

        ○​ idempotency_rules_present == true​

        ○​ do_not_retry_present == true​

        ○​ retryable_overrides_have_idempotency == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true​




ERR-06 — Observability Requirements for
Errors (logs/metrics/traces fields)
Header Block
 ●​ template_id: ERR-06​

 ●​ title: Observability Requirements for Errors (logs/metrics/traces fields)​

 ●​ type: error_model_reason_codes​
   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/errors/ERR-06_Error_Observability_Requirements.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ERRORS​

   ●​ upstream_dependencies: ["ERR-01", "OBS-01", "OBS-03"]​

   ●​ inputs_required: ["ERR-01", "OBS-01", "OBS-02", "OBS-03", "DGP-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the required observability fields and metrics for errors so failures can be diagnosed and
tracked consistently across services and boundaries. This covers log field schema, metric
dimensions, trace linkage, and redaction requirements.


Inputs Required
   ●​ ERR-01: {{xref:ERR-01}} | OPTIONAL​

   ●​ OBS-01: {{xref:OBS-01}} | OPTIONAL​

   ●​ OBS-02: {{xref:OBS-02}} | OPTIONAL​

   ●​ OBS-03: {{xref:OBS-03}} | OPTIONAL​

   ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

   ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
   ●​ Required log fields for any error event​

   ●​ Required metric events for errors (counters, rates)​
  ●​ Required trace linkage fields​

  ●​ Dimension/tag policy:​

          ○​ allowed tags (reason_code, service, endpoint, tenant, severity)​

          ○​ high-cardinality ban list (no user_id unless hashed/allowed)​

  ●​ Redaction rules (PII)​

  ●​ Sampling/retention policy pointer (if needed)​

  ●​ Coverage checks (every service emits required fields)​



Optional Fields
  ●​ Dashboard requirements | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Error logs must include reason_code + correlation_id at minimum.​

  ●​ Do not emit high-cardinality identifiers as metric tags.​

  ●​ PII must be redacted or omitted per DGP.​

  ●​ Traces must link error occurrences to spans consistently.​



Output Format
1) Required Log Fields (required)
     field        required            description                     redaction_rule

timestamp        true         {{fields.timestamp.desc}}      {{fields.timestamp.redaction}}

service          true         {{fields.service.desc}}        {{fields.service.redaction}}
endpoint_or_op true                {{fields.endpoint.desc}}        {{fields.endpoint.redaction}}

error_class            true        {{fields.error_class.desc}}     {{fields.error_class.redaction}}

reason_code            true        {{fields.reason_code.desc}}     {{fields.reason_code.redaction}}

severity               true        {{fields.severity.desc}}        {{fields.severity.redaction}}

correlation_id         true        {{fields.correlation.desc}}     {{fields.correlation.redaction}}


2) Error Metrics (required)
 metric_na       typ          increments_when            tags_allowed                   notes
    me            e

errors_tota   cou        {{metrics.errors_total.w   {{metrics.errors_total.t   {{metrics.errors_total.n
l             nter       hen}}                      ags}}                      otes}}

errors_by_    cou        {{metrics.errors_by_rea    {{metrics.errors_by_re     {{metrics.errors_by_rea
reason        nter       son.when}}                 ason.tags}}                son.notes}}

p0_error_r    rate       {{metrics.p0.when}}        {{metrics.p0.tags}}        {{metrics.p0.notes}}
ate


3) Trace Linkage (required)

   ●​ Required span attributes: {{tracing.span_attrs}}​

   ●​ Error span event format: {{tracing.event_format}} | OPTIONAL​

   ●​ Correlation propagation rule: {{tracing.correlation_rule}}​



4) Dimension/Tag Policy (required)

   ●​ Allowed tags: {{tags.allowed}}​

   ●​ Banned high-cardinality tags: {{tags.banned}}​

   ●​ Hashing rule (if any): {{tags.hashing}} | OPTIONAL​



5) Redaction Rules (required)
  ●​ Never include: {{redaction.never_include}}​

  ●​ Allowed if hashed: {{redaction.allowed_hashed}} | OPTIONAL​



6) Coverage Checks (required)

  ●​ Every service emits required fields: {{coverage.services_complete}}​

  ●​ Metric tags comply with policy: {{coverage.tags_compliant}}​



Cross-References
  ●​ Upstream: {{xref:OBS-01}} | OPTIONAL, {{xref:OBS-03}} | OPTIONAL, {{xref:DGP-01}} |
     OPTIONAL​

  ●​ Downstream: {{xref:OBS-05}} | OPTIONAL, {{xref:ALRT-}} | OPTIONAL, {{xref:PERF-}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Log field minimum + metric names.​

  ●​ intermediate: Required. Add tag policy and trace linkage.​

  ●​ advanced: Required. Add coverage checks and redaction rigor.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: dashboard_requirements, hashing_rule, notes,
     retention_pointer​

  ●​ If required log fields are UNKNOWN → block Completeness Gate.​
Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.ERRORS​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ log_fields_present == true​

        ○​ metrics_present == true​

        ○​ tag_policy_present == true​

        ○​ coverage_checks_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
