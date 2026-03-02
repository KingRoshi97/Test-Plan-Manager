DLR-06
DLR-06 — Data Minimization Rules
(collect/store only what’s needed)
Header Block
   ●​ template_id: DLR-06​

   ●​ title: Data Minimization Rules (collect/store only what’s needed)​

   ●​ type: data_lifecycle_retention​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_lifecycle/DLR-06_Data_Minimization_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DLR​

   ●​ upstream_dependencies: ["PRD-06", "DGP-01", "DGP-02"]​

   ●​ inputs_required: ["PRD-06", "DGP-01", "DGP-02", "FORM-01", "API-02",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define rules to minimize collected and stored data: which fields are necessary, which are
optional, when data should be avoided, and what alternatives exist. This reduces privacy risk
and storage cost while supporting product requirements.


Inputs Required
   ●​ PRD-06: {{xref:PRD-06}} | OPTIONAL​

   ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

   ●​ DGP-02: {{xref:DGP-02}} | OPTIONAL​
  ●​ FORM-01: {{xref:FORM-01}} | OPTIONAL​

  ●​ API-02: {{xref:API-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Minimization principles (explicit)​

  ●​ “Do not collect” list (fields/data types)​

  ●​ “Collect only when needed” list (conditional fields with triggers)​

  ●​ Required justification rules for high-PII fields​

  ●​ Storage minimization rules:​

          ○​ avoid duplication​

          ○​ store derived values only when needed​

          ○​ redact/trim logs​

  ●​ UX constraints:​

          ○​ optional fields must be optional in UX​

          ○​ explain why requested (copy pointer)​

  ●​ Verification checklist​



Optional Fields
  ●​ Field-level minimization matrix | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
   ●​ If a field is optional in product logic, it must not be required in forms.​

   ●​ High-PII fields require explicit business justification and retention policy.​

   ●​ Logs/telemetry must follow minimization; do not collect full payloads by default.​

   ●​ “Just in case” collection is disallowed.​



Output Format
1) Principles (required)

   ●​ {{principles[0]}}​

   ●​ {{principles[1]}}​

   ●​ {{principles[2]}} | OPTIONAL​



2) Do Not Collect (required)

   ●​ {{do_not_collect[0]}}​

   ●​ {{do_not_collect[1]}} | OPTIONAL​



3) Collect Only When Needed (required)
 field_or_data       collect_when             purpose          retention_pointer         notes

{{conditional[0].   {{conditional[0].    {{conditional[0].pu {{conditional[0].ret   {{conditional[0].
field}}             when}}               rpose}}             ention}}               notes}}


4) High-PII Justification Rules (required)

   ●​ Required justification fields: {{pii.justification_fields}}​

   ●​ Approval requirement: {{pii.approval}} | OPTIONAL​

   ●​ Required retention mapping: {{pii.retention_mapping}}​



5) Storage & Logging Minimization (required)
   ●​ Duplication avoidance: {{storage.dup_avoid}}​

   ●​ Derived storage policy: {{storage.derived_policy}} | OPTIONAL​

   ●​ Logging redaction rule: {{storage.logging_redaction}}​



6) UX Constraints (required)

   ●​ Optional in UX rule: {{ux.optional_rule}}​

   ●​ Explain-why copy pointer: {{xref:CDX-02}} | OPTIONAL​



7) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:DGP-01}} | OPTIONAL, {{xref:PRD-06}} | OPTIONAL​

   ●​ Downstream: {{xref:DLR-02}} | OPTIONAL, {{xref:DQV-03}} | OPTIONAL,
      {{xref:OBS-01}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Required. Principles + do-not-collect list.​

   ●​ intermediate: Required. Add conditional collection table and logging minimization.​

   ●​ advanced: Required. Add high-PII justification and approval mapping.​
Unknown Handling
 ●​ UNKNOWN_ALLOWED: field_level_matrix, notes, approval_requirement​

 ●​ If do-not-collect list is UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.DLR​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ principles_present == true​

        ○​ do_not_collect_present == true​

        ○​ verification_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
Data Governance & Lineage (DGL)
Data Governance & Lineage (DGL)​
DGL-01 Data Ownership Map (owner per entity/dataset)​
DGL-02 Lineage Map (sources → transforms → sinks)​
DGL-03 Transformation Rules Catalog (ETL/ELT, normalization)​
DGL-04 Access Controls for Data (who can read/write/export)​
DGL-05 Auditability Requirements (what must be traceable)​
DGL-06 Data Catalog / Dictionary (datasets, meaning, sensitivity)
