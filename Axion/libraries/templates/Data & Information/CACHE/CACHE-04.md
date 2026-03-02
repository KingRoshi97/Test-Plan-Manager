CACHE-04
CACHE-04 — Read/Write Split Rules (read
replicas, CQRS if used)
Header Block
   ●​ template_id: CACHE-04​

   ●​ title: Read/Write Split Rules (read replicas, CQRS if used)​

   ●​ type: caching_data_access_patterns​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/caching/CACHE-04_Read_Write_Split_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.CACHE​

   ●​ upstream_dependencies: ["DATA-07", "DATA-08", "SBDT-02"]​

   ●​ inputs_required: ["DATA-07", "DATA-08", "SBDT-02", "PERF-02",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define when and how the system splits reads and writes: use of read replicas, CQRS patterns,
read models, and consistency constraints. This ensures predictable behavior under replication
lag and prevents incorrect reads after writes.


Inputs Required
   ●​ DATA-07: {{xref:DATA-07}} | OPTIONAL​

   ●​ DATA-08: {{xref:DATA-08}} | OPTIONAL​

   ●​ SBDT-02: {{xref:SBDT-02}} | OPTIONAL​
  ●​ PERF-02: {{xref:PERF-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Read/write split stance (none/replicas/CQRS/hybrid)​

  ●​ Rules for routing:​

          ○​ what must go to primary​

          ○​ what may go to replicas​

          ○​ “read-your-writes” guarantees (if any)​

  ●​ Lag handling:​

          ○​ maximum tolerated replication lag​

          ○​ stale read behaviors​

          ○​ fallback to primary rules​

  ●​ CQRS rules (if used):​

          ○​ command model vs query model boundaries​

          ○​ projection update mechanism pointer (WFO/SRCH/CACHE)​

  ●​ Verification checklist​



Optional Fields
  ●​ Multi-region replication notes | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
   ●​ If applies == false, include 00_NA block only.​

   ●​ After write operations, critical reads must not use stale replicas unless explicitly allowed.​

   ●​ Lag must be monitored; define alert thresholds.​

   ●​ CQRS must specify projection freshness and failure posture.​



Output Format
1) Applicability

   ●​ applies: {{rw.applies}} (true/false)​

   ●​ 00_NA (if not applies): {{rw.na_block}} | OPTIONAL​



2) Stance (required if applies)

   ●​ Stance: {{rw.stance}} (none/replicas/cqrs/hybrid)​

   ●​ Why: {{rw.why}}​



3) Routing Rules (required if applies)

   ●​ Must use primary for: {{routing.primary_required}}​

   ●​ May use replicas for: {{routing.replica_allowed}}​

   ●​ Read-your-writes guarantee: {{routing.read_your_writes}} | OPTIONAL​



4) Lag Handling (required if applies)

   ●​ Max tolerated lag: {{lag.max}}​

   ●​ Behavior when lag exceeded: {{lag.behavior}}​
   ●​ Fallback rule: {{lag.fallback}} | OPTIONAL​



5) CQRS Rules (required if used)

   ●​ Boundaries: {{cqrs.boundaries}} | OPTIONAL​

   ●​ Projection mechanism pointer: {{cqrs.projection_pointer}} | OPTIONAL​

   ●​ Freshness target: {{cqrs.freshness}} | OPTIONAL​

   ●​ Failure posture: {{cqrs.failure}} | OPTIONAL​



6) Verification Checklist (required if applies)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:DATA-07}} | OPTIONAL, {{xref:SBDT-02}} | OPTIONAL​

   ●​ Downstream: {{xref:CACHE-03}} | OPTIONAL, {{xref:PERF-03}} | OPTIONAL,
      {{xref:OBS-04}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Not required.​

   ●​ intermediate: Required if applies. Stance + routing + lag policy.​

   ●​ advanced: Required if applies. Add CQRS boundaries and monitoring thresholds.​
Unknown Handling
 ●​ UNKNOWN_ALLOWED: multi_region_notes, notes, read_your_writes,
    cqrs_rules​

 ●​ If applies == true and max tolerated lag is UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.CACHE​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ if_applies_then_stance_present == true​

        ○​ if_applies_then_routing_rules_present == true​

        ○​ if_applies_then_lag_policy_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
