RTM-04
RTM-04 — Delivery Semantics (ordering,
dedupe, at-least-once, ack)
Header Block
   ●​ template_id: RTM-04​

   ●​ title: Delivery Semantics (ordering, dedupe, at-least-once, ack)​

   ●​ type: realtime_messaging_architecture​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/realtime/RTM-04_Delivery_Semantics.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.REALTIME​

   ●​ upstream_dependencies: ["RTM-01", "RTM-02", "ERR-05"]​

   ●​ inputs_required: ["RTM-01", "RTM-02", "ERR-05", "OBS-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the delivery guarantees and semantics for realtime messages/updates: ordering,
deduplication, acknowledgments, retries, replay, and how clients reconcile state. This prevents
subtle realtime bugs and makes behavior testable.


Inputs Required
   ●​ RTM-01: {{xref:RTM-01}} | OPTIONAL​

   ●​ RTM-02: {{xref:RTM-02}} | OPTIONAL​

   ●​ ERR-05: {{xref:ERR-05}} | OPTIONAL​
  ●​ OBS-01: {{xref:OBS-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Global delivery posture (at-most-once/at-least-once/exactly-once claim policy)​

  ●​ Ordering rules:​

         ○​ per-channel ordering guarantee (yes/no)​

         ○​ cross-channel ordering (no guarantee unless stated)​

  ●​ Dedupe rules:​

         ○​ message_id generation (server/client)​

         ○​ dedupe window/ttl​

         ○​ idempotency handling for updates​

  ●​ Ack rules:​

         ○​ when server acks​

         ○​ client ack requirements (if any)​

         ○​ retry triggers​

  ●​ Replay/backfill rules:​

         ○​ when history is replayed​

         ○​ retention window policy​

         ○​ permission constraints on replay​

  ●​ Client reconciliation rules:​

         ○​ optimistic updates handling​
         ○​ conflict resolution​

         ○​ resync triggers​

  ●​ Test requirements (contract tests)​



Optional Fields
  ●​ Exactly-once disclaimer | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Do not claim exactly-once unless proven; default to at-least-once with dedupe.​

  ●​ Ordering must be explicit; if not guaranteed, clients must tolerate reordering.​

  ●​ Dedupe must be deterministic and scoped (channel + sender + message_id).​

  ●​ Replay must enforce auth checks (no history leaks).​



Output Format
1) Delivery Posture (required)

  ●​ Posture: {{delivery.posture}} (at-most-once / at-least-once)​

  ●​ Exactly-once policy: {{delivery.exactly_once_policy}} | OPTIONAL​



2) Ordering Rules (required)

  ●​ Per-channel ordering: {{ordering.per_channel}}​

  ●​ Cross-channel ordering: {{ordering.cross_channel}}​

  ●​ Ordering exceptions: {{ordering.exceptions}} | OPTIONAL​
3) Message Identity & Dedupe (required)

   ●​ message_id source: {{dedupe.message_id_source}} (server/client/both)​

   ●​ message_id format: {{dedupe.message_id_format}}​

   ●​ dedupe window: {{dedupe.window}}​

   ●​ dedupe key scope: {{dedupe.scope}}​



4) Acknowledgments & Retries (required)

   ●​ Server ack condition: {{ack.server_ack_condition}}​

   ●​ Client ack requirement: {{ack.client_ack}} | OPTIONAL​

   ●​ Retry trigger rules: {{ack.retry_triggers}}​

   ●​ Retry backoff profile: {{ack.backoff_profile}} | OPTIONAL​



5) Replay / History (required if used)

   ●​ Retention window: {{replay.retention}}​

   ●​ Who can replay: {{replay.auth_rules}}​

   ●​ Backfill trigger rules: {{replay.backfill_triggers}} | OPTIONAL​



6) Client Reconciliation (required)

   ●​ Optimistic update rule: {{client.optimistic}}​

   ●​ Conflict resolution rule: {{client.conflict_resolution}}​

   ●​ Resync triggers: {{client.resync_triggers}}​



7) Test Requirements (required)

   ●​ Contract tests: {{tests.contract}}​
  ●​ Dedupe tests: {{tests.dedupe}} | OPTIONAL​

  ●​ Ordering tolerance tests: {{tests.ordering}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:RTM-02}} | OPTIONAL, {{xref:ERR-05}} | OPTIONAL​

  ●​ Downstream: {{xref:RTM-05}}, {{xref:RTM-06}} | OPTIONAL, {{xref:QA-04}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Posture + ordering + dedupe basics.​

  ●​ intermediate: Required. Add ack/retry rules and reconciliation rules.​

  ●​ advanced: Required. Add replay policy and test requirements.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: exactly_once_policy, ordering_exceptions,
     client_ack, notes​

  ●​ If delivery posture or dedupe scope is UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.REALTIME​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​
○​ posture_defined == true​

○​ ordering_defined == true​

○​ dedupe_defined == true​

○​ ack_retry_defined == true​

○​ reconciliation_defined == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true
