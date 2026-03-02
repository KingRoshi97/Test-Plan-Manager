RSC-02
RSC-02 — Scope Boundaries (in/out +
rationale)
Header Block
   ●​   template_id: RSC-02
   ●​   title: Scope Boundaries (in/out + rationale)
   ●​   type: roadmap_scope
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/roadmap/RSC-02_Scope_Boundaries.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.SCOPE
   ●​   upstream_dependencies: ["PRD-01", "PRD-04"]
   ●​   inputs_required: ["PRD-01", "PRD-04", "STK-02", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Lock the explicit boundaries of what is in-scope vs out-of-scope for the current build phase, with
rationale. This prevents scope creep and serves as a gating reference for change control.


Inputs Required
   ●​   PRD-01: {{xref:PRD-01}}
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   STK-02: {{xref:STK-02}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​   Current phase label (MVP/Release 1/etc.)
   ●​   In-scope list (minimum 10 statements OR all P0 features)
   ●​   Out-of-scope list (minimum 10 statements)
   ●​   Rationale per item (brief)
   ●​   Boundary rules (how to interpret ambiguous cases)
   ●​   Escalation path (who decides) (links to STK)


Optional Fields
  ●​ Future scope (later) | OPTIONAL
  ●​ Known trade-offs | OPTIONAL
  ●​ Open questions | OPTIONAL


Rules
  ●​ “In-scope” can be features, capabilities, platforms, or constraints—must be explicit.
  ●​ If using feature IDs, reference PRD-04 only.
  ●​ Out-of-scope items must be specific enough to be testable.


Output Format
1) Phase

  ●​ Phase: {{scope.phase}}
  ●​ Definition: {{scope.phase_definition}} | OPTIONAL

2) In-Scope (required)
scope         statement                  type                  rationale           references
 _id                            (feature/capability/pl
                                       atform)

in_01     {{in_scope[0].state   {{in_scope[0].type}}      {{in_scope[0].ration   {{in_scope[0].re
          ment}}                                          ale}}                  fs}}

in_02     {{in_scope[1].state   {{in_scope[1].type}}      {{in_scope[1].ration   {{in_scope[1].re
          ment}}                                          ale}}                  fs}}


3) Out-of-Scope (required)
 scope_            statement                  rationale                    revisit_trigger
   id

out_01     {{out_scope[0].statement   {{out_scope[0].rationale} {{out_scope[0].revisit_trigger}
           }}                         }                         }

out_02     {{out_scope[1].statement   {{out_scope[1].rationale} {{out_scope[1].revisit_trigger}
           }}                         }                         }


4) Boundary Rules (required)

  ●​ {{boundary_rules[0]}}
  ●​ {{boundary_rules[1]}} | OPTIONAL
5) Escalation / Decision Path (required)

  ●​ Owner: {{scope.owner_stakeholder_id}}
  ●​ Approver: {{scope.approver_stakeholder_id}} | OPTIONAL
  ●​ Decision log: {{xref:STK-02}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:PRD-01}}, {{xref:PRD-04}} | OPTIONAL
  ●​ Downstream: {{xref:RSC-04}}, {{xref:IMP-01}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. Clear in/out lists + owner.
  ●​ intermediate: Required. Add boundary rules + revisit triggers.
  ●​ advanced: Required. Add trade-offs and references.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: future_scope, tradeoffs, open_questions,
     references
  ●​ If owner_stakeholder_id is UNKNOWN → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.SCOPE
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ in_scope_present == true
        ○​ out_scope_present == true
        ○​ boundary_rules_present == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
