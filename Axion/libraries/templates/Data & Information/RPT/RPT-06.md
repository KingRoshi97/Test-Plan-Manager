RPT-06
RPT-06 — Reporting Data Quality Rules
(reconciliation, correctness)
Header Block
   ●​ template_id: RPT-06​

   ●​ title: Reporting Data Quality Rules (reconciliation, correctness)​

   ●​ type: reporting_aggregations​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/reporting/RPT-06_Reporting_Data_Quality_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.RPT​

   ●​ upstream_dependencies: ["RPT-02", "RPT-03", "DQV-02"]​

   ●​ inputs_required: ["RPT-02", "RPT-03", "DQV-02", "DQV-06", "BI-05",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define how reporting correctness is verified: reconciliation rules between raw sources and
aggregates/snapshots, acceptable deltas, auditability of metric computations, and actions when
discrepancies are detected.


Inputs Required
   ●​ RPT-02: {{xref:RPT-02}} | OPTIONAL​

   ●​ RPT-03: {{xref:RPT-03}} | OPTIONAL​

   ●​ DQV-02: {{xref:DQV-02}} | OPTIONAL​
  ●​ DQV-06: {{xref:DQV-06}} | OPTIONAL​

  ●​ BI-05: {{xref:BI-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Reconciliation rules catalog (minimum 15 rules)​

  ●​ For each rule:​

          ○​ recon_id​

          ○​ metric_id​

          ○​ source of truth dataset(s)​

          ○​ reporting dataset (rollup/snapshot)​

          ○​ reconciliation method (exact match, bounded delta)​

          ○​ acceptable delta (percent/absolute)​

          ○​ schedule (daily/weekly)​

          ○​ owner​

          ○​ failure action (alert, block release, recompute)​

          ○​ evidence artifact (report)​

  ●​ Global rules:​

          ○​ how to handle late data affecting reports​

          ○​ recompute policy linkage (RPT-04)​

  ●​ Verification checklist​
Optional Fields
      ●​ Audit-ready evidence pack outline | OPTIONAL​

      ●​ Notes | OPTIONAL​



Rules
      ●​ If applies == false, include 00_NA block only.​

      ●​ Every metric used in reporting must have at least one reconciliation rule.​

      ●​ Acceptable deltas must be explicit and justified.​

      ●​ Failures must have deterministic actions and owners.​



Output Format
1) Applicability

      ●​ applies: {{recon.applies}} (true/false)​

      ●​ 00_NA (if not applies): {{recon.na_block}} | OPTIONAL​



2) Reconciliation Rules (canonical)
 re     metric    sourc    report    metho      acce     sched      owner     action     eviden     notes
  c      _id      e_trut    ing_t      d        ptabl     ule                              ce
 o                  h       arget               e_del
 n                                               ta
 _i
 d

re      {{rules {{rules    {{rules   {{rules[   {{rule   {{rules[   {{rules   {{rules    {{rules[   {{rules
c_      [0].met [0].sou    [0].tar   0].met     s[0].d   0].sche    [0].ow    [0].acti   0].evid    [0].not
01      ric}}   rce}}      get}}     hod}}      elta}}   dule}}     ner}}     on}}       ence}}     es}}

re      {{rules {{rules    {{rules   {{rules[   {{rule   {{rules[   {{rules   {{rules    {{rules[   {{rules
c_      [1].met [1].sou    [1].tar   1].met     s[1].d   1].sche    [1].ow    [1].acti   1].evid    [1].not
02      ric}}   rce}}      get}}     hod}}      elta}}   dule}}     ner}}     on}}       ence}}     es}}
3) Global Rules (required if applies)

   ●​ Late data handling: {{global.late_data}}​

   ●​ Recompute linkage pointer: {{xref:RPT-04}} | OPTIONAL​

   ●​ Escalation path: {{global.escalation}} | OPTIONAL​



4) Verification Checklist (required if applies)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:DQV-02}} | OPTIONAL, {{xref:RPT-04}} | OPTIONAL​

   ●​ Downstream: {{xref:ALRT-*}} | OPTIONAL, {{xref:RELOPS-05}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
