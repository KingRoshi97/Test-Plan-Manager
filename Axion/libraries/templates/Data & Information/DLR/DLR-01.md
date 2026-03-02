DLR-01
DLR-01 — Data Lifecycle States
(active/archived/deleted)
Header Block
   ●​ template_id: DLR-01​

   ●​ title: Data Lifecycle States (active/archived/deleted)​

   ●​ type: data_lifecycle_retention​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_lifecycle/DLR-01_Data_Lifecycle_States.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DLR​

   ●​ upstream_dependencies: ["DATA-01", "DGP-02", "BRP-01"]​

   ●​ inputs_required: ["DATA-01", "DGP-02", "BRP-01", "RISK-02", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical lifecycle states for persisted data (e.g., active → archived → deleted), what
each state means, and what system behaviors are allowed in each state. This enables
consistent soft-delete, archival, and retention enforcement.


Inputs Required
   ●​ DATA-01: {{xref:DATA-01}} | OPTIONAL​

   ●​ DGP-02: {{xref:DGP-02}} | OPTIONAL​

   ●​ BRP-01: {{xref:BRP-01}} | OPTIONAL​
  ●​ RISK-02: {{xref:RISK-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Lifecycle state set (minimum: active, archived, deleted)​

  ●​ State definitions (meaning and constraints)​

  ●​ State transition rules:​

         ○​ allowed transitions​

         ○​ disallowed transitions​

         ○​ who/what triggers transitions​

  ●​ Per-entity applicability:​

         ○​ which entities have lifecycle states​

         ○​ what field represents lifecycle (status, deleted_at, etc.)​

  ●​ Behavioral constraints per state:​

         ○​ readable? writable? searchable? reportable?​

  ●​ Verification checklist​



Optional Fields
  ●​ Additional states (pending, suspended) | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
   ●​ “Deleted” must define whether it is soft-delete vs hard-delete (pointer to DLR-03).​

   ●​ Archived data access must be explicitly defined (read-only vs hidden).​

   ●​ Search and reporting must respect lifecycle constraints.​

   ●​ Transitions must be auditable for sensitive entities.​



Output Format
1) States (required)
 state           meaning            allowed_access              constraints                 notes

activ     {{states.active.mean     {{states.active.acc    {{states.active.constra {{states.active.not
e         ing}}                    ess}}                  ints}}                  es}}

archi     {{states.archived.me {{states.archived.a        {{states.archived.cons {{states.archived.
ved       aning}}              ccess}}                    traints}}              notes}}

delet     {{states.deleted.me      {{states.deleted.ac    {{states.deleted.const   {{states.deleted.n
ed        aning}}                  cess}}                 raints}}                 otes}}


2) Transition Rules (required)
 fro      to    all            trigger                 audit_required                  notes
  m             ow
                ed

acti     arc tru       {{transitions.active_to_a   {{transitions.active_to_   {{transitions.active_to_
ve       hive e        rchived.trigger}}           archived.audit}}           archived.notes}}
         d

arc del         tru    {{transitions.archived_to {{transitions.archived_t     {{transitions.archived_t
hive ete        e      _deleted.trigger}}        o_deleted.audit}}            o_deleted.notes}}
d    d

del      acti   fals   n/a                         true                       not allowed
ete      ve     e
d


3) Entity Applicability (required)
  entity_id             has_lifecycle         lifecycle_field     allowed_states            notes
{{entities[0].id   {{entities[0].has_lifecy   {{entities[0].fiel   {{entities[0].stat   {{entities[0].note
}}                 cle}}                      d}}                  es}}                 s}}


4) Behavioral Constraints (required)

   ●​ Read rules by state: {{behavior.read_rules}}​

   ●​ Write rules by state: {{behavior.write_rules}}​

   ●​ Search rules by state: {{behavior.search_rules}}​

   ●​ Reporting rules by state: {{behavior.reporting_rules}} | OPTIONAL​



5) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:DATA-01}} | OPTIONAL, {{xref:DGP-02}} | OPTIONAL​

   ●​ Downstream: {{xref:DLR-02}}, {{xref:DLR-03}}, {{xref:SRCH-01}} | OPTIONAL,
      {{xref:RPT-03}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Required. State definitions + basic transitions.​

   ●​ intermediate: Required. Add entity applicability and behavioral constraints.​

   ●​ advanced: Required. Add audit requirements and lifecycle enforcement points.​
Unknown Handling
 ●​ UNKNOWN_ALLOWED: additional_states, notes​

 ●​ If entity applicability is UNKNOWN for lifecycle-managed entities → block Completeness
    Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.DLR​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ states_present == true​

        ○​ transitions_present == true​

        ○​ entity_applicability_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
