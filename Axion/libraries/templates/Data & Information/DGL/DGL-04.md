DGL-04
DGL-05 — Auditability Requirements
(what must be traceable)
Header Block
   ●​ template_id: DGL-05​

   ●​ title: Auditability Requirements (what must be traceable)​

   ●​ type: data_governance_lineage​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_governance/DGL-05_Auditability_Requirements.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DGL​

   ●​ upstream_dependencies: ["PMAD-06", "AUDIT-01", "DGL-04"]​

   ●​ inputs_required: ["PMAD-06", "AUDIT-01", "DGL-04", "DGP-01", "OBS-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define what data actions must be traceable end-to-end: create/update/delete, access, exports,
transformations, and administrative repairs. This consolidates audit requirements into a
concrete checklist and event catalog.


Inputs Required
   ●​ PMAD-06: {{xref:PMAD-06}} | OPTIONAL​

   ●​ AUDIT-01: {{xref:AUDIT-01}} | OPTIONAL​

   ●​ DGL-04: {{xref:DGL-04}} | OPTIONAL​
  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ OBS-01: {{xref:OBS-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Traceability event catalog (minimum 25 events)​

  ●​ For each event:​

         ○​ event_id​

         ○​ category (data_write/data_read/data_export/transform/admin_repair)​

         ○​ entity_id/dataset_id​

         ○​ action​

         ○​ who (actor types: user/service/admin)​

         ○​ required fields (resource identifiers, before/after pointers, reason_code)​

         ○​ redaction rules​

         ○​ retention window for audit record​

         ○​ access controls for audit viewing​

  ●​ Required trace linkage:​

         ○​ correlation_id / trace_id propagation rules​

  ●​ Verification checklist​



Optional Fields
  ●​ Evidence pack requirements for compliance audits | OPTIONAL​
     ●​ Notes | OPTIONAL​



Rules
     ●​ Any export and any privileged data repair must be auditable.​

     ●​ Before/after must be stored in a safe form (redacted) or as pointers to snapshots.​

     ●​ Audit logs must be tamper-evident or protected (system pointer).​

     ●​ Viewing audit logs is itself an auditable action.​



Output Format
1) Audit Event Catalog (canonical)
ev     categor    entity     action     actor_     requir    redacti    retentio    view_rol    notes
e         y       _or_d                 types      ed_fiel     on          n           es
nt                ataset                             ds
_i
d

au     {{events   {{event    {{event    {{event    {{event {{events     {{events    {{events[   {{event
d_     [0].cate   s[0].tar   s[0].act   s[0].act   s[0].fiel [0].reda   [0].reten   0].view_r   s[0].no
01     gory}}     get}}      ion}}      ors}}      ds}}      ction}}    tion}}      oles}}      tes}}

au     {{events   {{event    {{event    {{event    {{event {{events     {{events    {{events[   {{event
d_     [1].cate   s[1].tar   s[1].act   s[1].act   s[1].fiel [1].reda   [1].reten   1].view_r   s[1].no
02     gory}}     get}}      ion}}      ors}}      ds}}      ction}}    tion}}      oles}}      tes}}


2) Trace Linkage Rules (required)

     ●​ correlation_id required: {{trace.correlation_required}}​

     ●​ trace_id propagation: {{trace.propagation}}​

     ●​ async propagation: {{trace.async}} | OPTIONAL​



3) Verification Checklist (required)
  ●​ {{verify[0]}}​

  ●​ {{verify[1]}}​

  ●​ {{verify[2]}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:PMAD-06}} | OPTIONAL, {{xref:AUDIT-01}} | OPTIONAL,
     {{xref:DGL-04}} | OPTIONAL​

  ●​ Downstream: {{xref:COMP-02}} | OPTIONAL, {{xref:GOVOPS-05}} | OPTIONAL,
     {{xref:ADMIN-03}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Catalog with categories and required fields.​

  ●​ intermediate: Required. Add retention/view roles and trace linkage rules.​

  ●​ advanced: Required. Add evidence pack requirements and tamper-evidence pointers.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: evidence_pack_requirements, notes,
      async_propagation​

  ●​ If export events are missing from catalog → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DGL​
●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ events_count >= 25​

       ○​ export_and_admin_repairs_audited == true​

       ○​ trace_linkage_present == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true​
