SBDT-04
SBDT-04 — Scaling Model
(horizontal/vertical, bottlenecks, capacity
assumptions)
Header Block
   ●​ template_id: SBDT-04​

   ●​ title: Scaling Model (horizontal/vertical, bottlenecks, capacity assumptions)​

   ●​ type: service_boundaries_deployment_topology​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/topology/SBDT-04_Scaling_Model.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.TOPOLOGY​

   ●​ upstream_dependencies: ["SBDT-02", "PERF-02", "COST-01"]​

   ●​ inputs_required: ["SBDT-02", "PERF-02", "LOAD-01", "COST-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define the scaling strategy and capacity assumptions: how each major component scales, what
bottlenecks exist, what capacity targets are assumed, and what triggers scaling or
re-architecture decisions.


Inputs Required
   ●​ SBDT-02: {{xref:SBDT-02}} | OPTIONAL​
  ●​ PERF-02: {{xref:PERF-02}} | OPTIONAL​

  ●​ LOAD-01: {{xref:LOAD-01}} | OPTIONAL​

  ●​ COST-01: {{xref:COST-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Scaling assumptions:​

          ○​ peak concurrent users​

          ○​ request rate​

          ○​ message rate (if realtime)​

          ○​ storage growth​

  ●​ Component scaling plan (for each major component):​

          ○​ scaling axis (CPU/mem/instances/partitions)​

          ○​ horizontal vs vertical stance​

          ○​ known bottlenecks​

          ○​ caching strategy touchpoints​

          ○​ DB scaling posture (read replicas, sharding, etc.) (high level)​

  ●​ Trigger thresholds (what causes action)​

  ●​ Risks and mitigations (high level)​

  ●​ Monitoring requirements (what to watch)​



Optional Fields
   ●​ Future multi-region scaling notes | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ If applies == false, include 00_NA block only.​

   ●​ Assumptions must be explicitly stated; “unknown” must include a plan to measure.​

   ●​ Scaling triggers must be measurable (p95 latency, queue depth, CPU, error rate).​

   ●​ Bottlenecks must map to mitigation actions (cache, partition, queue, optimize).​



Output Format
1) Applicability

   ●​ applies: {{scale.applies}} (true/false)​

   ●​ 00_NA (if not applies): {{scale.na_block}} | OPTIONAL​



2) Capacity Assumptions (required if applies)

   ●​ Peak concurrent users: {{assumptions.concurrent_users}} | OPTIONAL​

   ●​ Peak RPS: {{assumptions.rps}} | OPTIONAL​

   ●​ Realtime msg rate: {{assumptions.msg_rate}} | OPTIONAL​

   ●​ Storage growth: {{assumptions.storage_growth}} | OPTIONAL​



3) Component Scaling Plan (required if applies)
compon      scaling_      strategy     bottlenecks      mitigations   triggers    monitoring
 ent_id       axis          (H/V)
{{compo     {{compon {{compone          {{component         {{component      {{compone      {{component
nents[0].   ents[0].ax nts[0].strat     s[0].bottlene       s[0].mitigatio   nts[0].trigg   s[0].monitori
id}}        is}}       egy}}            cks}}               ns}}             ers}}          ng}}


4) Trigger Thresholds (required if applies)
 trigger_         metric                threshold                    action                 owner
     id

trg_01      {{triggers[0].metric   {{triggers[0].threshol      {{triggers[0].action   {{triggers[0].owner
            }}                     d}}                         }}                     }}


5) Risks & Mitigations (required if applies)

   ●​ {{risks[0]}}​

   ●​ {{risks[1]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:SBDT-02}} | OPTIONAL, {{xref:PERF-02}} | OPTIONAL,
      {{xref:COST-01}} | OPTIONAL​

   ●​ Downstream: {{xref:PERF-05}} | OPTIONAL, {{xref:RELIA-02}} | OPTIONAL,
      {{xref:OPS-05}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Not required.​

   ●​ intermediate: Required if applies. Define assumptions + scaling table.​

   ●​ advanced: Required if applies. Add triggers and monitoring.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: assumption_values, future_multi_region_notes,
    notes​

 ●​ If applies == true and triggers are UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.TOPOLOGY​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ if_applies_then_scaling_plan_present == true​

        ○​ if_applies_then_triggers_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
