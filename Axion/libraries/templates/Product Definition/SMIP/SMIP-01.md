SMIP-01
SMIP-01 — KPI/OKR Definitions (targets +
owners)
Header Block
   ●​   template_id: SMIP-01
   ●​   title: KPI/OKR Definitions (targets + owners)
   ●​   type: success_metrics_instrumentation
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/metrics/SMIP-01_KPI_OKR_Definitions.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.METRICS
   ●​   upstream_dependencies: ["PRD-02"]
   ●​   inputs_required: ["PRD-02", "PRD-04", "URD-05", "STK-01", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define the canonical set of KPIs/OKRs with targets, owners, and measurement cadence. This is
the authoritative metrics layer that downstream analytics, dashboards, experimentation, and
release criteria reference.


Inputs Required
   ●​   PRD-02: {{xref:PRD-02}} | OPTIONAL
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   URD-05: {{xref:URD-05}} | OPTIONAL
   ●​   STK-01: {{xref:STK-01}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Metrics list (minimum 5)
   ●​ For each metric:
         ○​ metric_id
         ○​ metric_name
         ○​ type (KPI/OKR/guardrail)
         ○​ definition (plain language)
         ○​ formula/logic
         ○​     target (number or threshold) (or UNKNOWN)
         ○​     time_horizon (MVP/30/60/90/release)
         ○​     cadence (daily/weekly/monthly)
         ○​     owner (stakeholder_id or team)
         ○​     data_source (or UNKNOWN)
         ○​     segments (if any)
         ○​     linked_goal_ids (from PRD-02)
         ○​     linked_feature_ids (optional)


Optional Fields
  ●​ Baseline values | OPTIONAL
  ●​ Notes | OPTIONAL
  ●​ Open questions | OPTIONAL


Rules
  ●​ Every PRD-02 goal must map to at least one metric (enforced in PRD-02).
  ●​ Metrics must be measurable; if target is UNKNOWN, include the plan for setting it (in
     notes).
  ●​ If data_source is UNKNOWN, it must create a SMIP-02 instrumentation question.
  ●​ Guardrails must specify stop conditions or thresholds.


Output Format
1) Metrics Catalog (canonical)
m na     typ     defi     for     tar    bas     hori    cad     ow     data     seg      link    linke   not
e me      e      nitio    mul     get    elin    zon     enc     ner    _sou     men      ed_     d_fe    es
t                 n       a/lo            e               e              rce      ts      goa      atur
r                         gic                                                             l_id    e_id
i                                                                                           s        s
c
_
i
d

m {{m    {{m     {{me     {{m     {{m    {{m     {{m     {{m     {{m    {{met    {{me     {{m     {{met   {{m
e etri   etri    trics[   etric   etri   etric   etric   etric   etri   rics[0   trics[   etric   rics[   etri
t cs[    cs[     0].d     s[0].   cs[    s[0].   s[0].   s[0].   cs[    ].dat    0].se    s[0].   0].fe   cs[
_ 0].n   0].t    efinit   for     0].t   bas     hori    cad     0].o   a_so     gme      goal    ature   0].n
                 ion}}                                                           nts}}
0 am    yp          mul    arg    elin   zon} enc   wn     urce}        _ids   _ids}   ote
1 e}}   e}}         a}}    et}}   e}}    }    e}}   er}}   }            }}     }       s}}


2) Ownership Summary (required)

  ●​ {{derive:METRICS_BY_OWNER(metrics)}} | OPTIONAL

3) Open Questions (optional)

  ●​ {{open_questions[0]}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:PRD-02}} | OPTIONAL, {{xref:URD-05}} | OPTIONAL
  ●​ Downstream: {{xref:SMIP-02}}, {{xref:SMIP-03}} | OPTIONAL, {{xref:SMIP-04}} |
     OPTIONAL, {{xref:OBS-05}} | OPTIONAL, {{xref:EXPER-*}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. Define 5 metrics with owners and cadence; targets may be
     UNKNOWN.
  ●​ intermediate: Required. Add formulas and data sources; reduce UNKNOWN.
  ●​ advanced: Required. Add segments, guardrails, and explicit stop thresholds.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: target, baseline, data_source, segments, notes,
     open_questions
  ●​ If formula/logic is UNKNOWN → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.METRICS
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ metrics_count >= 5
        ○​ every_metric_has_definition_and_formula == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
