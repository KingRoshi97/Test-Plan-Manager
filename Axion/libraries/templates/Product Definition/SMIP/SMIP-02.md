SMIP-02
SMIP-02 — Analytics Event Spec (event
names + properties)
Header Block
   ●​   template_id: SMIP-02
   ●​   title: Analytics Event Spec (event names + properties)
   ●​   type: success_metrics_instrumentation
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/metrics/SMIP-02_Analytics_Event_Spec.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.METRICS
   ●​   upstream_dependencies: ["SMIP-01", "DMG-04"]
   ●​   inputs_required: ["SMIP-01", "DMG-04", "PRD-04", "DGP-01", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define the canonical analytics event taxonomy and event properties used to measure KPIs,
funnels, and experiments. This must align with privacy/data classification rules and avoid PII
leakage.


Inputs Required
   ●​   SMIP-01: {{xref:SMIP-01}}
   ●​   DMG-04: {{xref:DMG-04}} | OPTIONAL
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   DGP-01: {{xref:DGP-01}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Event naming convention
   ●​ Event list (minimum 10)
   ●​ For each event:
         ○​ event_name
         ○​ description
         ○​ trigger
         ○​ actor
        ○​ required properties (name/type)
        ○​ optional properties (name/type)
        ○​ PII classification per property (none/low/high) (or policy label)
        ○​ sampling (if any)
        ○​ destinations (warehouse, product analytics, logs)
        ○​ linked metrics (metric_ids)
  ●​ Global required context properties (app_version, platform, user_id hash, etc.)


Optional Fields
  ●​ Event versioning/deprecations | OPTIONAL
  ●​ QA validation rules | OPTIONAL
  ●​ Open questions | OPTIONAL


Rules
  ●​    Property PII classification must align to DGP-01.
  ●​    Any user identifier must be hashed/pseudonymous unless explicitly allowed.
  ●​    Every metric that requires instrumentation must reference at least one event.
  ●​    Names must match DMG-04 convention where applicable.


Output Format
1) Global Context Properties (required)
prop_name        type     pii_clas                 notes
                              s

app_versio       string   none       {{context.app_version_notes}}
n

platform         string   none       {{context.platform_notes}}


2) Event Catalog (canonical)
even     des     trigg    acto    require     optiona     pii_cl    sampl     destin     linked    note
t_na     cript     er      r      d_prop      l_props     ass_n      ing      ations     _metri     s
 me       ion                        s                     otes                           c_ids

{{eve    {{ev    {{eve    {{eve   {{events    {{events    {{even    {{even    {{event    {{event   {{eve
nts[0    ents[   nts[0]   nts[0   [0].requi   [0].optio   ts[0].p   ts[0].s   s[0].de    s[0].m    nts[0
].na     0].de   .trigg   ].act   red_pro     nal_pro     ii_not    ampli     stinatio   etric_i   ].not
me}}     sc}}    er}}     or}}    ps}}        ps}}        es}}      ng}}      ns}}       ds}}      es}}
3) Deprecations (optional)
 old_event_name        replacement_event_         deprecated_on                reason
                              name

{{deprecations[0].ol   {{deprecations[0].new}   {{deprecations[0].dat   {{deprecations[0].reas
d}}                    }                        e}}                     on}}


4) QA Validation Rules (optional)

  ●​ {{qa_rules[0]}} | OPTIONAL

5) Open Questions (optional)

  ●​ {{open_questions[0]}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:SMIP-01}}, {{xref:DMG-04}} | OPTIONAL
  ●​ Downstream: {{xref:SMIP-03}}, {{xref:SMIP-04}} | OPTIONAL, {{xref:BI-*}} | OPTIONAL,
     {{xref:OBS-01}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. Define 10 events + core props; keep PII notes explicit.
  ●​ intermediate: Required. Link events to metrics and destinations.
  ●​ advanced: Required. Add sampling, deprecations, and QA validation rules.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: sampling, destinations, deprecations, qa_rules,
     open_questions
  ●​ If any required_prop has UNKNOWN pii_class → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.METRICS
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ events_count >= 10
○​   every_metric_has_event_mapping == true
○​   pii_classification_complete == true
○​   placeholder_resolution == true
○​   no_unapproved_unknowns == true
