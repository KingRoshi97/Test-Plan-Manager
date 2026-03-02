SBDT-03
SBDT-03 — Environment Topology
(dev/stage/prod parity, isolation rules)
Header Block
   ●​ template_id: SBDT-03​

   ●​ title: Environment Topology (dev/stage/prod parity, isolation rules)​

   ●​ type: service_boundaries_deployment_topology​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/topology/SBDT-03_Environment_Topology.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.TOPOLOGY​

   ●​ upstream_dependencies: ["ARC-08", "ENV-01", "OPS-01"]​

   ●​ inputs_required: ["ARC-08", "ENV-01", "OPS-01", "DGP-01", "SEC-02",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define how environments are structured and isolated (dev/stage/prod), what parity guarantees
exist, how data is handled in each environment, and what isolation/network rules apply. This
ensures safe testing without contaminating production data or credentials.


Inputs Required
   ●​ ARC-08: {{xref:ARC-08}} | OPTIONAL​

   ●​ ENV-01: {{xref:ENV-01}} | OPTIONAL​

   ●​ OPS-01: {{xref:OPS-01}} | OPTIONAL​
  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ SEC-02: {{xref:SEC-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Environment list (dev/stage/prod at minimum unless explicitly N/A)​

  ●​ For each environment:​

         ○​ env_id​

         ○​ purpose​

         ○​ access policy (who can access)​

         ○​ data policy (synthetic vs real, PII rules)​

         ○​ secrets policy (separate keys, rotation expectations)​

         ○​ service parity expectations (what must match prod)​

         ○​ isolation rules (network, accounts, DB separation)​

         ○​ integrations policy (real vendors vs sandbox)​

         ○​ observability policy (retention/sampling)​

  ●​ Promotion rules (dev → stage → prod) (high level)​

  ●​ “No prod data in non-prod” rule (explicit) (or exception policy)​



Optional Fields
  ●​ Preview environments (per PR) | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
    ●​ Environments must use different secrets; no shared production credentials.​

    ●​ Production data must not be copied to lower environments unless sanitized and
       approved.​

    ●​ Sandbox integrations must be used in non-prod by default.​

    ●​ Parity must cover critical configs and schema versions.​



Output Format
1) Environment Matrix (canonical)
e    purpos     access    data_     secrets    parity_   isolatio     integrati     obs_p    notes
n      e        _policy   policy    _policy    expect    n_rules      ons_poli       olicy
v                                              ations                    cy
_
i
d

d    {{envs.d {{envs.     {{envs.   {{envs.d {{envs.     {{envs.d     {{envs.de     {{envs   {{envs.
e    ev.purpo dev.acc     dev.da    ev.secr dev.par      ev.isolati   v.integrati   .dev.o   dev.not
v    se}}     ess}}       ta}}      ets}}    ity}}       on}}         ons}}         bs}}     es}}

s    {{envs.s   {{envs.   {{envs.   {{envs.s   {{envs.   {{envs.st    {{envs.sta    {{envs {{envs.
t    tage.pur   stage.a   stage.    tage.se    stage.p   age.isol     ge.integra    .stage. stage.n
a    pose}}     ccess}}   data}}    crets}}    arity}}   ation}}      tions}}       obs}}   otes}}
g
e

p    {{envs.p   {{envs.   {{envs.   {{envs.p {{envs. {{envs.pr {{envs.pr            {{envs   {{envs.
r    rod.purp   prod.ac   prod.d    rod.secr prod.pa od.isolati od.integra          .prod.   prod.n
o    ose}}      cess}}    ata}}     ets}}    rity}}  on}}       tions}}             obs}}    otes}}
d


2) Promotion Rules (required)

    ●​ Dev → Stage rule: {{promotion.dev_to_stage}}​

    ●​ Stage → Prod rule: {{promotion.stage_to_prod}}​
  ●​ Approval gates: {{promotion.approvals}} | OPTIONAL​



3) Data Handling Rules (required)

  ●​ No prod data in non-prod: {{data.no_prod_in_nonprod}}​

  ●​ Sanitization requirement (if any copy): {{data.sanitization}} | OPTIONAL​

  ●​ Exception policy: {{data.exception_policy}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:ENV-01}} | OPTIONAL, {{xref:ARC-08}} | OPTIONAL​

  ●​ Downstream: {{xref:OPS-04}} | OPTIONAL, {{xref:CICD-}} | OPTIONAL, {{xref:BDR-}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Matrix with data + secrets separation rules.​

  ●​ intermediate: Required. Add parity and integration sandbox rules.​

  ●​ advanced: Required. Add promotion gates and explicit exception policies.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: preview_envs, notes, obs_policy_details,
     promotion.approvals​

  ●​ If secrets_policy is UNKNOWN for any environment → block Completeness Gate.​
Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.TOPOLOGY​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ environment_matrix_present == true​

        ○​ secrets_separation_defined == true​

        ○​ data_policy_defined == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
