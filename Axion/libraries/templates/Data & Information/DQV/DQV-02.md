DQV-02
DQV-02 — Data Quality Checks Catalog
(rules by entity)
Header Block
   ●​ template_id: DQV-02​

   ●​ title: Data Quality Checks Catalog (rules by entity)​

   ●​ type: data_quality_validation​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_quality/DQV-02_Data_Quality_Checks_Catalog.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DQV​

   ●​ upstream_dependencies: ["DATA-01", "DATA-03", "DQV-01"]​

   ●​ inputs_required: ["DATA-01", "DATA-03", "DQV-01", "ERR-02", "OBS-02",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define the catalog of data quality checks that continuously validate correctness, completeness,
and integrity of stored data. These checks detect drift, corruption, and broken invariants over
time.


Inputs Required
   ●​ DATA-01: {{xref:DATA-01}} | OPTIONAL​

   ●​ DATA-03: {{xref:DATA-03}} | OPTIONAL​

   ●​ DQV-01: {{xref:DQV-01}} | OPTIONAL​
  ●​ ERR-02: {{xref:ERR-02}} | OPTIONAL​

  ●​ OBS-02: {{xref:OBS-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ DQ check catalog (minimum 25 checks)​

  ●​ For each check:​

          ○​ dq_id​

          ○​ entity_id/dataset_id​

          ○​ check_type (completeness/validity/uniqueness/referential/freshness)​

          ○​ rule description (predicate)​

          ○​ threshold (allowed failure rate)​

          ○​ schedule (cron/streaming/on-write)​

          ○​ owner​

          ○​ alerting severity​

          ○​ failure action (alert/quarantine/stop pipeline)​

          ○​ reason_code (if user-impacting) | OPTIONAL​

          ○​ metric name (for tracking)​

  ●​ Reporting format (DQ report contents)​



Optional Fields
    ●​ Auto-repair strategies | OPTIONAL​

    ●​ Notes | OPTIONAL​



Rules
    ●​ If applies == false, include 00_NA block only.​

    ●​ Each check must be measurable and produce a metric.​

    ●​ Thresholds must be explicit; “should be good” is not allowed.​

    ●​ Any “stop pipeline” action must have an escalation path.​



Output Format
1) Applicability

    ●​ applies: {{dq.applies}} (true/false)​

    ●​ 00_NA (if not applies): {{dq.na_block}} | OPTIONAL​



2) DQ Checks Catalog (canonical)
d    target   chec      rule    thresh     schedu    owner     severit    action    metric    notes
q             k_typ               old        le                  y
_               e
i
d

d {{chec      {{chec {{che      {{check {{check      {{chec    {{check    {{chec    {{chec    {{chec
q ks[0].t     ks[0].t cks[0]    s[0].thre s[0].sch   ks[0].o   s[0].se    ks[0].a   ks[0].    ks[0].n
_ arget}}     ype}} .rule}}     shold}}   edule}}    wner}}    verity}}   ction}}   metric}   otes}}
0                                                                                   }
1

d {{chec      {{chec {{che      {{check {{check      {{chec    {{check    {{chec    {{chec    {{chec
q ks[1].t     ks[1].t cks[1]    s[1].thre s[1].sch   ks[1].o   s[1].se    ks[1].a   ks[1].    ks[1].n
_ arget}}     ype}} .rule}}     shold}}   edule}}    wner}}    verity}}   ction}}   metric}   otes}}
                                                                                    }
0
2


3) DQ Report Format (required if applies)

    ●​ Report fields: {{report.fields}}​

    ●​ Aggregation windows: {{report.windows}} | OPTIONAL​

    ●​ Storage location pointer: {{report.storage}} | OPTIONAL​



Cross-References
    ●​ Upstream: {{xref:DQV-01}} | OPTIONAL, {{xref:DATA-03}} | OPTIONAL​

    ●​ Downstream: {{xref:DQV-04}}, {{xref:DQV-05}}, {{xref:ALRT-*}} | OPTIONAL​

    ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
       {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
    ●​ beginner: Not required.​

    ●​ intermediate: Required if applies. 25 checks with thresholds and schedules.​

    ●​ advanced: Required if applies. Add failure actions, alerting severity, and report storage.​



Unknown Handling
    ●​ UNKNOWN_ALLOWED: auto_repair_strategies, notes,
        report_storage_pointer​

    ●​ If applies == true and thresholds are UNKNOWN → block Completeness Gate.​



Completeness Gate
●​ Gate ID: TMP-05.PRIMARY.DQV​

●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ if_applies_then_checks_count >= 25​

       ○​ thresholds_present == true​

       ○​ schedules_present == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true
