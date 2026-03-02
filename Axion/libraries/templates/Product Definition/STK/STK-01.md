STK-01
STK-01 — Stakeholder Map (roles,
decision rights)
Header Block
   ●​   template_id: STK-01
   ●​   title: Stakeholder Map (roles, decision rights)
   ●​   type: stakeholders_governance
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/governance/STK-01_Stakeholder_Map.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.GOV
   ●​   upstream_dependencies: ["PRD-01", "PRD-02"]
   ●​   inputs_required: ["PRD-01", "PRD-02", "PRD-03", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define who the stakeholders are, what decisions they influence, and what authority they have.
This creates deterministic ownership and prevents approval ambiguity during design, build, and
release.


Inputs Required
   ●​   PRD-01: {{xref:PRD-01}}
   ●​   PRD-02: {{xref:PRD-02}} | OPTIONAL
   ●​   PRD-03: {{xref:PRD-03}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL
   ●​   Org context: {{inputs.org_context}} | OPTIONAL


Required Fields
   ●​ Stakeholder list (minimum 3 for non-trivial products)
   ●​ For each stakeholder:
         ○​ stakeholder_id
         ○​ name/role (title)
         ○​ domain/area of responsibility
         ○​ decision rights (what they can approve)
         ○​ communication channel
        ○​ availability / SLA for responses
  ●​ Decision areas list (product, design, architecture, security, data, release)
  ●​ Escalation path (if conflict)


Optional Fields
  ●​ External stakeholders | OPTIONAL
  ●​ Delegates / backups | OPTIONAL
  ●​ Notes | OPTIONAL


Rules
  ●​    Stakeholder IDs must be stable and unique (stk_<slug>).
  ●​    Decision rights must be written as explicit scopes (not vague “approves everything”).
  ●​    If any required decision area has no owner, mark UNKNOWN and block completeness.
  ●​    This doc defines “who decides,” STK-02 defines “what was decided.”


Output Format
1) Stakeholders (canonical)
stak      name_or        area       decision_rig      comms       respon       backup         notes
ehol        _title                      hts                       se_sla
der_i
  d

stk_0     {{stakeho    {{stakeh     {{stakeholder    {{stakehol   {{stakeh    {{stakehol   {{stakeho
1         lders[0].n   olders[0].   s[0].decision_   ders[0].co   olders[0]   ders[0].ba   lders[0].n
          ame}}        area}}       rights}}         mms}}        .sla}}      ckup}}       otes}}

stk_0     {{stakeho    {{stakeh     {{stakeholder    {{stakehol   {{stakeh    {{stakehol   {{stakeho
2         lders[1].n   olders[1].   s[1].decision_   ders[1].co   olders[1]   ders[1].ba   lders[1].n
          ame}}        area}}       rights}}         mms}}        .sla}}      ckup}}       otes}}


2) Decision Areas Coverage (required)
decision_a       primary_owner_stakehol          backup_stakeholder_i                 notes
   rea                   der_id                           d

product         {{coverage.product.owner}}      {{coverage.product.back       {{coverage.product.not
                                                up}}                          es}}
design       {{coverage.design.owner}}     {{coverage.design.back     {{coverage.design.note
                                           up}}                       s}}

architecture {{coverage.arch.owner}}       {{coverage.arch.backup}    {{coverage.arch.notes}
                                           }                          }

security     {{coverage.security.owner}}   {{coverage.security.back   {{coverage.security.not
                                           up}}                       es}}

data         {{coverage.data.owner}}       {{coverage.data.backup}    {{coverage.data.notes}
                                           }                          }

release      {{coverage.release.owner}}    {{coverage.release.back    {{coverage.release.not
                                           up}}                       es}}


3) Escalation Path (required)

  ●​ Escalation rule: {{escalation.rule}}
  ●​ Escalates to: {{escalation.to_stakeholder_id}}
  ●​ Time threshold: {{escalation.time_threshold}}

4) External Stakeholders (optional)

  ●​ {{external[0]}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:PRD-01}}, {{xref:PRD-02}} | OPTIONAL, {{xref:PRD-03}} | OPTIONAL
  ●​ Downstream: {{xref:STK-02}}, {{xref:STK-03}}, {{xref:STK-04}}
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. List stakeholders + decision rights + escalation.
  ●​ intermediate: Required. Add SLAs and backup owners.
  ●​ advanced: Required. Tighten decision scopes to match approval gates.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: backup, notes, external
  ●​ If any required decision_area has UNKNOWN owner → block Completeness Gate.
Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.GOV
 ●​ Pass conditions:
       ○​ required_fields_present == true
       ○​ stakeholders_count >= 3
       ○​ decision_area_coverage_complete == true
       ○​ escalation_path_present == true
       ○​ placeholder_resolution == true
       ○​ no_unapproved_unknowns == true
