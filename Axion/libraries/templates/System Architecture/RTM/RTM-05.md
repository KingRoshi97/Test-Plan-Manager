RTM-05
RTM-05 — Presence & State Sync Model
(source of truth, TTLs, conflicts)
Header Block
   ●​ template_id: RTM-05​

   ●​ title: Presence & State Sync Model (source of truth, TTLs, conflicts)​

   ●​ type: realtime_messaging_architecture​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/realtime/RTM-05_Presence_State_Sync_Model.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.REALTIME​

   ●​ upstream_dependencies: ["RTM-01", "RTM-02", "RTM-03", "ARC-05"]​

   ●​ inputs_required: ["RTM-01", "RTM-02", "RTM-03", "ARC-05", "ERR-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define how presence and realtime state are represented, synchronized, expired, and reconciled
across clients and the server: source of truth, TTLs, heartbeats, conflict resolution, and resync
triggers.


Inputs Required
   ●​ RTM-01: {{xref:RTM-01}} | OPTIONAL​

   ●​ RTM-02: {{xref:RTM-02}} | OPTIONAL​

   ●​ RTM-03: {{xref:RTM-03}} | OPTIONAL​
  ●​ ARC-05: {{xref:ARC-05}} | OPTIONAL​

  ●​ ERR-01: {{xref:ERR-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Presence entity definition (fields + meaning)​

  ●​ Presence states:​

         ○​ online​

         ○​ offline​

         ○​ away (optional)​

         ○​ busy (optional)​

  ●​ Source of truth (server/client/hybrid) and rationale​

  ●​ Heartbeat model:​

         ○​ heartbeat interval​

         ○​ TTL expiry window​

         ○​ reconnect behavior​

  ●​ State sync model:​

         ○​ authoritative state vs derived state​

         ○​ resync triggers (on connect, on gap, on conflict)​

         ○​ delta vs snapshot strategy​

  ●​ Conflict resolution rules:​

         ○​ multiple devices​
          ○​ stale updates​

          ○​ out-of-order delivery​

  ●​ Privacy rules:​

          ○​ who can see presence​

          ○​ opt-out rules​

          ○​ “invisible” mode (if any)​

  ●​ Observability requirements (metrics/fields)​



Optional Fields
  ●​ Cross-device priority rules | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Presence must expire automatically if no heartbeats; no “stuck online.”​

  ●​ State sync must tolerate disconnects and reordering.​

  ●​ Privacy is mandatory: presence visibility must be controlled by policy.​

  ●​ If hybrid source-of-truth, define deterministic tie-breaker rules.​



Output Format
1) Presence Entity (required)
  field                type                        meaning                        notes

user_id   {{presence.fields.user_id       {{presence.fields.user_id.m   {{presence.fields.user_id.
          .type}}                         eaning}}                      notes}}
status     {{presence.fields.status.t   {{presence.fields.status.me    {{presence.fields.status.n
           ype}}                        aning}}                        otes}}

last_see {{presence.fields.last_se      {{presence.fields.last_seen.   {{presence.fields.last_se
n_at     en.type}}                      meaning}}                      en.notes}}

device_i   {{presence.fields.device_ {{presence.fields.device_id.      {{presence.fields.device_i
d          id.type}}                 meaning}}                         d.notes}}


2) Presence States (required)

  ●​ States: {{presence.states}}​

  ●​ Transition rules: {{presence.transitions}}​

  ●​ Derived states (if any): {{presence.derived_states}} | OPTIONAL​



3) Source of Truth (required)

  ●​ Source: {{truth.source}} (server/client/hybrid)​

  ●​ Rationale: {{truth.rationale}}​

  ●​ Tie-breaker rule (if hybrid): {{truth.tiebreaker}} | OPTIONAL​



4) Heartbeat & TTL (required)

  ●​ Heartbeat interval: {{heartbeat.interval}}​

  ●​ TTL window: {{heartbeat.ttl}}​

  ●​ Expiry behavior: {{heartbeat.expiry_behavior}}​

  ●​ Reconnect behavior: {{heartbeat.reconnect_behavior}}​



5) State Sync Strategy (required)

  ●​ Snapshot vs delta: {{sync.strategy}}​

  ●​ Resync triggers: {{sync.resync_triggers}}​
  ●​ Gap detection: {{sync.gap_detection}} | OPTIONAL​



6) Conflict Resolution (required)

  ●​ Multi-device rule: {{conflict.multi_device}}​

  ●​ Out-of-order handling: {{conflict.out_of_order}}​

  ●​ Stale updates: {{conflict.stale_updates}}​



7) Privacy Rules (required)

  ●​ Visibility policy: {{privacy.visibility_policy}}​

  ●​ Opt-out/invisible mode: {{privacy.invisible_mode}} | OPTIONAL​

  ●​ Audience constraints: {{privacy.audience_constraints}}​



8) Observability Requirements (required)

  ●​ Metrics: {{obs.metrics}}​

  ●​ Required fields in logs: {{obs.log_fields}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:RTM-02}} | OPTIONAL, {{xref:RTM-03}} | OPTIONAL, {{xref:ARC-05}} |
     OPTIONAL​

  ●​ Downstream: {{xref:RTS-}} | OPTIONAL, {{xref:OBS-}} | OPTIONAL, {{xref:QA-04}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
 ●​ beginner: Required. Entity + states + heartbeat/TTL.​

 ●​ intermediate: Required. Add source-of-truth and sync strategy.​

 ●​ advanced: Required. Add conflict resolution and privacy rules.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: invisible_mode, cross_device_priority, notes,
    gap_detection​

 ●​ If source of truth or TTL policy is UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.REALTIME​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ presence_entity_present == true​

        ○​ ttl_defined == true​

        ○​ sync_strategy_defined == true​

        ○​ conflict_rules_present == true​

        ○​ privacy_rules_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true​
