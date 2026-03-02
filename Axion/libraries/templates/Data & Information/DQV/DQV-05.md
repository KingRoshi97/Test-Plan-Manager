DQV-05
DQV-04 — Consistency & Integrity
Monitoring (drift, anomalies)
Header Block
   ●​ template_id: DQV-04​

   ●​ title: Consistency & Integrity Monitoring (drift, anomalies)​

   ●​ type: data_quality_validation​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_quality/DQV-04_Consistency_Integrity_Monitoring.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DQV​

   ●​ upstream_dependencies: ["DQV-02", "OBS-02", "ALRT-01"]​

   ●​ inputs_required: ["DQV-02", "OBS-02", "ALRT-01", "RELIA-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define how the system monitors data consistency and integrity over time: drift detection,
anomaly detection, referential integrity monitoring, and alerting/escalation when data quality
degrades.


Inputs Required
   ●​ DQV-02: {{xref:DQV-02}} | OPTIONAL​

   ●​ OBS-02: {{xref:OBS-02}} | OPTIONAL​

   ●​ ALRT-01: {{xref:ALRT-01}} | OPTIONAL​
  ●​ RELIA-01: {{xref:RELIA-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Monitoring signals catalog (minimum 12 signals)​

  ●​ For each signal:​

          ○​ signal_id​

          ○​ target entity/dataset​

          ○​ signal type (drift/anomaly/integrity/freshness)​

          ○​ metric definition​

          ○​ baseline expectation​

          ○​ thresholds (warning/critical)​

          ○​ window​

          ○​ detection frequency​

          ○​ alert routing (who gets paged/ticket)​

          ○​ failure action (investigate/backfill/pause pipeline)​

  ●​ Escalation process​

  ●​ Verification checklist​



Optional Fields
  ●​ Statistical methods notes | OPTIONAL​
     ●​ Notes | OPTIONAL​



Rules
     ●​ If applies == false, include 00_NA block only.​

     ●​ Thresholds must be explicit; no “alert if bad.”​

     ●​ Signals must map to alert routes and actions.​

     ●​ Monitoring must avoid high-cardinality metrics that explode cost.​



Output Format
1) Applicability

     ●​ applies: {{monitor.applies}} (true/false)​

     ●​ 00_NA (if not applies): {{monitor.na_block}} | OPTIONAL​



2) Monitoring Signals (canonical)
si    targe     type     metri     baseli    warn     critic   windo   freq    route    actio     note
g       t                 c         ne                  al       w                        n        s
n
al
_i
d

si    {{sign    {{sig    {{sign    {{signa   {{sign   {{sign {{signa {{sig     {{sign   {{sign    {{sign
g     als[0].   nals[    als[0].   ls[0].b   als[0]   als[0]. ls[0].wi nals[   als[0]   als[0].   als[0]
_     target    0].typ   metric    aselin    .warn    critical ndow}} 0].fre   .route   action    .note
0     }}        e}}      }}        e}}       }}       }}               q}}     }}       }}        s}}
1

si    {{sign    {{sig    {{sign    {{signa   {{sign   {{sign {{signa {{sig     {{sign   {{sign    {{sign
g     als[1].   nals[    als[1].   ls[1].b   als[1]   als[1]. ls[1].wi nals[   als[1]   als[1].   als[1]
_     target    1].typ   metric    aselin    .warn    critical ndow}} 1].fre   .route   action    .note
0     }}        e}}      }}        e}}       }}       }}               q}}     }}       }}        s}}
2
3) Escalation Process (required if applies)

   ●​ On warning: {{escalation.warning}}​

   ●​ On critical: {{escalation.critical}}​

   ●​ Backfill/pause authority: {{escalation.authority}} | OPTIONAL​



4) Verification Checklist (required if applies)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:DQV-02}} | OPTIONAL, {{xref:OBS-02}} | OPTIONAL​

   ●​ Downstream: {{xref:DQV-05}} | OPTIONAL, {{xref:PIPE-04}} | OPTIONAL, {{xref:IRP-*}} |
      OPTIONAL​

   ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Not required.​

   ●​ intermediate: Required if applies. Signals + thresholds + routes.​

   ●​ advanced: Required if applies. Add escalation authority and methods notes.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: statistical_methods_notes, notes, authority,
    baseline (if to be established but must be planned)​

 ●​ If applies == true and thresholds are UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.DQV​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ if_applies_then_signals_count >= 12​

        ○​ thresholds_present == true​

        ○​ routes_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
