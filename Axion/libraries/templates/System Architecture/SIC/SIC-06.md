SIC-06
SIC-06 — Vendor/Third-Party Trust Model
(data sharing, scopes, audit needs)
Header Block
   ●​ template_id: SIC-06​

   ●​ title: Vendor/Third-Party Trust Model (data sharing, scopes, audit needs)​

   ●​ type: system_interfaces_integration_contracts​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/integrations/SIC-06_Vendor_Trust_Model.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.INTEGRATION​

   ●​ upstream_dependencies: ["SIC-01", "ARC-07", "DGP-01", "COMP-05"]​

   ●​ inputs_required: ["SIC-01", "ARC-07", "DGP-01", "SEC-02", "COMP-05", "AUDIT-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define how we trust and govern third-party vendors: what data they can access, what
scopes/permissions apply, how we audit their access, and what compliance constraints exist.
This prevents accidental over-sharing and supports vendor risk management.


Inputs Required
   ●​ SIC-01: {{xref:SIC-01}} | OPTIONAL​

   ●​ ARC-07: {{xref:ARC-07}} | OPTIONAL​

   ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​
  ●​ SEC-02: {{xref:SEC-02}} | OPTIONAL​

  ●​ COMP-05: {{xref:COMP-05}} | OPTIONAL​

  ●​ AUDIT-01: {{xref:AUDIT-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Vendor list (from SIC-01) with trust tiers​

  ●​ For each vendor:​

         ○​ vendor_id (align to interface_id/ext_id)​

         ○​ trust tier (low/medium/high)​

         ○​ data access scope (categories + PII class)​

         ○​ auth scope model (OAuth scopes/keys/mTLS)​

         ○​ least-privilege constraints​

         ○​ audit requirements (events to log, retention, review cadence)​

         ○​ data retention/sharing rules​

         ○​ breach notification expectations (if known)​

         ○​ exit strategy (how to revoke and remove data)​

  ●​ Review cadence (access reviews, vendor reviews)​

  ●​ Compliance constraints summary (data residency, HIPAA/PCI/etc if applicable)​



Optional Fields
  ●​ Vendor scoring rubric | OPTIONAL​
     ●​ Contracts/SLA pointers | OPTIONAL​

     ●​ Notes | OPTIONAL​



Rules
     ●​ Least privilege is mandatory: no broad scopes without justification.​

     ●​ High-trust vendors still require auditability; trust does not remove logging.​

     ●​ Exit strategy must be defined for every vendor with data access.​

     ●​ Any high-PII sharing requires explicit approval and retention rules.​



Output Format
1) Trust Tiers (required)
     tier              meaning                  typical_controls               approval_required

low           {{tiers.low.meaning}}           {{tiers.low.controls}}       {{tiers.low.approval}}

medium        {{tiers.med.meaning}}           {{tiers.med.controls}}       {{tiers.med.approval}}

high          {{tiers.high.meaning}}          {{tiers.high.controls}}      {{tiers.high.approval}}


2) Vendor Trust Registry (canonical)
v      interfa     trus     data_s    pii_      auth_s    least_        audi    retent    exit     revie    note
e       ce_id      t_tie     cope     clas      copes     privile       t_re    ion_r     _str     w_ca      s
n                    r                 s                  ge_rul        quir     ules     ateg     denc
d                                                           es          eme                 y        e
o                                                                        nts
r
_i
d

v      {{vendo     {{ve     {{vend    {{ve     {{vendo    {{vend       {{ven    {{vend    {{ve     {{ven    {{ven
_      rs[0].int   ndor     ors[0].   ndor     rs[0].au   ors[0].l     dors[    ors[0].   ndor     dors[    dors[
0      erface_     s[0].t   data_s    s[0].    th_sco     east_p       0].au    retenti   s[0].    0].rev   0].no
1      id}}        ier}}    cope}}    pii}}    pes}}      riv}}        dit}}    on}}      exit}}   iew}}    tes}}
3) Review Cadence (required)

  ●​ Access review cadence: {{cadence.access_review}}​

  ●​ Vendor review cadence: {{cadence.vendor_review}}​

  ●​ Audit evidence required: {{cadence.evidence}} | OPTIONAL​



4) Compliance Constraints (required if any)

  ●​ Data residency constraints: {{compliance.data_residency}} | OPTIONAL​

  ●​ Regulated data constraints: {{compliance.regulated}} | OPTIONAL​

  ●​ Breach notification expectations: {{compliance.breach_notify}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:SIC-01}} | OPTIONAL, {{xref:DGP-01}} | OPTIONAL, {{xref:COMP-05}} |
     OPTIONAL​

  ●​ Downstream: {{xref:GOVOPS-}} | OPTIONAL, {{xref:COMP-02}} | OPTIONAL,
     {{xref:AUDIT-}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Vendor list + trust tier + data scope + exit strategy.​

  ●​ intermediate: Required. Add least privilege rules and audit requirements.​

  ●​ advanced: Required. Add review cadence and compliance constraints.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: breach_notification, contracts_pointers, notes,
    vendor_scoring_rubric​

 ●​ If exit_strategy is UNKNOWN for any vendor with data access → block Completeness
    Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.INTEGRATION​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ vendors_present == true​

        ○​ trust_tier_present == true​

        ○​ least_privilege_present == true​

        ○​ audit_requirements_present == true​

        ○​ exit_strategies_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
Service Boundaries & Deployment
Topology (SBDT)
●​ Service Boundaries & Deployment Topology (SBDT)​
   SBDT-01 Service Boundary Map (responsibilities, ownership, dependencies)​
   SBDT-02 Runtime Topology (services, workers, queues, storage, networks)​
   SBDT-03 Environment Topology (dev/stage/prod parity, isolation rules)​
   SBDT-04 Scaling Model (horizontal/vertical, bottlenecks, capacity assumptions)​
   SBDT-05 Resilience Topology (redundancy, failover, circuit boundaries)​
   SBDT-06 Deployment Constraints (rollouts, canary, migration safety)
