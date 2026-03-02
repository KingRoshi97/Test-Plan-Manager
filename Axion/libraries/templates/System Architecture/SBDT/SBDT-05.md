SBDT-05
SBDT-05 — Resilience Topology
(redundancy, failover, circuit boundaries)
Header Block
   ●​ template_id: SBDT-05​

   ●​ title: Resilience Topology (redundancy, failover, circuit boundaries)​

   ●​ type: service_boundaries_deployment_topology​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/topology/SBDT-05_Resilience_Topology.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.TOPOLOGY​

   ●​ upstream_dependencies: ["SBDT-02", "RELIA-02", "SLO-01", "BDR-01"]​

   ●​ inputs_required: ["SBDT-02", "RELIA-02", "SLO-01", "BDR-01", "OBS-04",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define how resilience is achieved at the topology level: redundancy, failover posture, circuit
boundaries, graceful degradation, and recovery objectives. This is the architecture-to-operations
bridge for reliability.


Inputs Required
   ●​ SBDT-02: {{xref:SBDT-02}} | OPTIONAL​

   ●​ RELIA-02: {{xref:RELIA-02}} | OPTIONAL​

   ●​ SLO-01: {{xref:SLO-01}} | OPTIONAL​
  ●​ BDR-01: {{xref:BDR-01}} | OPTIONAL​

  ●​ OBS-04: {{xref:OBS-04}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Critical dependency inventory (DB, cache, queues, vendors)​

  ●​ For each critical dependency:​

          ○​ dependency_id​

          ○​ component_id​

          ○​ redundancy posture (none/single-AZ/multi-AZ/multi-region)​

          ○​ failover method (automatic/manual)​

          ○​ circuit breaker boundary (where trips)​

          ○​ degradation behavior (read-only, queue, cached, disabled feature)​

          ○​ RTO/RPO targets (if applicable)​

          ○​ monitoring/alerting requirement​

  ●​ Graceful degradation rules per user-facing area​

  ●​ Recovery playbook pointers​



Optional Fields
  ●​ Chaos testing plan pointer | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
   ●​ If applies == false, include 00_NA block only.​

   ●​ Every P0 critical dependency must have a degradation behavior defined.​

   ●​ Failover method must be explicit; “we’ll handle it” is not allowed.​

   ●​ Circuit breakers must have clear thresholds and reset policy (pointer ok).​



Output Format
1) Applicability

   ●​ applies: {{resilience.applies}} (true/false)​

   ●​ 00_NA (if not applies): {{resilience.na_block}} | OPTIONAL​



2) Critical Dependencies (canonical)
 depe    compone         redunda        failove   circuit    degradat     rto_rp     monitori   notes
 nden      nt_id           ncy              r     _boun      ion_beh         o         ng
 cy_id                                             dary        avior

dep_     {{deps[0].c    {{deps[0].   {{deps[      {{deps[    {{deps[0].   {{deps[    {{deps[0]. {{deps
01       omponent       redundan     0].failov    0].circu   degradati    0].rto_r   monitorin [0].not
         _id}}          cy}}         er}}         it}}       on}}         po}}       g}}        es}}


3) Degradation Rules (required if applies)
 user_area_or_f        dependency         degraded_mod user_message_p                recovery_conditi
     eature                                     e           ointer                         on

{{degrade[0].are       {{degrade[0].d     {{degrade[0].mo     {{degrade[0].msg       {{degrade[0].recov
a}}                    ep}}               de}}                _ptr}}                 ery}}


4) Recovery Playbooks (required if applies)

   ●​ DB recovery pointer: {{playbooks.db}} | OPTIONAL​
  ●​ Queue recovery pointer: {{playbooks.queue}} | OPTIONAL​

  ●​ Vendor outage pointer: {{playbooks.vendor}} | OPTIONAL​

  ●​ Incident process pointer: {{playbooks.incident}} | OPTIONAL​



5) Monitoring/Alerting Requirements (required if applies)

  ●​ Required alerts: {{alerts.required}}​

  ●​ Paging vs ticketing rules: {{alerts.paging_rules}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:RELIA-02}} | OPTIONAL, {{xref:SLO-01}} | OPTIONAL, {{xref:BDR-01}}
     | OPTIONAL​

  ●​ Downstream: {{xref:IRP-01}} | OPTIONAL, {{xref:RELIA-05}} | OPTIONAL,
     {{xref:LOAD-*}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Not required.​

  ●​ intermediate: Required if applies. Define dependencies + degradation behavior.​

  ●​ advanced: Required if applies. Add circuit boundaries and recovery pointers.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: chaos_testing_pointer, notes, rto_rpo (if not set yet
     but must be planned)​
 ●​ If applies == true and any P0 dependency lacks degradation_behavior → block
    Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.TOPOLOGY​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ if_applies_then_deps_present == true​

        ○​ if_applies_then_degradation_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
