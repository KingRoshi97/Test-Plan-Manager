DMG-02
DMG-02 — Concept Model (entities +
relationships, narrative)
Header Block
   ●​   template_id: DMG-02
   ●​   title: Concept Model (entities + relationships, narrative)
   ●​   type: domain_model_glossary
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/domain/DMG-02_Concept_Model.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.DOMAIN
   ●​   upstream_dependencies: ["DMG-01", "PRD-04"]
   ●​   inputs_required: ["DMG-01", "PRD-04", "PRD-06", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Describe the domain concept model at a logical level: core entities, their responsibilities, and
how they relate—without committing to database schemas. This anchors DATA-01/02 and
ARC-02.


Inputs Required
   ●​   DMG-01: {{xref:DMG-01}}
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   PRD-06: {{xref:PRD-06}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL
   ●​   Existing model notes: {{inputs.model_notes}} | OPTIONAL


Required Fields
   ●​ Entity list (logical, 5–30)
   ●​ For each entity:
          ○​ entity_id
          ○​ name (matches glossary term where applicable)
          ○​ description
          ○​ key attributes (logical)
          ○​ key relationships (to other entities)
         ○​ lifecycle states (optional but preferred)
   ●​ Relationship list (with cardinality)
   ●​ Narrative walkthrough of 2–5 core workflows using entities


Optional Fields
   ●​ Bounded contexts / subdomains | OPTIONAL
   ●​ Derived events | OPTIONAL
   ●​ Open questions | OPTIONAL


Rules
   ●​     Logical model only: no DB column types, no migration details.
   ●​     Entity names should align with DMG-01 canonical terms.
   ●​     Relationships must include direction + cardinality (1:1, 1:N, N:M).
   ●​     If a workflow references an entity not defined, add it or mark UNKNOWN and block
          completeness.


Output Format
1) Entities (logical)
 entit          name              description           key_attributes          lifecycle_sta          notes
 y_id                                                                                tes

ent_0      {{entities[0].n     {{entities[0].descri    {{entities[0].attri      {{entities[0].st   {{entities[0].n
1          ame}}               ption}}                 butes}}                  ates}}             otes}}

ent_0      {{entities[1].n     {{entities[1].descri    {{entities[1].attri      {{entities[1].st   {{entities[1].n
2          ame}}               ption}}                 butes}}                  ates}}             otes}}


2) Relationships (logical)
 rel_id     from_entity_id         to_entity_id             cardinality                    description

rel_01      {{rels[0].from}}      {{rels[0].to}}      {{rels[0].cardinality}}        {{rels[0].description}}

rel_02      {{rels[1].from}}      {{rels[1].to}}      {{rels[1].cardinality}}        {{rels[1].description}}


3) Workflow Narratives (required)

wf_01 — {{workflows[0].name}}
  ●​ Steps:
         1.​ {{workflows[0].steps[0]}}
         2.​ {{workflows[0].steps[1]}}
  ●​ Entities involved: {{workflows[0].entity_ids}}
  ●​ Outputs/artifacts: {{workflows[0].outputs}} | OPTIONAL

4) Bounded Contexts (optional)

  ●​ {{bounded_contexts[0]}} | OPTIONAL

5) Open Questions (optional)

  ●​ {{open_questions[0]}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:DMG-01}}, {{xref:PRD-04}} | OPTIONAL
  ●​ Downstream: {{xref:DATA-01}}, {{xref:DATA-02}}, {{xref:ARC-02}}
  ●​ Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. Define entities + relationships; keep narratives short.
  ●​ intermediate: Required. Add lifecycle states and workflow narratives.
  ●​ advanced: Required. Add bounded contexts and clearer invariants linkage.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: lifecycle_states, bounded_contexts,
     derived_events, open_questions
  ●​ If any relationship references UNKNOWN entity → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DOMAIN
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ entities_count >= 5
        ○​ relationships_present == true
        ○​ workflows_count >= 2
        ○​ placeholder_resolution == true
           ○​ no_unapproved_unknowns == true



DMG-03 — Invariants & Definitions
(must-always-be-true rules)
Header Block
   ●​   template_id: DMG-03
   ●​   title: Invariants & Definitions (must-always-be-true rules)
   ●​   type: domain_model_glossary
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/domain/DMG-03_Invariants_Definitions.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.DOMAIN
   ●​   upstream_dependencies: ["DMG-02", "BRP-01"]
   ●​   inputs_required: ["DMG-02", "BRP-01", "PRD-06", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define the non-negotiable domain truths (invariants) and formal definitions that must hold
across all implementations. These rules anchor validation, database constraints, authorization,
and test assertions.


Inputs Required
   ●​   DMG-02: {{xref:DMG-02}}
   ●​   BRP-01: {{xref:BRP-01}} | OPTIONAL
   ●​   PRD-06: {{xref:PRD-06}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Invariants list (minimum 10 for non-trivial products)
   ●​ For each invariant:
          ○​ inv_id
          ○​ statement (must/never)
          ○​ scope (entity/relationship/system)
          ○​ related_entity_ids
          ○​ related_business_rule_ids (optional)
          ○​ enforcement points (API/DB/UI/ops)
          ○​ test strategy (how to verify)
          ○​ severity (hard/soft)
    ●​ Definitions list (if any must be formalized beyond glossary)


Optional Fields
    ●​ Exception cases | OPTIONAL
    ●​ Open questions | OPTIONAL


Rules
    ●​ Invariants must be testable (can be asserted).
    ●​ If an invariant conflicts with BRP rules, escalate to STK-02 decision.
    ●​ “Hard” invariants must declare at least one enforcement point and a test strategy.


Output Format
1) Invariants (canonical)
i    stateme     scope      entity_id     br_rule   enforcem     test_strat   severity    exceptio
n       nt                      s          _ids     ent_point       egy                      ns
v                                                       s
_
i
d

i   {{invarian   {{invari   {{invarian    {{invaria {{invariant {{invariant   {{invaria   {{invarian
n   ts[0].stat   ants[0].   ts[0].entit   nts[0].br s[0].enforc s[0].test_s   nts[0].se   ts[0].exce
v   ement}}      scope}}    y_ids}}       _ids}}    ement}}     trategy}}     verity}}    ptions}}
_
0
1

i   {{invarian   {{invari   {{invarian    {{invaria {{invariant {{invariant   {{invaria   {{invarian
n   ts[1].stat   ants[1].   ts[1].entit   nts[1].br s[1].enforc s[1].test_s   nts[1].se   ts[1].exce
v   ement}}      scope}}    y_ids}}       _ids}}    ement}}     trategy}}     verity}}    ptions}}
_
0
2


2) Formal Definitions (optional)
def_id        term_id          formal_definition            notes

def_01 {{defs[0].term_id}}   {{defs[0].definition}}   {{defs[0].notes}}


3) Open Questions (optional)

  ●​ {{open_questions[0]}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:DMG-02}}, {{xref:BRP-01}} | OPTIONAL
  ●​ Downstream: {{xref:DATA-03}}, {{xref:API-02}}, {{xref:QA-02}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. Capture 10 core invariants; simple enforcement points.
  ●​ intermediate: Required. Add test strategies and severity.
  ●​ advanced: Required. Tighten enforcement mapping to DB/API/UI and document
     exceptions.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: br_rule_ids, exceptions, formal_definitions,
     open_questions
  ●​ If severity == hard and enforcement_points is UNKNOWN → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DOMAIN
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ invariants_count >= 10
        ○​ hard_invariants_have_enforcement_and_tests == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
DMG-04 — Event Vocabulary (canonical
events/actions)
Header Block
   ●​   template_id: DMG-04
   ●​   title: Event Vocabulary (canonical events/actions)
   ●​   type: domain_model_glossary
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/domain/DMG-04_Event_Vocabulary.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.DOMAIN
   ●​   upstream_dependencies: ["DMG-02", "PRD-04"]
   ●​   inputs_required: ["DMG-02", "PRD-04", "BRP-01", "SMIP-02", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define the canonical event/action names used across analytics, audit logs, workflows,
notifications, and (if applicable) event-driven architecture. This prevents naming drift and
enables deterministic mapping (SMIP, OBS, AUDIT, EVT/WEBHOOKS).


Inputs Required
   ●​   DMG-02: {{xref:DMG-02}}
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   BRP-01: {{xref:BRP-01}} | OPTIONAL
   ●​   SMIP-02: {{xref:SMIP-02}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Event list (minimum 15 for non-trivial products)
   ●​ For each event:
         ○​ event_id
         ○​ event_name (canonical)
         ○​ trigger (what causes it)
         ○​ actor (who/what emits)
         ○​ related_entity_ids
         ○​ required properties (payload fields)
         ○​ optional properties
          ○​ consumers (who uses it: analytics/notifications/audit/etc.)
          ○​ retention/audit requirements (if any)
     ●​ Naming conventions for events


Optional Fields
     ●​ Versioning strategy | OPTIONAL
     ●​ Deprecations | OPTIONAL
     ●​ Open questions | OPTIONAL


Rules
     ●​ Event names must be stable and consistent (noun.verb or verb_noun—choose one
        and stick).
     ●​ If an event is used for analytics, it must align with SMIP-02 naming and property rules.
     ●​ If an event is used for audit/security, it must align with SEC/IAM audit requirements.
     ●​ Required properties must be concrete; if unknown, mark UNKNOWN and add open
        question.


Output Format
1) Naming Conventions (required)

     ●​ Convention: {{events.naming_convention}}
     ●​ Casing: {{events.casing}}
     ●​ Allowed namespaces (if any): {{events.namespaces}} | OPTIONAL

2) Event Catalog (canonical)
e      event_      trigger        actor     entity_id     required_    optional_p    consum       notes
v       name                                    s           props         rops         ers
e
nt
_i
d

e     {{event      {{events      {{event {{events.l       {{events.list {{events.list {{events.li {{event
v     s.list[0].   .list[0].tr   s.list[0]. ist[0].enti   [0].required [0].optional st[0].cons s.list[0].
_     name}}       igger}}       actor}} ty_ids}}         _props}}      _props}}      umers}}     notes}}
0
1
e     {{event      {{events      {{event {{events.l       {{events.list {{events.list {{events.li {{event
v     s.list[1].   .list[1].tr   s.list[1]. ist[1].enti   [1].required [1].optional st[1].cons s.list[1].
_     name}}       igger}}       actor}} ty_ids}}         _props}}      _props}}      umers}}     notes}}
0
2


3) Deprecations (optional)
    old_event_id          old_event_name          replacement_ev           reason         deprecated_o
                                                       ent_id                                  n

{{deprecations[0         {{deprecations[0].o      {{deprecations[0]    {{deprecations[0   {{deprecations[
].old_id}}               ld_name}}                .new_id}}            ].reason}}         0].date}}


4) Open Questions (optional)

    ●​ {{open_questions[0]}} | OPTIONAL


Cross-References
    ●​ Upstream: {{xref:DMG-02}}, {{xref:PRD-04}} | OPTIONAL
    ●​ Downstream: {{xref:SMIP-02}} | OPTIONAL, {{xref:OBS-}} | OPTIONAL, {{xref:MSG-}} |
       OPTIONAL, {{xref:API-02}} | OPTIONAL
    ●​ Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
       {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
    ●​ beginner: Required. Define core events and required properties at high level.
    ●​ intermediate: Required. Add consumers and align to SMIP-02.
    ●​ advanced: Required. Add deprecations/versioning strategy and tighter property
       definitions.


Unknown Handling
    ●​ UNKNOWN_ALLOWED: optional_props, consumers, notes,
       versioning_strategy, deprecations, open_questions
    ●​ If required_props is UNKNOWN for a high-impact event → block Completeness Gate.


Completeness Gate
●​ Gate ID: TMP-05.PRIMARY.DOMAIN
●​ Pass conditions:
      ○​ required_fields_present == true
      ○​ events_count >= 15 (or justified)
      ○​ event_names_follow_convention == true
      ○​ placeholder_resolution == true
      ○​ no_unapproved_unknowns == true
