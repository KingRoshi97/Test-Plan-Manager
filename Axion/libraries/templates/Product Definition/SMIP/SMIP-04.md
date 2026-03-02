SMIP-04
SMIP-04 — Experiment Measurement Plan
(guardrails + success)
Header Block
   ●​   template_id: SMIP-04
   ●​   title: Experiment Measurement Plan (guardrails + success)
   ●​   type: success_metrics_instrumentation
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/metrics/SMIP-04_Experiment_Measurement_Plan.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.METRICS
   ●​   upstream_dependencies: ["SMIP-01", "URD-05"]
   ●​   inputs_required: ["SMIP-01", "URD-05", "SMIP-03", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}


Purpose
Define how experiments will be measured: success metrics, guardrails, stop conditions, and
analysis requirements. This is the product-facing measurement plan that can be executed by
the experimentation system.


Inputs Required
   ●​   SMIP-01: {{xref:SMIP-01}}
   ●​   URD-05: {{xref:URD-05}} | OPTIONAL
   ●​   SMIP-03: {{xref:SMIP-03}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Applicability (true/false) (if no experiments planned, mark N/A)
   ●​ Experiment list (minimum 1 if applicable)
   ●​ For each experiment:
         ○​ exp_id
         ○​ hypothesis
         ○​ primary_metric_id
         ○​ secondary_metric_ids
         ○​ guardrail_metric_ids
            ○​   success threshold
            ○​   stop conditions
            ○​   segments
            ○​   duration / sample size plan (or UNKNOWN)
            ○​   analysis notes


Optional Fields
     ●​ Statistical method notes | OPTIONAL
     ●​ Open questions | OPTIONAL


Rules
     ●​ If applies == false, include N/A block only.
     ●​ Primary/guardrail metrics must exist in SMIP-01.
     ●​ Stop conditions must be explicit and measurable.


Output Format
1) Applicability

     ●​ applies: {{exper.applies}} (true/false)
     ●​ rationale: {{exper.rationale}} | OPTIONAL

2) Experiment Plans (if applies)
 e    hypothe      primary_m      guardrail    success      stop_    segment      duratio      analysi
 x      sis         etric_id      _metric_     _thresh      condit      s           n          s_notes
 p                                  ids          old         ions
 _
 i
 d

e     {{exper.lis {{exper.list[   {{exper.li   {{exper.li   {{exper {{exper.li    {{exper.li   {{exper.li
x     t[0].hypot 0].primary_      st[0].guar   st[0].thre   .list[0]. st[0].seg   st[0].dur    st[0].ana
p     hesis}}     metric}}        drails}}     shold}}      stop}}    ments}}     ation}}      lysis}}
_
0
1


3) N/A Marker (if not applies)
  ●​ 00_NA: {{exper.na_block}} | OPTIONAL

4) Open Questions (optional)

  ●​ {{open_questions[0]}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:SMIP-01}}, {{xref:URD-05}} | OPTIONAL
  ●​ Downstream: {{xref:EXPER-*}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Not required unless experiments planned.
  ●​ intermediate: Required if applies.
  ●​ advanced: Required if applies.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: duration, segments, analysis_notes,
     open_questions
  ●​ If applies == true and success_threshold is UNKNOWN → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.METRICS
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ if_applies_then_experiments_present == true
        ○​ metrics_refs_valid == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
Domains
AXION domain list (v1)
A) Core build domains

  1.​ architecture​


  2.​ frontend​


  3.​ backend​


  4.​ mobile​


  5.​ integrations​


  6.​ api_gateway​



B) Data domains

  7.​ data​


  8.​ data_platform​


  9.​ indexing​


  10.​search​


  11.​caching​



C) Identity & admin domains

  12.​identity_access​


  13.​authn_authz​


  14.​permissions_policy​
  15.​admin_internal_tools​



D) Realtime & communications domains

  16.​realtime​


  17.​messaging​


  18.​eventing_webhooks​


  19.​notifications​



E) Monetization domains

  20.​payments​


  21.​billing​


  22.​subscriptions_entitlements​


  23.​pricing_plans​



F) Media domains

  24.​media_storage​


  25.​file_processing​


  26.​uploads_downloads​


  27.​cdn_delivery​



G) Experience domains

  28.​ux​
   29.​design_system​


   30.​content_design​


   31.​accessibility​



H) Platform operations domains

   32.​ops​


   33.​infrastructure​


   34.​cicd_pipelines​


   35.​environment_management​


   36.​release​



I) Quality & reliability domains

   37.​quality​


   38.​test_infrastructure​


   39.​test_data_environments​


   40.​performance​


   41.​reliability_resilience​


   42.​incident_response​



J) Security, privacy, compliance domains

   43.​security​
44.​telemetry_observability​


45.​logging_tracing​


46.​monitoring_alerting​


47.​slo_sla_error_budgets​


48.​compliance​


49.​privacy_data_governance​


50.​audit_forensics​


51.​risk_management​


52.​migration_import_export​


53.​backup_restore_dr
