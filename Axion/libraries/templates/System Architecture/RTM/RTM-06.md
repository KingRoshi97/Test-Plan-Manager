RTM-06
RTM-06 — Abuse/Rate Control for
Realtime (limits, moderation hooks)
Header Block
   ●​ template_id: RTM-06​

   ●​ title: Abuse/Rate Control for Realtime (limits, moderation hooks)​

   ●​ type: realtime_messaging_architecture​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/realtime/RTM-06_Abuse_Rate_Control.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.REALTIME​

   ●​ upstream_dependencies: ["RTM-01", "RTM-03", "RLIM-01", "TNS-01"]​

   ●​ inputs_required: ["RTM-01", "RTM-03", "RLIM-01", "TNS-01", "PMAD-05", "OBS-04",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the realtime-specific abuse controls and rate limits: per-connection and per-channel
limits, spam/flood detection, moderation hooks, enforcement actions, and how realtime abuse
integrates with trust & safety workflows.


Inputs Required
   ●​ RTM-01: {{xref:RTM-01}} | OPTIONAL​

   ●​ RTM-03: {{xref:RTM-03}} | OPTIONAL​

   ●​ RLIM-01: {{xref:RLIM-01}} | OPTIONAL​
  ●​ TNS-01: {{xref:TNS-01}} | OPTIONAL​

  ●​ PMAD-05: {{xref:PMAD-05}} | OPTIONAL​

  ●​ OBS-04: {{xref:OBS-04}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Rate limit catalog (minimum 10 realtime-specific limits)​

  ●​ For each limit:​

         ○​ limit_id​

         ○​ applies_to (connection/user/channel/ip)​

         ○​ scope key (channel_id/user_id/ip)​

         ○​ limit value (msgs/sec, joins/min, bytes/sec)​

         ○​ enforcement point (gateway/realtime service)​

         ○​ action on breach (throttle/drop/disconnect/ban)​

         ○​ escalation rule (temporary mute, cooldown, report)​

         ○​ observability signals (counters/alerts)​

  ●​ Abuse detection heuristics (high level):​

         ○​ flood/spam patterns​

         ○​ repeated join/leave​

         ○​ malformed payload abuse​

  ●​ Moderation hooks:​

         ○​ message filtering/hold-for-review​
           ○​ user mute/ban actions​

           ○​ channel lockdown mode​

   ●​ Appeal/recovery rules pointer (TNS)​

   ●​ Test requirements (load + abuse simulations)​



Optional Fields
   ●​ ML-based spam scoring pointer | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Limits must be enforceable server-side with deterministic behavior.​

   ●​ Enforcement actions must be consistent and auditable.​

   ●​ Moderation actions must map to privileged operations policy (PMAD-05) if admin-driven.​

   ●​ Controls must minimize false positives; include escalation and recovery.​



Output Format
1) Rate Limits (canonical)
 limi   applies_t     scope_     limit_v    enforcem       breach      escalatio     obs_si      notes
 t_id      o            key        alue     ent_point      _action        n          gnals

rtm     {{limits[0]. {{limits[   {{limits[ {{limits[0].e   {{limits[0 {{limits[0].   {{limits   {{limits[
_lim    applies_to 0].scop       0].value nforcement       ].breach escalation       [0].obs    0].note
_01     }}           e}}         }}        }}              }}         }}             }}         s}}

rtm     {{limits[1]. {{limits[   {{limits[ {{limits[1].e   {{limits[1 {{limits[1].   {{limits   {{limits[
_lim    applies_to 1].scop       1].value nforcement       ].breach escalation       [1].obs    1].note
_02     }}           e}}         }}        }}              }}         }}             }}         s}}
2) Abuse Heuristics (required)

  ●​ Flood/spam patterns: {{abuse.flood_patterns}}​

  ●​ Join/leave churn: {{abuse.churn_patterns}} | OPTIONAL​

  ●​ Malformed payload abuse: {{abuse.malformed}} | OPTIONAL​



3) Moderation Hooks (required)
 hook_id          trigger          action           scope         audit_event         notes

hook_filter   {{hooks[0].trigg {{hooks[0].acti   {{hooks[0].sco   {{hooks[0].au   {{hooks[0].not
_01           er}}             on}}              pe}}             dit}}           es}}


4) Appeals/Recovery Pointer (required)

  ●​ Trust & Safety policy pointer: {{xref:TNS-05}} | OPTIONAL​

  ●​ Support escalation pointer: {{xref:SUP-02}} | OPTIONAL​



5) Test Requirements (required)

  ●​ Load test cases: {{tests.load}}​

  ●​ Abuse simulation cases: {{tests.abuse}}​

  ●​ Rate limit enforcement tests: {{tests.enforcement}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:RLIM-01}} | OPTIONAL, {{xref:TNS-01}} | OPTIONAL, {{xref:PMAD-05}}
     | OPTIONAL​

  ●​ Downstream: {{xref:OBS-04}} | OPTIONAL, {{xref:ALRT-*}} | OPTIONAL, {{xref:QA-04}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​
Skill Level Requiredness Rules
  ●​ beginner: Required. Rate limits + breach actions + moderation hook list.​

  ●​ intermediate: Required. Add heuristics and observability signals.​

  ●​ advanced: Required. Add test requirements and appeals pointers.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: ml_spam_scoring, notes, churn_patterns,
     malformed_payload_patterns​

  ●​ If any limit lacks enforcement_point or breach_action → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.REALTIME​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ limits_count >= 10​

         ○​ enforcement_defined == true​

         ○​ moderation_hooks_present == true​

         ○​ test_requirements_present == true​

         ○​ placeholder_resolution == true​

         ○​ no_unapproved_unknowns == true​
Workflow & Orchestration Design (WFO)
●​ Workflow & Orchestration Design (WFO)​
   WFO-01 Workflow Catalog (sagas/jobs/background tasks by ID)​
   WFO-02 Orchestration Patterns (state machine, retries, compensation)​
   WFO-03 Idempotency & Concurrency Model (keys, locking, ordering)​
   WFO-04 Scheduling & Triggers (cron/events/user actions)​
   WFO-05 Failure Handling (DLQ, backoff, poison messages, alerts)​
   WFO-06 Workflow Observability (traceability, audit events, metrics)
