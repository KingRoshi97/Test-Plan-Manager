WFO-02
WFO-02 — Orchestration Patterns (state
machine, retries, compensation)
Header Block
   ●​ template_id: WFO-02​

   ●​ title: Orchestration Patterns (state machine, retries, compensation)​

   ●​ type: workflow_orchestration_design​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/workflows/WFO-02_Orchestration_Patterns.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.WORKFLOWS​

   ●​ upstream_dependencies: ["WFO-01", "ERR-05", "RELIA-02"]​

   ●​ inputs_required: ["WFO-01", "ERR-05", "RELIA-02", "OBS-03", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical orchestration patterns used across workflows: how state machines are
modeled, how retries and backoff are applied, how compensation works, and how workflows
transition between states under failure.


Inputs Required
   ●​ WFO-01: {{xref:WFO-01}} | OPTIONAL​

   ●​ ERR-05: {{xref:ERR-05}} | OPTIONAL​

   ●​ RELIA-02: {{xref:RELIA-02}} | OPTIONAL​
  ●​ OBS-03: {{xref:OBS-03}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Pattern catalog (minimum 6 patterns)​

  ●​ For each pattern:​

         ○​ pattern_id​

         ○​ name​

         ○​ when to use​

         ○​ when not to use​

         ○​ state model (states + transitions)​

         ○​ retry rules (which steps retry)​

         ○​ compensation rules (how to undo/repair)​

         ○​ timeout rules​

         ○​ observability hooks (what to trace/measure)​

  ●​ Global workflow state definitions (queued/running/waiting/succeeded/failed/cancelled)​

  ●​ Standard retry/backoff policy pointers​

  ●​ “Stuck workflow” detection rules (timeouts, watchdog)​



Optional Fields
  ●​ Diagrams/pointers | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
   ●​ Retries must be bounded and follow ERR-05 profiles.​

   ●​ Compensation must be explicit for multi-step workflows with side effects.​

   ●​ State transitions must be deterministic; no ambiguous “maybe” states.​

   ●​ Stuck detection must be measurable and alertable.​



Output Format
1) Global Workflow States (required)
  state                  meaning                 entry_conditions                  exit_conditions

queued        {{states.queued.meaning}}       {{states.queued.entry}}       {{states.queued.exit}}

running       {{states.running.meaning}}      {{states.running.entry}}      {{states.running.exit}}

waiting       {{states.waiting.meaning}}      {{states.waiting.entry}}      {{states.waiting.exit}}

succeede {{states.succeeded.meaning           {{states.succeeded.entry      {{states.succeeded.exit}
d        }}                                   }}                            }

failed        {{states.failed.meaning}}       {{states.failed.entry}}       {{states.failed.exit}}

cancelled     {{states.cancelled.meaning}} {{states.cancelled.entry}}       {{states.cancelled.exit}}


2) Patterns Catalog (canonical)
 pat      name      use_whe       avoid_whe    retry_r    compe         timeout_     obs_h      notes
 ter                   n              n          ule      nsation          rule       ooks
 n_i                                                       _rule
  d

pat      {{patter   {{patterns[   {{patterns[0 {{patter {{pattern {{pattern         {{patter   {{patter
_sa      ns[0].na   0].use_wh     ].avoid_wh ns[0].ret s[0].com s[0].time           ns[0].o    ns[0].no
ga       me}}       en}}          en}}         ry}}     p}}       out}}             bs}}       tes}}

pat      {{patter   {{patterns[   {{patterns[1 {{patter {{pattern {{pattern         {{patter   {{patter
_jo      ns[1].na   1].use_wh     ].avoid_wh ns[1].ret s[1].com s[1].time           ns[1].o    ns[1].no
b        me}}       en}}          en}}         ry}}     p}}       out}}             bs}}       tes}}
3) Stuck Workflow Detection (required)

  ●​ Watchdog rules: {{stuck.watchdog_rules}}​

  ●​ Timeout thresholds: {{stuck.timeouts}}​

  ●​ Escalation actions: {{stuck.escalation}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:ERR-05}} | OPTIONAL, {{xref:RELIA-02}} | OPTIONAL​

  ●​ Downstream: {{xref:WFO-05}} | OPTIONAL, {{xref:OPS-06}} | OPTIONAL, {{xref:IRP-*}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Global state definitions + 6 patterns (names + when to use).​

  ●​ intermediate: Required. Add retry/timeout rules and stuck detection.​

  ●​ advanced: Required. Add compensation and observability hooks per pattern.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: diagrams, notes, escalation_actions​

  ●​ If retry rules are UNKNOWN for any pattern → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.WORKFLOWS​
●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ patterns_count >= 6​

       ○​ global_states_present == true​

       ○​ stuck_detection_present == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true
