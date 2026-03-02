SBDT-02
SBDT-02 — Runtime Topology (services,
workers, queues, storage, networks)
Header Block
   ●​ template_id: SBDT-02​

   ●​ title: Runtime Topology (services, workers, queues, storage, networks)​

   ●​ type: service_boundaries_deployment_topology​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/topology/SBDT-02_Runtime_Topology.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.TOPOLOGY​

   ●​ upstream_dependencies: ["SBDT-01", "ARC-08", "OPS-02"]​

   ●​ inputs_required: ["SBDT-01", "ARC-08", "OPS-02", "ENV-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the runtime topology: the concrete runtime components and how they connect (services,
workers, queues, caches, databases, storage, gateways) including network zones and data flow
direction.


Inputs Required
   ●​ SBDT-01: {{xref:SBDT-01}} | OPTIONAL​

   ●​ ARC-08: {{xref:ARC-08}} | OPTIONAL​

   ●​ OPS-02: {{xref:OPS-02}} | OPTIONAL​
  ●​ ENV-01: {{xref:ENV-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Component inventory (minimum: api, db, storage; plus queues/workers if used)​

  ●​ For each component:​

          ○​ component_id​

          ○​ type​

          ○​ owner_service_id​

          ○​ network_zone (public/private/internal)​

          ○​ communicates_with (list)​

          ○​ protocols (http/ws/grpc/queue)​

          ○​ data stores accessed (if any)​

          ○​ secrets dependency pointer​

          ○​ scaling model (basic)​

  ●​ Network segmentation rules (allowed paths)​

  ●​ Data flow table (major flows)​

  ●​ Health/readiness expectations (high level)​

  ●​ “Single points of failure” list (if any) and mitigation pointer​



Optional Fields
  ●​ Diagram pointer | OPTIONAL​
  ●​ Notes | OPTIONAL​



Rules
  ●​ All communications must be declared; undeclared connections are disallowed.​

  ●​ Public ingress must be through explicit gateways/edges.​

  ●​ Secrets are never embedded; reference secrets management.​

  ●​ Any SPOF must have a mitigation plan or documented acceptance.​



Output Format
1) Component Inventory (canonical)
 co   type      owner     zone      comm     protoc     datast     secret    scalin    health    notes
 m              _servi              unicat     ols       ores       s_ref      g       _note
 po             ce_id               es_wit                                               s
 ne                                   h
 nt
 _i
  d

cm    {{com     {{com     {{com     {{comp   {{comp     {{comp     {{com     {{comp    {{com     {{com
p_    pone      ponen     ponen     onents   onents[    onents[    ponent    onents    ponen     ponen
01    nts[0].   ts[0].o   ts[0].z   [0].co   0].proto   0].data    s[0].se   [0].sca   ts[0].h   ts[0].n
      type}}    wner}}    one}}     mms}}    cols}}     stores}}   crets}}   ling}}    ealth}}   otes}}


2) Network Segmentation Rules (required)

  ●​ Allowed ingress paths: {{network.ingress}}​

  ●​ Allowed egress paths: {{network.egress}}​

  ●​ Deny-by-default: {{network.deny_default}}​



3) Major Data Flows (required)
flow_i   source_comp        dest_compo            protocol         data_categor          notes
   d        onent               nent                                    y

flow_    {{flows[0].src}}   {{flows[0].dst}   {{flows[0].protoco   {{flows[0].data   {{flows[0].note
01                          }                 l}}                  }}                s}}


4) Health/Readiness Expectations (required)

  ●​ Readiness checks required: {{health.readiness}}​

  ●​ Liveness checks required: {{health.liveness}} | OPTIONAL​

  ●​ Dependency health propagation: {{health.dependency_propagation}} | OPTIONAL​



5) SPOFs (required if any)
spof_i      component_id            why_spof              mitigation             accepted_by
  d

spof_    {{spofs[0].componen     {{spofs[0].why}     {{spofs[0].mitigation   {{spofs[0].accepted_b
01       t}}                     }                   }}                      y}}


Cross-References
  ●​ Upstream: {{xref:SBDT-01}} | OPTIONAL, {{xref:ARC-08}} | OPTIONAL​

  ●​ Downstream: {{xref:SBDT-05}} | OPTIONAL, {{xref:RELIA-02}} | OPTIONAL,
     {{xref:OPS-05}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Inventory + zones + major flows.​

  ●​ intermediate: Required. Add segmentation rules and health expectations.​

  ●​ advanced: Required. Add SPOFs list and mitigation pointers.​
Unknown Handling
 ●​ UNKNOWN_ALLOWED: diagram_pointer, notes, spofs (if none, explicitly state
    none)​

 ●​ If any public component lacks defined ingress path → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.TOPOLOGY​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ component_inventory_present == true​

        ○​ segmentation_rules_present == true​

        ○​ major_flows_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
