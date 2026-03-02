PRD-09
PRD-09 — Acceptance Criteria Catalog (by
Feature/Flow)
Header Block
   ●​ template_id: PRD-09
   ●​ title: Acceptance Criteria Catalog (by Feature/Flow)
   ●​ type: product_requirements
   ●​ template_version: 1.0.0
   ●​ output_path: 10_app/requirements/PRD-09_Acceptance_Criteria_Catalog.md
   ●​ compliance_gate_id: TMP-05.PRIMARY.REQ
   ●​ upstream_dependencies: ["PRD-04", "PRD-05", "PRD-06"]
   ●​ inputs_required: ["PRD-04", "PRD-05", "PRD-06", "SPEC_INDEX",
      "STANDARDS_INDEX"]
   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define the canonical acceptance criteria set that proves features are “done.” This catalog
anchors QA planning and test case generation while remaining product-level (not
implementation-level). Criteria are written in testable language and mapped to feature IDs and,
when available, flow IDs.


Inputs Required
   ●​   PRD-04: {{xref:PRD-04}}
   ●​   PRD-05: {{xref:PRD-05}} | OPTIONAL
   ●​   PRD-06: {{xref:PRD-06}} | OPTIONAL
   ●​   SPEC_INDEX: {{spec.index}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Acceptance criteria list (one or more per P0 feature)
   ●​ For each criterion:
         ○​ ac_id
         ○​ linked_feature_id
         ○​ linked_flow_id (or UNKNOWN)
          ○​ criterion statement (testable)
          ○​ type (functional / validation / error-handling / security / performance /
             accessibility)
          ○​ priority (P0/P1/P2)
          ○​ pass condition (what must be true)
          ○​ negative cases (at least one for P0 features)
    ●​ Coverage table: every P0 feature has >= 1 acceptance criterion


Optional Fields
    ●​ References to NFRs (nfr_id) | OPTIONAL
    ●​ References to business rules (br_id) | OPTIONAL
    ●​ Notes | OPTIONAL


Rules
    ●​ Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
    ●​ Criteria must be testable and unambiguous. Avoid “fast”, “easy”, “intuitive” unless
       quantified.
    ●​ For P0 features, include:
            ○​ at least one happy-path criterion
            ○​ at least one negative/edge criterion
    ●​ If a criterion depends on an NFR threshold, reference PRD-06 or nfr_id.
    ●​ Do not define UI layout; that belongs in DES templates. Reference screen IDs when
       needed.


Output Format
1) Acceptance Criteria Catalog (canonical)
a    feature_i   flow_id      type     priority   criterion    pass_con     negative_      refs
c        d                                                       dition       cases      (nfr/br/
_                                                                                        screen/
i                                                                                        endpoi
d                                                                                           nt)

a   {{accepta {{accept      {{accep {{accept      {{accept     {{acceptan {{acceptan {{accept
c   nce[0].fe ance[0].f     tance[0 ance[0].      ance[0].     ce[0].pass_ ce[0].negat ance[0].
_   ature_id}} low_id}}     ].type}} priority}}   criterion}   condition}} ive_cases}} refs}}
0                                                 }
0
1
a   {{accepta {{accept       {{accep {{accept         {{accept     {{acceptan {{acceptan {{accept
c   nce[1].fe ance[1].f      tance[1 ance[1].         ance[1].     ce[1].pass_ ce[1].negat ance[1].
_   ature_id}} low_id}}      ].type}} priority}}      criterion}   condition}} ive_cases}} refs}}
0                                                     }
0
2


2) P0 Feature Coverage (required)
    feature_id            feature_name        acceptance_          has_negative_ca     mapped_ac_i
                                                 count                   se                ds

{{spec.features_b     {{spec.features_by_ {{coverage[fe            {{coverage[feat_p   {{coverage[fea
y_id[feat_p0].id}}    id[feat_p0].name}}  at_p0].count}}           0].has_negative}}   t_p0].ac_ids}}


3) NFR-linked Criteria (optional)
         nfr_id                 related_ac_ids                      notes

{{nfr_links[0].nfr_id}}     {{nfr_links[0].ac_ids}}       {{nfr_links[0].notes}}


4) Notes (optional)

    ●​ {{notes[0]}} | OPTIONAL


Cross-References
    ●​ Upstream: {{xref:PRD-04}}, {{xref:PRD-05}} | OPTIONAL, {{xref:PRD-06}} | OPTIONAL
    ●​ Downstream: {{xref:QA-01}}, {{xref:QA-02}}, {{xref:DES-01}} | OPTIONAL,
       {{xref:DES-04}} | OPTIONAL
    ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
    ●​ beginner: Required. Ensure at least one criterion per P0 feature; flow_id may be
       UNKNOWN.
    ●​ intermediate: Required. Add pass_condition and negative cases for all P0 criteria.
    ●​ advanced: Required. Link criteria to NFRs and add clear refs for screens/endpoints
       where known.


Unknown Handling
 ●​ UNKNOWN_ALLOWED: flow_id, refs, nfr_links, notes
 ●​ If a P0 feature has zero acceptance criteria → block Completeness Gate.


Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.REQ
 ●​ Pass conditions:
       ○​ required_fields_present == true
       ○​ every_p0_feature_has_acceptance == true
       ○​ p0_acceptance_has_negative_cases == true
       ○​ placeholder_resolution == true
       ○​ no_unapproved_unknowns == true
User Research & Discovery (URD)
User Research & Discovery (URD)

●​ URD-01 Research Plan (questions, methods, sample)​

●​ URD-02 Findings Summary (themes + evidence)​

●​ URD-03 User Needs & Pain Points (ranked)​

●​ URD-04 Journey Map (current vs target)​

●​ URD-05 Validation Plan (what to test, how to measure)​
