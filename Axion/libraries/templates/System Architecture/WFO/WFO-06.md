WFO-06
WFO-06 — Workflow Observability
(traceability, audit events, metrics)
Header Block
   ●​ template_id: WFO-06​

   ●​ title: Workflow Observability (traceability, audit events, metrics)​

   ●​ type: workflow_orchestration_design​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/workflows/WFO-06_Workflow_Observability.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.WORKFLOWS​

   ●​ upstream_dependencies: ["WFO-01", "OBS-01", "OBS-03"]​

   ●​ inputs_required: ["WFO-01", "OBS-01", "OBS-03", "AUDIT-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the required observability signals for workflows: traceability fields, audit events, metrics,
and dashboards so workflow health can be monitored and diagnosed consistently across
services.


Inputs Required
   ●​ WFO-01: {{xref:WFO-01}} | OPTIONAL​

   ●​ OBS-01: {{xref:OBS-01}} | OPTIONAL​

   ●​ OBS-03: {{xref:OBS-03}} | OPTIONAL​
  ●​ AUDIT-01: {{xref:AUDIT-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Required trace fields:​

         ○​ wf_id, run_id, step_id​

         ○​ correlation_id/trace_id​

         ○​ entity identifiers (redacted rules)​

  ●​ Required audit events (for sensitive workflows)​

  ●​ Metrics catalog:​

         ○​ runs_started, runs_succeeded, runs_failed​

         ○​ step_duration, queue_depth, retry_count​

         ○​ dlq_count​

  ●​ Tag policy (avoid high-cardinality labels)​

  ●​ Alert thresholds (what triggers alerts)​

  ●​ Coverage checks (every workflow emits core signals)​



Optional Fields
  ●​ Dashboard requirements | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ All workflows must emit wf_id + run_id + correlation_id at minimum.​

  ●​ Metrics must avoid high-cardinality tags (no user_id as metric label).​

  ●​ Sensitive workflows must emit audit events (aligned with PMAD-05/PMAD-06).​

  ●​ Alerts must be deterministic and tied to thresholds.​



Output Format
1) Required Trace Fields (required)
    field         required          description                       redaction

wf_id             true       {{trace.wf_id}}             {{trace.redaction.wf_id}}

run_id            true       {{trace.run_id}}            {{trace.redaction.run_id}}

step_id           true       {{trace.step_id}}           {{trace.redaction.step_id}}

correlation_id    true       {{trace.correlation_id}}    {{trace.redaction.correlation_id}}


2) Workflow Metrics (required)
         metric           type     increments_when         tags_allowed                notes

workflow_runs_start      counte    {{metrics.started.w   {{metrics.started.t   {{metrics.started.no
ed                       r         hen}}                 ags}}                 tes}}

workflow_runs_faile      counte    {{metrics.failed.wh   {{metrics.failed.tag {{metrics.failed.not
d                        r         en}}                  s}}                  es}}

workflow_step_dura       histogr   {{metrics.step_dur.   {{metrics.step_dur    {{metrics.step_dur.
tion_ms                  am        when}}                .tags}}               notes}}

workflow_dlq_count       counte    {{metrics.dlq.when}   {{metrics.dlq.tags}   {{metrics.dlq.notes}
                         r         }                     }                     }


3) Audit Events (required if sensitive workflows exist)

  ●​ Required audit events: {{audit.events}}​

  ●​ When emitted: {{audit.when}}​
  ●​ Redaction rules: {{audit.redaction}}​



4) Alert Thresholds (required)
alert_id   trigger_metri        threshold           window             severity            action
                 c

wf_alert   {{alerts[0].met   {{alerts[0].thres   {{alerts[0].wind   {{alerts[0].seve   {{alerts[0].acti
_01        ric}}             hold}}              ow}}               rity}}             on}}


5) Coverage Checks (required)

  ●​ Every wf_id emits core metrics: {{coverage.metrics_complete}}​

  ●​ Every wf_id emits trace fields: {{coverage.trace_complete}}​

  ●​ Tags comply with policy: {{coverage.tags_compliant}}​



Cross-References
  ●​ Upstream: {{xref:OBS-01}} | OPTIONAL, {{xref:OBS-03}} | OPTIONAL, {{xref:AUDIT-01}}
     | OPTIONAL​

  ●​ Downstream: {{xref:ALRT-}} | OPTIONAL, {{xref:OPS-05}} | OPTIONAL, {{xref:IRP-}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Core trace fields + basic metrics.​

  ●​ intermediate: Required. Add tag policy and alert thresholds.​

  ●​ advanced: Required. Add audit event mapping and coverage checks.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: dashboard_requirements, notes, alert_actions​

 ●​ If coverage checks are UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.WORKFLOWS​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ trace_fields_present == true​

        ○​ metrics_present == true​

        ○​ alert_thresholds_present == true​

        ○​ coverage_checks_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
API Governance & Versioning (APIG)
●​ API Governance & Versioning (APIG)​
   APIG-01 API Standards (naming, pagination, filtering, consistency)​
   APIG-02 Versioning Policy (v1/v2 rules, compat guarantees)​
   APIG-03 Deprecation & Sunset Policy (timelines, comms, redirects)​
   APIG-04 Review Gate Checklist (what must be true before shipping APIs)​
   APIG-05 Compatibility Test Requirements (contract tests, schema checks)​
   APIG-06 Schema Evolution Rules (backward compatible changes, migrations)
