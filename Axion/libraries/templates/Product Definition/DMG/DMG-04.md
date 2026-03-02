DMG-04
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
Roadmap & Scope Control (RSC)
Roadmap & Scope Control (RSC)​
RSC-01 Release Roadmap (milestones)​
RSC-02 Scope Boundaries (in/out + rationale)​
RSC-03 Prioritization Framework (method + scoring)​
RSC-04 Change Control Policy (how scope changes)
