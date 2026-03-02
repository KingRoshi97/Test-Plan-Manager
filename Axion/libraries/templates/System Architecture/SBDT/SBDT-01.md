SBDT-01
SBDT-01 — Service Boundary Map
(responsibilities, ownership,
dependencies)
Header Block
   ●​ template_id: SBDT-01​

   ●​ title: Service Boundary Map (responsibilities, ownership, dependencies)​

   ●​ type: service_boundaries_deployment_topology​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/topology/SBDT-01_Service_Boundary_Map.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.TOPOLOGY​

   ●​ upstream_dependencies: ["ARC-01", "ARC-08", "RISK-03"]​

   ●​ inputs_required: ["ARC-01", "ARC-08", "RISK-03", "STK-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the service boundary decomposition: which runtime services/workers exist, what each
owns, how they depend on each other, and who is accountable. This is the enforceable
boundary map used to prevent “service sprawl” and unclear ownership.


Inputs Required
   ●​ ARC-01: {{xref:ARC-01}} | OPTIONAL​

   ●​ ARC-08: {{xref:ARC-08}} | OPTIONAL​
  ●​ RISK-03: {{xref:RISK-03}} | OPTIONAL​

  ●​ STK-01: {{xref:STK-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Service list (minimum 3 for non-trivial systems)​

  ●​ For each service:​

         ○​ service_id​

         ○​ name​

         ○​ service_type (api/service/worker/gateway/realtime)​

         ○​ owner_boundary_id (ARC-01)​

         ○​ responsibilities (bullets)​

         ○​ owns (data/entities/events)​

         ○​ exposes (APIs/topics/queues)​

         ○​ depends_on (other services + external deps)​

         ○​ trust zone (public/private/internal)​

         ○​ SLA criticality (P0/P1/P2)​

         ○​ primary failure modes (top 3)​

  ●​ Dependency directionality rules (no cycles unless justified)​

  ●​ Ownership policy (how ownership changes)​



Optional Fields
      ●​ Diagram pointer | OPTIONAL​

      ●​ Notes | OPTIONAL​



Rules
      ●​ Each owned entity/event must map back to a single boundary owner.​

      ●​ Each dependency must state purpose; “depends on X” without why is not allowed.​

      ●​ Any dependency cycle must be explicitly documented with mitigation.​

      ●​ Public exposure must be explicit (default private).​



Output Format
1) Services Registry (canonical)
 se     name       type       owner    owns      expose     depen     trust_    critic   failur    notes
 rvi                          _boun                 s       ds_on      zone     ality    e_mo
 ce                           dary_i                                                      des
  _i                            d
  d

 sv     {{servi   {{servi   {{servi    {{servi   {{servic   {{servi   {{servi   {{servi {{servi    {{servi
 c_     ces[0].   ces[0]    ces[0].    ces[0].   es[0].ex   ces[0].   ces[0].   ces[0] ces[0]      ces[0].
 01     name}     .type}}   owner}     owns}}    poses}}    deps}}    zone}}    .crit}} .fails}}   notes}}
        }                   }

 sv     {{servi   {{servi   {{servi    {{servi   {{servic   {{servi   {{servi   {{servi {{servi    {{servi
 c_     ces[1].   ces[1]    ces[1].    ces[1].   es[1].ex   ces[1].   ces[1].   ces[1] ces[1]      ces[1].
 02     name}     .type}}   owner}     owns}}    poses}}    deps}}    zone}}    .crit}} .fails}}   notes}}
        }                   }


2) Responsibility Blocks (required, one per service)

{{services[0].service_id}} — {{services[0].name}}

      ●​ Responsibilities:​
         ○​ {{services[0].responsibilities[0]}}​

         ○​ {{services[0].responsibilities[1]}} | OPTIONAL​

  ●​ Owns: {{services[0].owns}}​

  ●​ Exposes: {{services[0].exposes}}​

  ●​ Dependencies: {{services[0].deps}}​

  ●​ Failure modes: {{services[0].fails}}​



3) Dependency Rules (required)

  ●​ No-cycle policy: {{deps.no_cycle_policy}}​

  ●​ If cycle exists, required mitigations: {{deps.cycle_mitigations}} | OPTIONAL​

  ●​ External dependency policy: {{deps.external_policy}} | OPTIONAL​



4) Ownership Policy (required)

  ●​ Ownership assignment rule: {{ownership.assignment_rule}}​

  ●​ Ownership change process: {{ownership.change_process}}​



Cross-References
  ●​ Upstream: {{xref:ARC-01}} | OPTIONAL, {{xref:ARC-08}} | OPTIONAL​

  ●​ Downstream: {{xref:SBDT-02}}, {{xref:SBDT-05}} | OPTIONAL, {{xref:RELIA-01}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Services list with responsibilities and dependencies.​
 ●​ intermediate: Required. Add owns/exposes and criticality.​

 ●​ advanced: Required. Add failure modes and ownership policy.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: diagram_pointer, notes​

 ●​ If any service lacks owner_boundary_id → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.TOPOLOGY​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ services_count >= 3​

        ○​ every_service_has_owner == true​

        ○​ dependencies_defined == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
