SRCH-04
SRCH-04 — Search Result Quality Rules
(relevance, freshness, dedupe)
Header Block
   ●​ template_id: SRCH-04​

   ●​ title: Search Result Quality Rules (relevance, freshness, dedupe)​

   ●​ type: search_indexing​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/search/SRCH-04_Search_Result_Quality_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.SRCH​

   ●​ upstream_dependencies: ["SRCH-02", "SRCH-03", "DISC-04"]​

   ●​ inputs_required: ["SRCH-02", "SRCH-03", "DISC-04", "PERF-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define the quality rules and guardrails for search results: relevance expectations, freshness
constraints, deduplication, pagination stability, and minimum quality thresholds. This makes
search quality measurable and prevents regressions.


Inputs Required
   ●​ SRCH-02: {{xref:SRCH-02}} | OPTIONAL​

   ●​ SRCH-03: {{xref:SRCH-03}} | OPTIONAL​

   ●​ DISC-04: {{xref:DISC-04}} | OPTIONAL​
  ●​ PERF-01: {{xref:PERF-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Quality dimensions:​

          ○​ relevance​

          ○​ freshness​

          ○​ dedupe​

          ○​ stability (no flicker)​

  ●​ Rules catalog (minimum 15 rules)​

  ●​ For each rule:​

          ○​ qrule_id​

          ○​ dimension​

          ○​ statement​

          ○​ metric/measurement method​

          ○​ threshold/target​

          ○​ failure action (alert/block release)​

          ○​ owner​

  ●​ Dedupe policy (what counts as duplicate)​

  ●​ Freshness policy per surface (time windows)​

  ●​ Verification checklist​
Optional Fields
   ●​ Human evaluation rubric | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ If applies == false, include 00_NA block only.​

   ●​ Every rule must be measurable with a metric or eval method.​

   ●​ Freshness rules must align with index update targets (SRCH-03).​

   ●​ Dedupe must be deterministic; define tie-breaker order.​



Output Format
1) Applicability

   ●​ applies: {{quality.applies}} (true/false)​

   ●​ 00_NA (if not applies): {{quality.na_block}} | OPTIONAL​



2) Quality Rules Catalog (canonical)
qrul   dimensi      stateme      measurem          threshold    failure_ac      owner         notes
e_id     on            nt           ent                             tion

q_0    {{rules[0]   {{rules[0]. {{rules[0].m   {{rules[0].thr   {{rules[0].   {{rules[0].   {{rules[0].
1      .dim}}       stmt}}      easure}}       eshold}}         action}}      owner}}       notes}}

q_0    {{rules[1]   {{rules[1]. {{rules[1].m   {{rules[1].thr   {{rules[1].   {{rules[1].   {{rules[1].
2      .dim}}       stmt}}      easure}}       eshold}}         action}}      owner}}       notes}}


3) Dedupe Policy (required if applies)

   ●​ Duplicate definition: {{dedupe.definition}}​
   ●​ Tie-breaker order: {{dedupe.tiebreaker}}​

   ●​ Scope (within page/within query): {{dedupe.scope}} | OPTIONAL​



4) Freshness Policy (required if applies)
       surface_id                 max_staleness                     notes

{{freshness[0].surface}}   {{freshness[0].max_staleness}}   {{freshness[0].notes}}


5) Verification Checklist (required if applies)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:SRCH-03}} | OPTIONAL, {{xref:DISC-04}} | OPTIONAL​

   ●​ Downstream: {{xref:SRCH-06}} | OPTIONAL, {{xref:QA-04}} | OPTIONAL, {{xref:ALRT-*}}
      | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Not required.​

   ●​ intermediate: Required if applies. Rules + dedupe + freshness per surface.​

   ●​ advanced: Required if applies. Add measurement methods and failure actions rigor.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: human_eval_rubric, notes, freshness_notes​

 ●​ If applies == true and thresholds are UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.SRCH​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ if_applies_then_rules_count >= 15​

        ○​ measurement_defined == true​

        ○​ thresholds_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
