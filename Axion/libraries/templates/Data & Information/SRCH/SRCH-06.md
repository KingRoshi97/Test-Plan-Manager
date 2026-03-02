SRCH-06
SRCH-06 — Search Observability (metrics,
logging, evaluation)
Header Block
   ●​ template_id: SRCH-06​

   ●​ title: Search Observability (metrics, logging, evaluation)​

   ●​ type: search_indexing​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/search/SRCH-06_Search_Observability.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.SRCH​

   ●​ upstream_dependencies: ["SRCH-03", "SRCH-04", "OBS-01"]​

   ●​ inputs_required: ["SRCH-03", "SRCH-04", "OBS-01", "OBS-02", "OBS-05",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define the required observability and evaluation signals for search: query metrics, latency, index
lag, relevance evaluation, logging fields (redacted), dashboards, and alerting thresholds.


Inputs Required
   ●​ SRCH-03: {{xref:SRCH-03}} | OPTIONAL​

   ●​ SRCH-04: {{xref:SRCH-04}} | OPTIONAL​

   ●​ OBS-01: {{xref:OBS-01}} | OPTIONAL​
  ●​ OBS-02: {{xref:OBS-02}} | OPTIONAL​

  ●​ OBS-05: {{xref:OBS-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Metrics catalog (minimum 15 metrics):​

          ○​ query_count​

          ○​ p50/p95 latency​

          ○​ zero_results_rate​

          ○​ clickthrough/engagement (if applicable)​

          ○​ index_lag​

          ○​ reindex_failures​

          ○​ dedupe_rate​

          ○​ abuse blocks​

  ●​ Logging field schema:​

          ○​ query_id​

          ○​ surface_id​

          ○​ normalized query (redacted policy)​

          ○​ filters applied​

          ○​ result_count​

          ○​ top_k ids (hashed or limited)​
          ○​ correlation_id​

   ●​ Evaluation plan:​

          ○​ offline eval dataset​

          ○​ metrics (NDCG/MRR) if used​

          ○​ human review cadence (optional)​

   ●​ Alert thresholds​

   ●​ Verification checklist​



Optional Fields
   ●​ Experimentation hooks pointer | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ If applies == false, include 00_NA block only.​

   ●​ Do not log raw PII queries; define redaction/hashing.​

   ●​ Metrics tags must avoid high-cardinality identifiers.​

   ●​ Alerts must be tied to thresholds and routed.​



Output Format
1) Applicability

   ●​ applies: {{search_obs.applies}} (true/false)​

   ●​ 00_NA (if not applies): {{search_obs.na_block}} | OPTIONAL​
2) Metrics Catalog (canonical)
     metric           type          definition         tags_allowed          target                 notes

search_querie        count        {{metrics.q_tot   {{metrics.q_tot    {{metrics.q_tota       {{metrics.q_tota
s_total              er           al.def}}          al.tags}}          l.target}}             l.notes}}

search_latenc        gaug         {{metrics.lat_p   {{metrics.lat_p    {{metrics.lat_p9       {{metrics.lat_p9
y_ms_p95             e/hist       95.def}}          95.tags}}          5.target}}             5.notes}}

search_zero_r        rate         {{metrics.zero.   {{metrics.zero.t   {{metrics.zero.t       {{metrics.zero.n
esults_rate                       def}}             ags}}              arget}}                otes}}


3) Logging Schema (required if applies)
          field            required              redaction                                notes

query_id                   true         none                           {{logs.query_id}}

surface_id                 true         none                           {{logs.surface_id}}

normalized_query true                   {{logs.redaction.query}}       {{logs.normalized_query_notes}}

filters                    true         none                           {{logs.filters}}

result_count               true         none                           {{logs.result_count}}

correlation_id             true         none                           {{logs.correlation_id}}


4) Evaluation Plan (required if applies)

   ●​ Offline dataset: {{eval.dataset}}​

   ●​ Metrics used: {{eval.metrics}}​

   ●​ Human review cadence: {{eval.human_cadence}} | OPTIONAL​



5) Alert Thresholds (required if applies)
 alert_i          metric              threshold             window              severity              route
    d

s_alert     {{alerts[0].met       {{alerts[0].thresh    {{alerts[0].wind   {{alerts[0].seve       {{alerts[0].rou
_01         ric}}                 old}}                 ow}}               rity}}                 te}}
6) Verification Checklist (required if applies)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:SRCH-04}} | OPTIONAL, {{xref:OBS-01}} | OPTIONAL​

   ●​ Downstream: {{xref:ALRT-}} | OPTIONAL, {{xref:EXPER-}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Not required.​

   ●​ intermediate: Required if applies. Metrics + logging schema + alerts.​

   ●​ advanced: Required if applies. Add evaluation plan rigor and dashboards pointers.​



Unknown Handling
   ●​ UNKNOWN_ALLOWED: experimentation_hooks, notes,
       human_review_cadence​

   ●​ If applies == true and logging redaction policy is UNKNOWN → block Completeness
      Gate.​



Completeness Gate
   ●​ Gate ID: TMP-05.PRIMARY.SRCH​
●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ if_applies_then_metrics_count >= 15​

       ○​ logging_schema_present == true​

       ○​ alert_thresholds_present == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true
Caching & Data Access Patterns
(CACHE)
Caching & Data Access Patterns (CACHE)​
CACHE-01 Caching Strategy (what to cache, where)​
CACHE-02 Invalidation Rules (events, TTLs, busting)​
CACHE-03 Consistency Model (strong/eventual/stale-while-revalidate)​
CACHE-04 Read/Write Split Rules (read replicas, CQRS if used)​
CACHE-05 Rate/Cost Controls for Reads (hot keys, batching)​
CACHE-06 Cache Failure Behavior (fallbacks, degradation)
