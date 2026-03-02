PRD-08
PRD-08 — Open Questions Log
Header Block
   ●​ template_id: PRD-08
   ●​ title: Open Questions Log
   ●​ type: product_requirements
   ●​ template_version: 1.0.0
   ●​ output_path: 10_app/requirements/PRD-08_Open_Questions_Log.md
   ●​ compliance_gate_id: TMP-05.PRIMARY.PROD
   ●​ upstream_dependencies: ["PRD-01", "PRD-04", "PRD-06", "PRD-07"]
   ●​ inputs_required: ["PRD-01", "PRD-04", "PRD-06", "PRD-07", "SPEC_INDEX",
      "STANDARDS_INDEX"]
   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Maintain a single canonical backlog of unresolved product questions that block or affect scope,
design, architecture, security, testing, or release readiness. This prevents unknowns from being
scattered across documents and enables deterministic gating (“no critical unknowns”).


Inputs Required
   ●​   PRD-01: {{xref:PRD-01}}
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   PRD-06: {{xref:PRD-06}} | OPTIONAL
   ●​   PRD-07: {{xref:PRD-07}} | OPTIONAL
   ●​   SPEC_INDEX: {{spec.index}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Question list (can be 0, but must be explicit)
   ●​ For each question:
         ○​ question_id
         ○​ question
         ○​ category (scope/design/architecture/data/security/ops/legal/metrics)
         ○​ impact (P0 blocker / P1 important / P2 nice-to-have)
         ○​ affected feature_ids / domains / docs
                   ○​    owner
                   ○​    status (open/answered/deferred)
                   ○​    target_resolution_date (or UNKNOWN)
                   ○​    resolution (if answered) OR next_step (if open)


Optional Fields
     ●​ Evidence links / notes | OPTIONAL
     ●​ Decision log pointer | OPTIONAL
     ●​ Dependencies (who/what is needed) | OPTIONAL


Rules
     ●​    Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
     ●​    If any P0 blocker question is status=open, release gate must fail (downstream).
     ●​    Question IDs must be stable and unique (oq_01, oq_02… or oq_).
     ●​    If a question is “answered”, provide the resolution text and update affected docs list.
     ●​    Keep resolutions short; detailed answers belong in the relevant canonical doc and
           should be referenced.


Output Format
1) Open Questions Table (canonical)
 q        ques          categ     impa     affecte    affect    affec    owne     statu    target_    next_ste
 u        tion           ory       ct      d_feat     ed_do     ted_       r        s      resolut    p_or_res
 e                                         ure_id     mains     docs                       ion_da      olution
st                                            s                                               te
io
 n
_i
 d

o         {{que         {{quest   {{ques   {{questi   {{ques    {{que    {{que    {{que    {{questi   {{question
q         stion         ions[0]   tions[   ons[0].f   tions[0   stion    stions   stions   ons[0].t   s[0].next_
_         s[0].t        .categ    0].imp   eature_    ].doma    s[0].d   [0].ow   [0].st   arget_d    or_resolut
0         ext}}         ory}}     act}}    ids}}      ins}}     ocs}}    ner}}    atus}}   ate}}      ion}}
1

o         {{que         {{quest {{ques {{questi       {{ques    {{que    {{que    {{que    {{questi   {{question
q         stion         ions[1] tions[ ons[1].f       tions[1   stion    stions   stions   ons[1].t   s[1].next_
_
 0     s[1].t   .categ     1].imp   eature_   ].doma s[1].d   [1].ow    [1].st   arget_d   or_resolut
 2     ext}}    ory}}      act}}    ids}}     ins}}  ocs}}    ner}}     atus}}   ate}}     ion}}


2) P0 Blockers Summary (required)

List all open P0 questions (if any).

     ●​ {{derive:LIST_P0_OPEN_QUESTIONS(questions)}} | OPTIONAL

3) Recently Answered (optional)
     question_id           answered_on         resolution_summary                updated_docs

 {{answered[0].id}       {{answered[0].date   {{answered[0].resolutio    {{answered[0].updated_do
 }                       }}                   n}}                        cs}}


4) Notes (optional)

     ●​ {{notes[0]}} | OPTIONAL


Cross-References
     ●​ Upstream: {{xref:PRD-01}}, {{xref:PRD-04}}, {{xref:PRD-06}}, {{xref:PRD-07}} |
        OPTIONAL
     ●​ Downstream: {{xref:STK-02}} | OPTIONAL, {{xref:RISK-01}} | OPTIONAL, {{xref:REL-*}} |
        OPTIONAL
     ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
     ●​ beginner: Required. Owners and impacts may be coarse; keep list centralized.
     ●​ intermediate: Required. Add affected docs/domains; assign target dates where possible.
     ●​ advanced: Required. Maintain “answered” section with doc updates for traceability.


Unknown Handling
     ●​ UNKNOWN_ALLOWED: target_resolution_date, dependencies,
        evidence_links, notes
     ●​ If question.status == answered and resolution is UNKNOWN → block Completeness
        Gate.
Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.PROD
 ●​ Pass conditions:
       ○​ required_fields_present == true
       ○​ question_ids_unique == true
       ○​ answered_questions_have_resolution == true
       ○​ placeholder_resolution == true
       ○​ no_unapproved_unknowns == true
