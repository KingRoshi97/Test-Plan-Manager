ARC-05
ARC-05 — Realtime Architecture
(channels, presence, delivery, scaling)
Header Block
   ●​ template_id: ARC-05​

   ●​ title: Realtime Architecture (channels, presence, delivery, scaling)​

   ●​ type: system_architecture​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/architecture/ARC-05_Realtime_Architecture.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ARCH​

   ●​ upstream_dependencies: ["PRD-04", "DES-01", "RTM-01", "RTM-02", "PMAD-01",
      "RISK-02"]​

   ●​ inputs_required: ["PRD-04", "DES-01", "RTM-01", "RTM-02", "RTM-03", "RTM-04",
      "RTM-05", "PMAD-01", "ERR-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the system’s realtime architecture at the system level: which realtime use cases exist,
what transports/protocols are used, how channels/topics are modeled, how presence/state sync
works, and what delivery guarantees and scaling assumptions apply.


Inputs Required
   ●​ PRD-04: {{xref:PRD-04}} | OPTIONAL​

   ●​ DES-01: {{xref:DES-01}} | OPTIONAL​
  ●​ RTM-01: {{xref:RTM-01}} | OPTIONAL​

  ●​ RTM-02: {{xref:RTM-02}} | OPTIONAL​

  ●​ RTM-03: {{xref:RTM-03}} | OPTIONAL​

  ●​ RTM-04: {{xref:RTM-04}} | OPTIONAL​

  ●​ RTM-05: {{xref:RTM-05}} | OPTIONAL​

  ●​ PMAD-01: {{xref:PMAD-01}} | OPTIONAL​

  ●​ ERR-01: {{xref:ERR-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Realtime scope summary (what is realtime, what is not)​

  ●​ Use cases covered (minimum 3 for non-trivial systems)​

  ●​ Transport strategy (WS/WebRTC/pubsub) and selection criteria​

  ●​ Channel/topic model summary (naming + scoping)​

  ●​ Presence model summary:​

         ○​ online/offline/away definitions​

         ○​ TTL/heartbeat policy​

         ○​ conflict resolution rule​

  ●​ Delivery semantics summary:​

         ○​ ordering guarantees​

         ○​ dedupe strategy​

         ○​ ack strategy​
         ○​ replay policy (if any)​

  ●​ Authorization model summary (where checks occur)​

  ●​ Failure behavior and fallbacks (reconnect strategy, degraded mode)​

  ●​ Scaling assumptions and bottlenecks (qualitative + key metrics)​



Optional Fields
  ●​ Multi-region realtime notes | OPTIONAL​

  ●​ Moderation/abuse hooks pointer | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Realtime must degrade gracefully: define fallback when realtime is unavailable.​

  ●​ Presence must define source of truth (server vs client vs hybrid).​

  ●​ Delivery semantics must be explicit; “best effort” must define what can be dropped.​

  ●​ Authorization must be enforced server-side for all channel joins and message sends.​

  ●​ Any scaling assumptions must be traceable to PERF/COST docs later (pointer only).​



Output Format
1) Scope Summary (required)

  ●​ Realtime included: {{scope.included}}​

  ●​ Realtime excluded: {{scope.excluded}} | OPTIONAL​

  ●​ Primary transports: {{scope.transports}}​
2) Use Cases (required)
 use_c        name             purpose              criticality   linked_features       notes
 ase_id

rt_uc_    {{usecases[0      {{usecases[0].     {{usecases[0].cr   {{usecases[0].fe   {{usecases[0
01        ].name}}          purpose}}          iticality}}        ature_ids}}        ].notes}}


3) Transport Strategy (required)

   ●​ Primary transport: {{transport.primary}}​

   ●​ Fallback transport: {{transport.fallback}} | OPTIONAL​

   ●​ Selection criteria: {{transport.criteria}}​

   ●​ Connection lifecycle: {{transport.lifecycle}} | OPTIONAL​



4) Channel/Topic Model (required)

   ●​ Naming convention: {{channels.naming}}​

   ●​ Scoping rules: {{channels.scoping}}​

   ●​ Join rules: {{channels.join_rules}}​

   ●​ Leave/disconnect rules: {{channels.leave_rules}} | OPTIONAL​



5) Presence Model (required)

   ●​ Presence states: {{presence.states}}​

   ●​ Heartbeat/TTL: {{presence.ttl_policy}}​

   ●​ Source of truth: {{presence.source_of_truth}}​

   ●​ Conflict resolution: {{presence.conflict_resolution}}​



6) Delivery Semantics (required)
  ●​ Ordering: {{delivery.ordering}}​

  ●​ Dedupe: {{delivery.dedupe}}​

  ●​ Ack policy: {{delivery.ack}}​

  ●​ Replay policy: {{delivery.replay}} | OPTIONAL​



7) Authorization Summary (required)

  ●​ Where checks happen: {{authz.enforcement_points}}​

  ●​ Join authorization rule: {{authz.join_rule}}​

  ●​ Send authorization rule: {{authz.send_rule}}​



8) Failure + Fallback Behavior (required)

  ●​ Reconnect strategy: {{failure.reconnect}}​

  ●​ Backoff: {{failure.backoff}} | OPTIONAL​

  ●​ Degraded mode behavior: {{failure.degraded_mode}}​

  ●​ User messaging pointer: {{xref:CDX-04}} | OPTIONAL​



9) Scaling Assumptions (required)

  ●​ Expected concurrency: {{scale.expected_concurrency}} | OPTIONAL​

  ●​ Message rate assumptions: {{scale.message_rate}} | OPTIONAL​

  ●​ Bottlenecks: {{scale.bottlenecks}}​

  ●​ Monitoring needs: {{scale.monitoring}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:RTM-01}} | OPTIONAL, {{xref:RTM-02}} | OPTIONAL, {{xref:RTM-03}} |
     OPTIONAL, {{xref:RTM-04}} | OPTIONAL, {{xref:RTM-05}} | OPTIONAL​

  ●​ Downstream: {{xref:RTM-06}} | OPTIONAL, {{xref:OBS-}} | OPTIONAL, {{xref:PERF-}} |
     OPTIONAL, {{xref:WFO-*}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Scope + transports + presence + delivery basics.​

  ●​ intermediate: Required. Add authz and failure fallback behavior.​

  ●​ advanced: Required. Add scaling assumptions and monitoring needs.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: multi_region_notes, moderation_hooks,
     expected_concurrency, message_rate, notes​

  ●​ If delivery semantics or presence source of truth is UNKNOWN → block Completeness
     Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.ARCH​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ usecases_present == true​

         ○​ transport_strategy_present == true​

         ○​ presence_defined == true​
○​ delivery_semantics_defined == true​

○​ authz_defined == true​

○​ fallback_defined == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true​
