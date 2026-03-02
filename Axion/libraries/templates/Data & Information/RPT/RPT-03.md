RPT-03
RPT-03 — Aggregation & Rollup Rules
(windows, group-bys)
Header Block
   ●​ template_id: RPT-03​

   ●​ title: Aggregation & Rollup Rules (windows, group-bys)​

   ●​ type: reporting_aggregations​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/reporting/RPT-03_Aggregation_Rollup_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.RPT​

   ●​ upstream_dependencies: ["RPT-02", "DATA-07", "BI-02"]​

   ●​ inputs_required: ["RPT-02", "DATA-07", "BI-02", "DQV-02", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define how metrics are aggregated and rolled up: time windows, grouping dimensions,
late-arriving data handling, deduplication rules, and recomputation policies. This ensures report
numbers are stable, explainable, and consistent across surfaces.


Inputs Required
   ●​ RPT-02: {{xref:RPT-02}} | OPTIONAL​

   ●​ DATA-07: {{xref:DATA-07}} | OPTIONAL​

   ●​ BI-02: {{xref:BI-02}} | OPTIONAL​
  ●​ DQV-02: {{xref:DQV-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Rollup rules catalog (minimum 15 rules)​

  ●​ For each rule:​

          ○​ rollup_id​

          ○​ metric_id(s)​

          ○​ window type (hour/day/week/month/rolling)​

          ○​ window boundaries (timezone)​

          ○​ group-by dimensions allowed​

          ○​ dedupe rule (event_id/entity_id)​

          ○​ late-arriving data policy (backfill window)​

          ○​ recompute policy (full/partial)​

          ○​ correctness checks (reconciliation rule)​

          ○​ owner​

  ●​ Global rules:​

          ○​ timezone standard for windows​

          ○​ rounding rules​

          ○​ null/empty handling​

  ●​ Verification checklist​
Optional Fields
      ●​ Cross-metric consistency rules | OPTIONAL​

      ●​ Notes | OPTIONAL​



Rules
      ●​ If applies == false, include 00_NA block only.​

      ●​ Every rollup must specify timezone and dedupe keys.​

      ●​ Late-arriving data must have explicit backfill windows.​

      ●​ Recompute policies must be deterministic and observable.​



Output Format
1) Applicability

      ●​ applies: {{rollups.applies}} (true/false)​

      ●​ 00_NA (if not applies): {{rollups.na_block}} | OPTIONAL​



2) Rollup Rules Catalog (canonical)
ro      metric     windo      time   group_     dedup     late_    recomp      check     owner     notes
llu       s          w         zon     by       e_key     data_      ute         s
p_                              e                         polic
id                                                          y

rol     {{rules[   {{rules[   {{rul {{rules[   {{rules[   {{rule   {{rules[0   {{rules   {{rules   {{rule
l_      0].metr    0].wind    es[0] 0].grou    0].ded     s[0].l   ].recom     [0].che   [0].ow    s[0].n
01      ics}}      ow}}       .tz}} p_by}}     upe}}      ate}}    pute}}      cks}}     ner}}     otes}}

rol     {{rules[   {{rules[   {{rul {{rules[   {{rules[   {{rule   {{rules[1   {{rules   {{rules   {{rule
l_      1].metr    1].wind    es[1] 1].grou    1].ded     s[1].l   ].recom     [1].che   [1].ow    s[1].n
02      ics}}      ow}}       .tz}} p_by}}     upe}}      ate}}    pute}}      cks}}     ner}}     otes}}


3) Global Rules (required if applies)
   ●​ Timezone standard: {{global.timezone}}​

   ●​ Rounding rules: {{global.rounding}}​

   ●​ Null/empty handling: {{global.null_handling}}​



4) Verification Checklist (required if applies)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:RPT-02}} | OPTIONAL, {{xref:DQV-02}} | OPTIONAL​

   ●​ Downstream: {{xref:RPT-04}}, {{xref:RPT-06}} | OPTIONAL, {{xref:BI-03}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
