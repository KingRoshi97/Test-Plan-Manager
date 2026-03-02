RSC-01
RSC-01 — Release Roadmap (milestones)
Header Block
   ●​   template_id: RSC-01
   ●​   title: Release Roadmap (milestones)
   ●​   type: roadmap_scope
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/roadmap/RSC-01_Release_Roadmap.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.ROADMAP
   ●​   upstream_dependencies: ["PRD-02", "PRD-04", "PRD-06"]
   ●​   inputs_required: ["PRD-02", "PRD-04", "PRD-06", "STK-04", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define the canonical release roadmap: milestones, scope slices, and target dates (or date
ranges). This is not a task plan; it is a product-level sequencing map that aligns stakeholders
and gates.


Inputs Required
   ●​   PRD-02: {{xref:PRD-02}} | OPTIONAL
   ●​   PRD-04: {{xref:PRD-04}}
   ●​   PRD-06: {{xref:PRD-06}} | OPTIONAL
   ●​   STK-04: {{xref:STK-04}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL
   ●​   Existing roadmap notes: {{inputs.roadmap_notes}} | OPTIONAL


Required Fields
   ●​ Roadmap horizon (e.g., MVP, next 90 days, 2–4 releases)
   ●​ Milestones list (minimum 3)
   ●​ For each milestone:
          ○​ milestone_id
          ○​ name
          ○​ objective
          ○​ target_date (or UNKNOWN)
          ○​ included feature_ids (or “TBD set” with rules)
         ○​ exit criteria (high level)
         ○​ dependencies (internal/external)
         ○​ stakeholders/approvers
   ●​ Risks to roadmap (top 3–10)


Optional Fields
   ●​ Confidence level per milestone | OPTIONAL
   ●​ Beta/RC phases | OPTIONAL
   ●​ Notes | OPTIONAL


Rules
   ●​   Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
   ●​   Milestones must reference existing feature IDs from PRD-04 where possible.
   ●​   Exit criteria must be measurable or tied to gates (QA/REL).
   ●​   Do not include implementation tasks; that belongs in IMP.


Output Format
1) Roadmap Overview

   ●​ Horizon: {{roadmap.horizon}}
   ●​ Cadence: {{roadmap.cadence}} | OPTIONAL
   ●​ Primary stakeholders: {{roadmap.stakeholders}} | OPTIONAL

2) Milestones (canonical)
 mil    name       objectiv    target    included    exit_crite   depende   approve    confiden
 est                  e        _date     _feature        ria       ncies     r_ids        ce
 on                                        _ids
 e_i
  d

ms      {{milest   {{milesto   {{miles   {{milesto   {{mileston {{mileston {{milesto   {{milesto
_0      ones[0]    nes[0].o    tones[    nes[0].fe   es[0].exit es[0].depe nes[0].a    nes[0].co
1       .name}     bjective}   0].date   ature_ids   _criteria}} ndencies}} pprovers   nfidence}
        }          }           }}        }}                                 }}         }

ms      {{milest   {{milesto   {{miles   {{milesto   {{mileston {{mileston {{milesto   {{milesto
_0      ones[1]    nes[1].o    tones[    nes[1].fe   es[1].exit es[1].depe nes[1].a    nes[1].co
2                                                    _criteria}} ndencies}}
     .name}   bjective}   1].date   ature_ids                       pprovers   nfidence}
     }        }           }}        }}                              }}         }


3) Roadmap Risks (required)

  ●​ {{roadmap.risks[0]}}
  ●​ {{roadmap.risks[1]}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:PRD-04}}, {{xref:PRD-06}} | OPTIONAL, {{xref:PRD-02}} | OPTIONAL
  ●​ Downstream: {{xref:IMP-01}} | OPTIONAL, {{xref:REL-*}} | OPTIONAL, {{xref:QA-04}} |
     OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. 3 milestones with objectives + feature IDs.
  ●​ intermediate: Required. Add exit criteria + dependencies.
  ●​ advanced: Required. Add confidence and approvals aligned to STK-04.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: target_date, confidence, notes, beta_phases
  ●​ If any milestone has UNKNOWN objective → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.ROADMAP
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ milestones_count >= 3
        ○​ milestones_have_objectives == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
