CACHE-05
CACHE-05 — Rate/Cost Controls for
Reads (hot keys, batching)
Header Block
   ●​ template_id: CACHE-05​

   ●​ title: Rate/Cost Controls for Reads (hot keys, batching)​

   ●​ type: caching_data_access_patterns​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/caching/CACHE-05_Rate_Cost_Controls_for_Reads.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.CACHE​

   ●​ upstream_dependencies: ["CACHE-01", "PERF-02", "COST-01"]​

   ●​ inputs_required: ["CACHE-01", "PERF-02", "COST-01", "RLIM-01", "OBS-02",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define controls that keep read load and cost bounded: batching, request coalescing, hot-key
mitigation, per-tenant/user limits, cache tiering, and fail-open/close behaviors under high load.


Inputs Required
   ●​ CACHE-01: {{xref:CACHE-01}} | OPTIONAL​

   ●​ PERF-02: {{xref:PERF-02}} | OPTIONAL​

   ●​ COST-01: {{xref:COST-01}} | OPTIONAL​
  ●​ RLIM-01: {{xref:RLIM-01}} | OPTIONAL​

  ●​ OBS-02: {{xref:OBS-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Control catalog (minimum 12 controls)​

  ●​ For each control:​

         ○​ ctrl_id​

         ○​ target layer (client/server/edge/db/cache)​

         ○​ mechanism (batching/coalescing/throttle/circuit/priority)​

         ○​ scope (per user/tenant/ip/global)​

         ○​ trigger metric (qps, p95 latency, cache miss rate)​

         ○​ threshold​

         ○​ action taken (reduce, shed load, degrade)​

         ○​ user impact (UX behavior pointer)​

         ○​ observability signals (metrics/alerts)​

         ○​ rollback/disable rule​

  ●​ Hot key policy:​

         ○​ detection​

         ○​ mitigation (partitioning, local caches, jitter)​

  ●​ Verification checklist​



Optional Fields
   ●​ Tenant tiering policy | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Controls must be measurable and reversible.​

   ●​ User-impacting degradation must have defined UX behavior.​

   ●​ Rate limiting must not break critical system functions; define allow-lists.​

   ●​ Hot key mitigation must avoid creating new hotspots.​



Output Format
1) Controls Catalog (canonical)
 ctr   layer     mech      scope     trigge    thresh      action    user_i     obs_     rollbac    notes
 l_i             anism               r_met       old                 mpact      sign     k_rule
  d                                    ric                                       als

rea    {{cont    {{contr   {{contr   {{contr   {{contro    {{contr   {{contr    {{cont   {{contr    {{contr
d_     rols[0]   ols[0].   ols[0].   ols[0].   ls[0].thr   ols[0].   ols[0].i   rols[0   ols[0].r   ols[0].
ctrl   .layer}   mech}     scope     metric}   eshold}     action}   mpact}     ].obs}   ollback    notes}
_0     }         }         }}        }         }           }         }          }        }}         }
1

rea    {{cont    {{contr   {{contr   {{contr   {{contro    {{contr   {{contr    {{cont   {{contr    {{contr
d_     rols[1]   ols[1].   ols[1].   ols[1].   ls[1].thr   ols[1].   ols[1].i   rols[1   ols[1].r   ols[1].
ctrl   .layer}   mech}     scope     metric}   eshold}     action}   mpact}     ].obs}   ollback    notes}
_0     }         }         }}        }         }           }         }          }        }}         }
2


2) Hot Key Policy (required)

   ●​ Detection: {{hotkeys.detect}}​

   ●​ Mitigation: {{hotkeys.mitigate}}​
   ●​ Alert thresholds: {{hotkeys.alerts}} | OPTIONAL​



3) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:RLIM-01}} | OPTIONAL, {{xref:PERF-02}} | OPTIONAL,
      {{xref:CACHE-01}} | OPTIONAL​

   ●​ Downstream: {{xref:CACHE-06}} | OPTIONAL, {{xref:ALRT-*}} | OPTIONAL,
      {{xref:PERF-05}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Required. Basic controls + hot key detection.​

   ●​ intermediate: Required. Add thresholds, actions, and rollback rules.​

   ●​ advanced: Required. Add tiering and UX degradation behavior rigor.​



Unknown Handling
   ●​ UNKNOWN_ALLOWED: tenant_tiering_policy, notes, allow_lists, alerts​

   ●​ If any control lacks trigger_metric or action → block Completeness Gate.​



Completeness Gate
●​ Gate ID: TMP-05.PRIMARY.CACHE​

●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ controls_count >= 12​

       ○​ thresholds_present == true​

       ○​ rollback_rules_present == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true
