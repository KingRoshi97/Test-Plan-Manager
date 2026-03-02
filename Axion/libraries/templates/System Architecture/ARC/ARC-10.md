ARC-10
ARC-10 — Architecture Constraints &
Invariants (must-hold rules + enforcement
points)
Header Block
   ●​ template_id: ARC-10​

   ●​ title: Architecture Constraints & Invariants (must-hold rules + enforcement points)​

   ●​ type: system_architecture​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/architecture/ARC-10_Architecture_Constraints_Invariants.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ARCH​

   ●​ upstream_dependencies: ["ARC-01", "DMG-03", "RISK-02", "SEC-02"]​

   ●​ inputs_required: ["ARC-01", "DMG-03", "RISK-02", "SEC-02", "APIG-02", "WFO-03",
      "ERR-05", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the architecture-level constraints and invariants that must always hold, regardless of
feature changes: boundary rules, data ownership rules, consistency expectations, security
constraints, and operational constraints. These act as hard guardrails for implementation and
review gates.


Inputs Required
   ●​ ARC-01: {{xref:ARC-01}} | OPTIONAL​
  ●​ DMG-03: {{xref:DMG-03}} | OPTIONAL​

  ●​ RISK-02: {{xref:RISK-02}} | OPTIONAL​

  ●​ SEC-02: {{xref:SEC-02}} | OPTIONAL​

  ●​ APIG-02: {{xref:APIG-02}} | OPTIONAL​

  ●​ WFO-03: {{xref:WFO-03}} | OPTIONAL​

  ●​ ERR-05: {{xref:ERR-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Constraint list (minimum 12 for non-trivial systems)​

  ●​ For each constraint:​

         ○​ con_id​

         ○​ statement (must/never)​

         ○​ category (boundary/data/security/ops/compat/perf)​

         ○​ scope (system/boundary/service)​

         ○​ enforcement_points (design review, code review, runtime, tests)​

         ○​ detection method (how we know it’s violated)​

         ○​ owner (role/team)​

         ○​ severity (hard/soft)​

         ○​ related docs (refs to ARC/APIG/WFO/ERR/etc.)​

  ●​ Exception policy (how to request exceptions + approvals)​



Optional Fields
    ●​ Examples (good/bad) | OPTIONAL​

    ●​ Notes | OPTIONAL​



Rules
    ●​ “Hard” constraints must have detection method + enforcement point.​

    ●​ Constraints must be non-redundant with DMG invariants; DMG are domain truths; ARC
       are architecture truths. If overlap exists, cross-reference and keep one authoritative.​

    ●​ Any exception must be time-bound and recorded (STK decision pointer).​



Output Format
1) Constraints Registry (canonical)
c stateme       categor     scope     enforce      detecti     owner      severit     relate     notes
o    nt            y                  ment_po      on_met                   y         d_refs
n                                       ints        hod
_
i
d

c   {{constr    {{constr    {{const   {{constrai   {{constr    {{constr   {{constr    {{cons     {{const
o   aints[0].   aints[0].   raints[   nts[0].enf   aints[0].   aints[0]   aints[0].   traints[   raints[
n   stateme     categor     0].scop   orcement     detectio    .owner}    severity    0].refs    0].note
_   nt}}        y}}         e}}       }}           n}}         }          }}          }}         s}}
0
1

c   {{constr    {{constr    {{const   {{constrai   {{constr    {{constr   {{constr    {{cons     {{const
o   aints[1].   aints[1].   raints[   nts[1].enf   aints[1].   aints[1]   aints[1].   traints[   raints[
n   stateme     categor     1].scop   orcement     detectio    .owner}    severity    1].refs    1].note
_   nt}}        y}}         e}}       }}           n}}         }          }}          }}         s}}
0
2


2) Hard Constraints Summary (required)
  ●​ {{derive:LIST_HARD_CONSTRAINTS(constraints)}} | OPTIONAL​



3) Exception Policy (required)

  ●​ When exceptions allowed: {{exceptions.when_allowed}}​

  ●​ Required justification fields: {{exceptions.fields}}​

  ●​ Approval required: {{exceptions.approval}}​

  ●​ Time-bound rule: {{exceptions.time_bound}}​

  ●​ Logging/decision pointer: {{exceptions.decision_pointer}} | OPTIONAL​



4) Examples (optional)

  ●​ Good example: {{examples.good}} | OPTIONAL​

  ●​ Bad example: {{examples.bad}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:ARC-01}} | OPTIONAL, {{xref:DMG-03}} | OPTIONAL, {{xref:RISK-02}} |
     OPTIONAL​

  ●​ Downstream: {{xref:APIG-04}} | OPTIONAL, {{xref:QA-05}} | OPTIONAL, {{xref:RELIA-*}}
     | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. 12 constraints with enforcement points.​

  ●​ intermediate: Required. Add detection methods and severity.​

  ●​ advanced: Required. Add exception policy and examples.​
Unknown Handling
 ●​ UNKNOWN_ALLOWED: examples, notes, decision_pointer​

 ●​ If any hard constraint lacks detection_method → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.ARCH​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ constraints_count >= 12​

        ○​ hard_constraints_have_detection == true​

        ○​ exception_policy_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
System Interfaces & Integration
Contracts (SIC)
●​ System Interfaces & Integration Contracts (SIC)​
   SIC-01 External Interface Inventory (systems, purpose, direction)​
   SIC-02 Contract Spec (per interface: requests/responses/events/auth/errors)​
   SIC-03 Webhook Contract Spec (producer/consumer, retries, signatures)​
   SIC-04 Data Mapping Contract (field mappings + transforms + validation)​
   SIC-05 Integration Failure Modes & Recovery (timeouts, retries, DLQ, fallbacks)​
   SIC-06 Vendor/Third-Party Trust Model (data sharing, scopes, audit needs)
