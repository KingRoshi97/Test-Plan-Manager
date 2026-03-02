ERR-01
ERR-01 — Error Taxonomy (classes,
categories, severity)
Header Block
   ●​ template_id: ERR-01​

   ●​ title: Error Taxonomy (classes, categories, severity)​

   ●​ type: error_model_reason_codes​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/errors/ERR-01_Error_Taxonomy.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ERRORS​

   ●​ upstream_dependencies: ["ARC-06", "BRP-01", "DES-07"]​

   ●​ inputs_required: ["ARC-06", "BRP-01", "DES-07", "CDX-04", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical error taxonomy used across the system: classes, categories, severities,
and the baseline handling expectations. This is the shared language for errors so APIs, jobs,
realtime, and UX map failures consistently.


Inputs Required
   ●​ ARC-06: {{xref:ARC-06}} | OPTIONAL​

   ●​ BRP-01: {{xref:BRP-01}} | OPTIONAL​

   ●​ DES-07: {{xref:DES-07}} | OPTIONAL​
  ●​ CDX-04: {{xref:CDX-04}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Error classes (minimum):​

         ○​ validation​

         ○​ domain_rule​

         ○​ authn/authz​

         ○​ dependency​

         ○​ conflict/concurrency​

         ○​ system_unknown​

  ●​ Category model (subclasses or tags) (e.g., input_missing, quota_exceeded)​

  ●​ Severity model (P0/P1/P2 or equivalent) and definitions​

  ●​ Default handling expectations per class:​

         ○​ typical UX surface (inline/toast/banner/modal)​

         ○​ retryability default (yes/no)​

         ○​ logging level (info/warn/error)​

  ●​ Cross-system consistency rule: same class means same handling posture​



Optional Fields
  ●​ Domain-specific category extensions | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
   ●​ Taxonomy must align with ARC-06; if conflict, ARC-06 is architecture-authoritative.​

   ●​ Every emitted error must map to exactly one class (primary) and may have
      categories/tags.​

   ●​ Severity is about impact, not “how scary the message looks.”​

   ●​ Default retryability must align to idempotency rules (ERR-05).​



Output Format
1) Classes (required)
 error_c    description       common_sour        default_surfac     default_retry       log_level
  lass                            ces                   e              ability

validatio {{classes.valid    {{classes.valida    {{classes.valida   {{classes.valid   {{classes.vali
n         ation.desc}}       tion.sources}}      tion.surface}}     ation.retry}}     dation.log}}

domain     {{classes.dom     {{classes.domai     {{classes.domai {{classes.dom        {{classes.do
_rule      ain.desc}}        n.sources}}         n.surface}}     ain.retry}}          main.log}}

authz      {{classes.auth    {{classes.authz.    {{classes.authz. {{classes.auth      {{classes.aut
           z.desc}}          sources}}           surface}}        z.retry}}           hz.log}}

depend     {{classes.dep     {{classes.depen {{classes.depe         {{classes.dep     {{classes.dep
ency       endency.desc      dency.sources}} ndency.surface         endency.retry}    endency.log}}
           }}                                }}                     }

conflict   {{classes.confl {{classes.confli      {{classes.confli   {{classes.confl   {{classes.con
           ict.desc}}      ct.sources}}          ct.surface}}       ict.retry}}       flict.log}}

system     {{classes.syst    {{classes.syste     {{classes.syste    {{classes.syst    {{classes.syst
_unkno     em.desc}}         m.sources}}         m.surface}}        em.retry}}        em.log}}
wn


2) Categories/Tags (required)
 category_id                meaning              applies_to_classes              examples

cat_input_mis    {{cats.input_missing.me        {{cats.input_missing.cl   {{cats.input_missing.exa
sing             aning}}                        asses}}                   mples}}
cat_quota_exc    {{cats.quota.meaning}}     {{cats.quota.classes}}      {{cats.quota.examples}}
eeded


3) Severity Model (required)
 severit     definition     example_impacts        owner_response
   y

P0         {{sev.p0.def}}   {{sev.p0.impacts}}    {{sev.p0.response}}

P1         {{sev.p1.def}}   {{sev.p1.impacts}}    {{sev.p1.response}}

P2         {{sev.p2.def}}   {{sev.p2.impacts}}    {{sev.p2.response}}


4) Consistency Rules (required)

   ●​ Single primary class rule: {{rules.single_primary_class}}​

   ●​ Tagging rule: {{rules.tagging}}​

   ●​ Handling consistency rule: {{rules.handling_consistency}}​



Cross-References
   ●​ Upstream: {{xref:ARC-06}} | OPTIONAL, {{xref:DES-07}} | OPTIONAL, {{xref:CDX-04}} |
      OPTIONAL​

   ●​ Downstream: {{xref:ERR-02}}, {{xref:ERR-03}}, {{xref:ERR-04}}, {{xref:ERR-05}},
      {{xref:ERR-06}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Required. Define classes and severity model.​

   ●​ intermediate: Required. Add categories and default handling expectations.​

   ●​ advanced: Required. Add explicit consistency rules and extensions policy.​
Unknown Handling
 ●​ UNKNOWN_ALLOWED: domain_extensions, notes, examples​

 ●​ If any class lacks default surface or retryability → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.ERRORS​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ classes_present == true​

        ○​ severity_model_present == true​

        ○​ default_handling_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
