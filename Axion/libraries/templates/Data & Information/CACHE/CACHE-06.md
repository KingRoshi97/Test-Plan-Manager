CACHE-06
CACHE-06 — Cache Failure Behavior
(fallbacks, degradation)
Header Block
   ●​ template_id: CACHE-06​

   ●​ title: Cache Failure Behavior (fallbacks, degradation)​

   ●​ type: caching_data_access_patterns​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/caching/CACHE-06_Cache_Failure_Behavior.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.CACHE​

   ●​ upstream_dependencies: ["CACHE-01", "CACHE-02", "CACHE-03", "RELIA-01"]​

   ●​ inputs_required: ["CACHE-01", "CACHE-02", "CACHE-03", "RELIA-01", "ERR-01",
      "DES-07", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define what happens when caches fail or misbehave: cache outages, high miss rates, stale
data, stampedes, and partial invalidation failures. This specifies deterministic fallback paths and
UX degradation behavior.


Inputs Required
   ●​ CACHE-01: {{xref:CACHE-01}} | OPTIONAL​

   ●​ CACHE-02: {{xref:CACHE-02}} | OPTIONAL​

   ●​ CACHE-03: {{xref:CACHE-03}} | OPTIONAL​
  ●​ RELIA-01: {{xref:RELIA-01}} | OPTIONAL​

  ●​ ERR-01: {{xref:ERR-01}} | OPTIONAL​

  ●​ DES-07: {{xref:DES-07}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Failure mode catalog (minimum 10)​

  ●​ For each failure mode:​

         ○​ fail_id​

         ○​ cache layer affected (client/server/edge)​

         ○​ detection signal (timeout, error rate, miss spike)​

         ○​ expected behavior:​

                 ■​ fail open vs fail closed​

                 ■​ fallback source (DB/read model/stale copy)​

                 ■​ max staleness allowed​

         ○​ user-visible behavior (loading, banner, stale badge)​

         ○​ retry/backoff rules (avoid stampedes)​

         ○​ circuit breaker rule (when to stop using cache)​

         ○​ observability and alerting (what triggers paging)​

  ●​ Stampede mitigation policy​

  ●​ Verification checklist​



Optional Fields
   ●​ Emergency disable switch policy | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Failure behaviors must align with CACHE-03 consistency requirements.​

   ●​ Avoid cascading failures: do not hammer DB when cache is down without throttling.​

   ●​ User-visible behavior must be defined for any user-facing impact.​

   ●​ “Fail open” must not leak data; enforce auth in fallback path.​



Output Format
1) Failure Modes (canonical)
 fail_   layer   detect     behavi      fallbac     max_st      user     retry    circuit    alerti    notes
  id              ion         or        k_sour      alenes      _beh     _bac      _rule      ng
                                          ce           s        avio      koff
                                                                  r

cach {{fails[    {{fails[   {{fails[0   {{fails[0   {{fails[0   {{fail   {{fails[ {{fails[   {{fails   {{fails[
e_fa 0].lay      0].det     ].behav     ].fallba    ].stalen    s[0].    0].retr 0].circ     [0].al    0].not
il_01 er}}       ect}}      ior}}       ck}}        ess}}       ux}}     y}}      uit}}      ert}}     es}}

cach {{fails[    {{fails[   {{fails[1   {{fails[1   {{fails[1   {{fail   {{fails[ {{fails[   {{fails   {{fails[
e_fa 1].lay      1].det     ].behav     ].fallba    ].stalen    s[1].    1].retr 1].circ     [1].al    1].not
il_02 er}}       ect}}      ior}}       ck}}        ess}}       ux}}     y}}      uit}}      ert}}     es}}


2) Stampede Mitigation (required)

   ●​ Coalescing strategy: {{stampede.coalescing}}​

   ●​ Jitter rules: {{stampede.jitter}} | OPTIONAL​

   ●​ Max concurrent refreshes: {{stampede.max_refresh}} | OPTIONAL​



3) Verification Checklist (required)
  ●​ {{verify[0]}}​

  ●​ {{verify[1]}}​

  ●​ {{verify[2]}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:CACHE-03}} | OPTIONAL, {{xref:RELIA-01}} | OPTIONAL,
     {{xref:DES-07}} | OPTIONAL​

  ●​ Downstream: {{xref:ALRT-}} | OPTIONAL, {{xref:IRP-}} | OPTIONAL, {{xref:PERF-03}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Basic failure modes + fallback paths.​

  ●​ intermediate: Required. Add detection signals, max staleness, and circuit rules.​

  ●​ advanced: Required. Add stampede mitigation and alerting thresholds rigor.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: emergency_disable_switch, notes, jitter_rules,
      max_refresh​

  ●​ If any failure mode lacks fallback_source or user_behavior (when user-facing) → block
     Completeness Gate.​



Completeness Gate
●​ Gate ID: TMP-05.PRIMARY.CACHE​

●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ failure_modes_count >= 10​

       ○​ fallback_paths_present == true​

       ○​ stampede_policy_present == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true
Reporting & Aggregations (RPT)
Reporting & Aggregations (RPT)​
RPT-01 Reporting Surfaces Inventory (dashboards, exports, admin)​
RPT-02 Metrics Definitions (canonical KPI semantics)​
RPT-03 Aggregation & Rollup Rules (windows, group-bys)​
RPT-04 Snapshotting Strategy (daily/weekly, recompute rules)​
RPT-05 Data Access & Permissions for Reports​
RPT-06 Reporting Data Quality Rules (reconciliation, correctness)
