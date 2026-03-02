SMIP-03
SMIP-03 — Funnel/Conversion Definitions
Header Block
   ●​   template_id: SMIP-03
   ●​   title: Funnel/Conversion Definitions
   ●​   type: success_metrics_instrumentation
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/metrics/SMIP-03_Funnel_Definitions.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.METRICS
   ●​   upstream_dependencies: ["SMIP-01", "SMIP-02"]
   ●​   inputs_required: ["SMIP-01", "SMIP-02", "PRD-04", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": false}


Purpose
Define the canonical funnels and conversion events used to measure product success. Funnels
must be linked to analytics events and have clear step definitions to prevent metric drift.


Inputs Required
   ●​   SMIP-01: {{xref:SMIP-01}}
   ●​   SMIP-02: {{xref:SMIP-02}}
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Funnel list (minimum 2)
   ●​ For each funnel:
         ○​ funnel_id
         ○​ name
         ○​ purpose
         ○​ audience/persona (optional)
         ○​ steps (ordered), each step references event_name(s)
         ○​ conversion definition (what counts)
         ○​ window (time window)
         ○​ segmentation rules (optional)
         ○​ linked metric_ids
            ○​ guardrails (optional)


Optional Fields
     ●​ Drop-off analysis notes | OPTIONAL
     ●​ Open questions | OPTIONAL


Rules
     ●​ Every funnel step must reference events defined in SMIP-02.
     ●​ Conversion must be measurable and unambiguous.
     ●​ Time window must be explicit.


Output Format
1) Funnel Catalog (canonical)
fu     name      purpos     steps     convers     windo      segme      linked_     guardra     notes
nn                 e                  ion_defi      w          nts      metric_i      ils
el                                     nition                              ds
_i
 d

fu     {{funn    {{funnel   {{funn    {{funnels   {{funnel   {{funnel   {{funnels   {{funnel    {{funn
n_     els[0].   s[0].pur   els[0].   [0].conv    s[0].win   s[0].seg   [0].metri   s[0].gua    els[0].
01     name}     pose}}     steps}    ersion}}    dow}}      ments}}    c_ids}}     rdrails}}   notes}
       }                    }                                                                   }


2) Open Questions (optional)

     ●​ {{open_questions[0]}} | OPTIONAL


Cross-References
     ●​ Upstream: {{xref:SMIP-01}}, {{xref:SMIP-02}}
     ●​ Downstream: {{xref:BI-}} | OPTIONAL, {{xref:EXPER-}} | OPTIONAL
     ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
     ●​ beginner: Required. Define 2 funnels with steps + window.
 ●​ intermediate: Required. Add linked metrics and segments.
 ●​ advanced: Not required. (Advanced experimentation lives in EXPER.)


Unknown Handling
 ●​ UNKNOWN_ALLOWED: segments, guardrails, notes, open_questions
 ●​ If any funnel step references unknown event → block Completeness Gate.


Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.METRICS
 ●​ Pass conditions:
       ○​ required_fields_present == true
       ○​ funnels_count >= 2
       ○​ all_steps_reference_known_events == true
       ○​ placeholder_resolution == true
       ○​ no_unapproved_unknowns == true
