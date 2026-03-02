ARC-08
ARC-08 — Deployment Topology
(services, environments, network
boundaries)
Header Block
   ●​ template_id: ARC-08​

   ●​ title: Deployment Topology (services, environments, network boundaries)​

   ●​ type: system_architecture​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/architecture/ARC-08_Deployment_Topology.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ARCH​

   ●​ upstream_dependencies: ["ARC-01", "SBDT-01", "OPS-01", "ENV-01"]​

   ●​ inputs_required: ["ARC-01", "SBDT-01", "SBDT-02", "SBDT-03", "OPS-01", "ENV-01",
      "SEC-02", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the system’s deployment topology: what runs where, what environments exist, how
network boundaries are segmented, and what isolation constraints apply. This is the
architecture-level deployment map; CI/CD details live in OPS/CICD.


Inputs Required
   ●​ ARC-01: {{xref:ARC-01}} | OPTIONAL​
  ●​ SBDT-01: {{xref:SBDT-01}} | OPTIONAL​

  ●​ SBDT-02: {{xref:SBDT-02}} | OPTIONAL​

  ●​ SBDT-03: {{xref:SBDT-03}} | OPTIONAL​

  ●​ OPS-01: {{xref:OPS-01}} | OPTIONAL​

  ●​ ENV-01: {{xref:ENV-01}} | OPTIONAL​

  ●​ SEC-02: {{xref:SEC-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Environments list (dev/stage/prod at minimum unless explicitly N/A)​

  ●​ Runtime components list (services, workers, DBs, queues, storage, gateways)​

  ●​ For each runtime component:​

         ○​ component_id​

         ○​ type (api/service/worker/db/queue/cache/storage/gateway)​

         ○​ owner boundary/service​

         ○​ environments deployed to​

         ○​ network zone (public/private/internal)​

         ○​ ingress/egress rules (high level)​

         ○​ secrets dependency (yes/no + pointer)​

         ○​ scaling notes (basic)​

         ○​ health checks/readiness expectations (high level)​

  ●​ Network boundary rules:​
         ○​ what is public​

         ○​ what is private​

         ○​ what can talk to what​

  ●​ Environment parity rules (what must match across envs)​

  ●​ Deployment safety constraints (migrations, rollouts, rollback posture)​



Optional Fields
  ●​ Multi-region notes | OPTIONAL​

  ●​ Blue/green or canary posture | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Public exposure must be explicit; default is private/internal.​

  ●​ Any component handling PII must be in approved zones and follow privacy constraints.​

  ●​ Environment names must match ENV-01 config matrix.​

  ●​ Deployment safety must reference migration/rollback policies (REL/BDR where
     applicable).​



Output Format
1) Environments (required)
env         purpose                 access               data_policy                notes

dev   {{envs.dev.purpose}      {{envs.dev.access}   {{envs.dev.data_policy}    {{envs.dev.notes}
      }                        }                    }                          }
stag {{envs.stage.purpos      {{envs.stage.acce       {{envs.stage.data_polic   {{envs.stage.note
e    e}}                      ss}}                    y}}                       s}}

pro    {{envs.prod.purpose    {{envs.prod.acces       {{envs.prod.data_policy {{envs.prod.notes
d      }}                     s}}                     }}                      }}


2) Runtime Components (canonical)
 co    type     owner      envs      netwo    ingress     egress    secrets_    scaling    health
 mp             _boun                rk_zo                             ref      _notes     _notes
 on             dary_i                 ne
 ent              d
 _id

cm {{comp {{comp          {{comp    {{comp    {{comp      {{comp    {{compo     {{comp     {{comp
p_a onents onents[        onents    onents    onents[     onents[   nents[0].   onents[    onents[
pi  [0].typ 0].own        [0].env   [0].zon   0].ingre    0].egre   secrets_r   0].scali   0].healt
    e}}     er}}          s}}       e}}       ss}}        ss}}      ef}}        ng}}       h}}


3) Network Boundaries (required)

   ●​ Public zone definition: {{network.public}}​

   ●​ Private/internal zone definition: {{network.private}}​

   ●​ Allowed communication matrix (high level): {{network.allowed_matrix}}​

   ●​ Deny-by-default rule: {{network.deny_by_default}}​



4) Environment Parity Rules (required)

   ●​ What must match (configs, versions, schemas): {{parity.must_match}}​

   ●​ Allowed differences: {{parity.allowed_differences}} | OPTIONAL​



5) Deployment Safety Constraints (required)

   ●​ Migration safety rule: {{safety.migrations}}​

   ●​ Rollout posture: {{safety.rollouts}} | OPTIONAL​
  ●​ Rollback posture: {{safety.rollback}}​

  ●​ Secrets rotation dependency: {{safety.secrets_rotation}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:SBDT-02}} | OPTIONAL, {{xref:SBDT-03}} | OPTIONAL, {{xref:ENV-01}}
     | OPTIONAL, {{xref:OPS-01}} | OPTIONAL​

  ●​ Downstream: {{xref:OPS-02}} | OPTIONAL, {{xref:CICD-}} | OPTIONAL, {{xref:REL-04}} |
     OPTIONAL, {{xref:BDR-}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Environments + runtime components + public/private separation.​

  ●​ intermediate: Required. Add ingress/egress rules and parity rules.​

  ●​ advanced: Required. Add deployment safety constraints and rollback posture.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: multi_region_notes, canary_posture, notes,
     scaling_notes, health_notes​

  ●​ If any public component lacks ingress rules → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.ARCH​

  ●​ Pass conditions:​
○​ required_fields_present == true​

○​ environments_present == true​

○​ runtime_components_present == true​

○​ network_boundaries_present == true​

○​ deployment_safety_present == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true​
