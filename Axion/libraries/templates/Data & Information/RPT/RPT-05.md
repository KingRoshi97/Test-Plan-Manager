RPT-05
RPT-05 — Data Access & Permissions for
Reports
Header Block
   ●​ template_id: RPT-05​

   ●​ title: Data Access & Permissions for Reports​

   ●​ type: reporting_aggregations​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/reporting/RPT-05_Data_Access_Permissions_for_Reports.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.RPT​

   ●​ upstream_dependencies: ["RPT-01", "DGL-04", "PMAD-02"]​

   ●​ inputs_required: ["RPT-01", "DGL-04", "PMAD-02", "DGP-01", "ADMIN-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define reporting-specific permissions: who can view which dashboards, slices, and exports;
what row-level/tenant-level constraints apply; what redaction rules apply; and how report access
is audited.


Inputs Required
   ●​ RPT-01: {{xref:RPT-01}} | OPTIONAL​

   ●​ DGL-04: {{xref:DGL-04}} | OPTIONAL​

   ●​ PMAD-02: {{xref:PMAD-02}} | OPTIONAL​
  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ ADMIN-01: {{xref:ADMIN-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Report access matrix (minimum 20 entries)​

  ●​ For each entry:​

         ○​ rpt_surface_id (from RPT-01)​

         ○​ metric_id(s) visible​

         ○​ audience roles​

         ○​ row-level constraints (tenant/org/owner)​

         ○​ export allowed (yes/no)​

         ○​ export redaction rules (if allowed)​

         ○​ approval required (yes/no + who)​

         ○​ audit event requirement​

         ○​ anti-reidentification rule (small cohorts)​

  ●​ Global rules:​

         ○​ default deny for report access​

         ○​ minimum cohort size rules for breakdowns​

         ○​ export limits (rows/day, etc.)​

  ●​ Verification checklist​



Optional Fields
   ●​ External sharing rules | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Reporting access must align with PMAD/DGL access controls.​

   ●​ Exports of sensitive data require stricter approvals and redaction.​

   ●​ Small cohort breakdowns must be blocked or bucketed to prevent reidentification.​

   ●​ Access to report exports should be auditable.​



Output Format
1) Report Access Matrix (canonical)
 rpt_su    metric    roles   row_c     export   export_     approv    audit_   cohort   notes
 rface_i     s                onstr    _allow   redacti       al      event    _rules
    d                         aints      ed       on

{{matrix {{matrix {{matri {{matri     {{matri   {{matrix[   {{matrix[ {{matri {{matri   {{matri
[0].surf [0].metr x[0].rol x[0].ro    x[0].ex   0].redac    0].appro x[0].au x[0].co    x[0].no
ace}}    ics}}    es}}     ws}}       port}}    tion}}      val}}     dit}}   hort}}    tes}}

{{matrix {{matrix {{matri {{matri     {{matri   {{matrix[   {{matrix[ {{matri {{matri   {{matri
[1].surf [1].metr x[1].rol x[1].ro    x[1].ex   1].redac    1].appro x[1].au x[1].co    x[1].no
ace}}    ics}}    es}}     ws}}       port}}    tion}}      val}}     dit}}   hort}}    tes}}


2) Global Rules (required)

   ●​ Default deny: {{global.default_deny}}​

   ●​ Minimum cohort size: {{global.min_cohort_size}}​

   ●​ Export limits: {{global.export_limits}} | OPTIONAL​

   ●​ Bucketing/anonymization rules: {{global.bucketing}} | OPTIONAL​
3) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:RPT-01}} | OPTIONAL, {{xref:DGL-04}} | OPTIONAL, {{xref:PMAD-02}}
      | OPTIONAL​

   ●​ Downstream: {{xref:RPT-06}} | OPTIONAL, {{xref:COMP-02}} | OPTIONAL,
      {{xref:ADMIN-03}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
      {{standards.rules[STD-SECURITY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Required. Matrix + default deny + basic cohort rules.​

   ●​ intermediate: Required. Add export constraints and audit events.​

   ●​ advanced: Required. Add approvals and anti-reidentification rigor.​



Unknown Handling
   ●​ UNKNOWN_ALLOWED: external_sharing_rules, notes, export_limits​

   ●​ If any export_allowed == true lacks redaction and audit_event → block Completeness
      Gate.​



Completeness Gate
●​ Gate ID: TMP-05.PRIMARY.RPT​

●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ matrix_count >= 20​

       ○​ default_deny_present == true​

       ○​ export_rules_consistent == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true
