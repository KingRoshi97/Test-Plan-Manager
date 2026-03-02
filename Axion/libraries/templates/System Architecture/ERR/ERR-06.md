ERR-06
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
     field             required            description                         redaction_rule

timestamp              true        {{fields.timestamp.desc}}       {{fields.timestamp.redaction}}

service                true        {{fields.service.desc}}         {{fields.service.redaction}}

endpoint_or_op true                {{fields.endpoint.desc}}        {{fields.endpoint.redaction}}

error_class            true        {{fields.error_class.desc}}     {{fields.error_class.redaction}}

reason_code            true        {{fields.reason_code.desc}}     {{fields.reason_code.redaction}}

severity               true        {{fields.severity.desc}}        {{fields.severity.redaction}}

correlation_id         true        {{fields.correlation.desc}}     {{fields.correlation.redaction}}


2) Error Metrics (required)
 metric_na       typ          increments_when            tags_allowed                    notes
    me            e

errors_tota   cou        {{metrics.errors_total.w   {{metrics.errors_total.t    {{metrics.errors_total.n
l             nter       hen}}                      ags}}                       otes}}

errors_by_    cou        {{metrics.errors_by_rea    {{metrics.errors_by_re      {{metrics.errors_by_rea
reason        nter       son.when}}                 ason.tags}}                 son.notes}}

p0_error_r    rate       {{metrics.p0.when}}        {{metrics.p0.tags}}         {{metrics.p0.notes}}
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
Realtime & Messaging Architecture
(RTM)
●​ Realtime & Messaging Architecture (RTM)​
   RTM-01 Realtime Use Cases Catalog (presence, chat, streams, updates)​
   RTM-02 Protocol & Transport Map (WS/WebRTC/pubsub, fallback rules)​
   RTM-03 Channel/Topic Model (naming, scoping, permissions)​
   RTM-04 Delivery Semantics (ordering, dedupe, at-least-once, ack)​
   RTM-05 Presence & State Sync Model (source of truth, TTLs, conflicts)​
   RTM-06 Abuse/Rate Control for Realtime (limits, moderation hooks)
