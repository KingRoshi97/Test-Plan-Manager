IAN-5
IAN-05 — Access-Gated Navigation Rules
(role-based visibility)
Header Block
   ●​ template_id: IAN-05​

   ●​ title: Access-Gated Navigation Rules (role-based visibility)​

   ●​ type: information_architecture_navigation​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/ia/IAN-05_Access_Gated_Navigation_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.IAN​

   ●​ upstream_dependencies: ["IAN-01", "PRD-03", "BRP-02", "IAM-03"]​

   ●​ inputs_required: ["IAN-01", "PRD-03", "BRP-02", "IAM-03", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define deterministic rules for how navigation behaves when access is restricted: what is hidden
vs disabled, how upsells or explanations are shown, and what happens if a user deep-links into
restricted content. This prevents inconsistent access handling across the product.


Inputs Required
   ●​ IAN-01: {{xref:IAN-01}} | OPTIONAL​

   ●​ PRD-03: {{xref:PRD-03}} | OPTIONAL​

   ●​ BRP-02: {{xref:BRP-02}} | OPTIONAL​
  ●​ IAM-03: {{xref:IAM-03}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Access gating display modes:​

         ○​ hide​

         ○​ disable (show but inactive)​

         ○​ show-with-upsell (if monetized)​

         ○​ show-with-request-access (if applicable)​

  ●​ Deterministic rule table for which mode applies by nav surface type:​

         ○​ primary nav​

         ○​ secondary nav​

         ○​ contextual links​

         ○​ deep links​

  ●​ Deep link restricted behavior:​

         ○​ redirect target​

         ○​ explanation UI​

         ○​ logging/telemetry requirement​

  ●​ Copy requirements pointer (CDX) for access messages​

  ●​ Security requirement: avoid leaking details of restricted resources​



Optional Fields
  ●​ Org-level policies (enterprise access) | OPTIONAL​

  ●​ Audit trail needs | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Must not invent roles or entitlements; use PRD-03/BRP-02/IAM.​

  ●​ Deep links must be safe by default: no partial rendering of restricted data.​

  ●​ If showing disabled items, there must be an accessible explanation (tooltip/help text) and
     a deterministic action if any (upgrade/request).​

  ●​ If upsell exists, it must be consistent with pricing policy (BRP-03 / REVOPS).​



Output Format
1) Gating Modes (required)
  mode          description       user_experienc          when_used                  notes
                                        e

hide          {{modes.hide.des    {{modes.hide.ux}    {{modes.hide.when {{modes.hide.note
              c}}                 }                   }}                s}}

disable       {{modes.disable.d   {{modes.disable.    {{modes.disable.w     {{modes.disable.n
              esc}}               ux}}                hen}}                 otes}}

upsell        {{modes.upsell.de   {{modes.upsell.u    {{modes.upsell.wh     {{modes.upsell.not
              sc}}                x}}                 en}}                  es}}

request_ac {{modes.request.d      {{modes.request. {{modes.request.w        {{modes.request.n
cess       esc}}                  ux}}             hen}}                    otes}}


2) Rule Table by Surface (required)
 surface_ty         default_mode                     overrides                 rationale
     pe
primary_na     {{rules.primary.default_mod   {{rules.primary.override      {{rules.primary.rational
v              e}}                           s}}                           e}}

secondary_     {{rules.secondary.default_    {{rules.secondary.overri      {{rules.secondary.ration
nav            mode}}                        des}}                         ale}}

contextual_l   {{rules.contextual.default_   {{rules.contextual.overri     {{rules.contextual.ratio
ink            mode}}                        des}}                         nale}}

deep_link      {{rules.deeplink.default_mo   {{rules.deeplink.overrid      {{rules.deeplink.rational
               de}}                          es}}                          e}}


3) Deep Link Restricted Handling (required)

  ●​ Redirect target: {{deeplink.redirect_target}} (route_id/screen_id)​

  ●​ Explanation UI: {{deeplink.explanation_ui}} (banner/screen/modal)​

  ●​ User action offered: {{deeplink.user_action}} (login/upgrade/request access/back)​

  ●​ Telemetry/logging: {{deeplink.telemetry}}​

  ●​ Security note (no leakage): {{deeplink.no_leakage_rule}}​



4) Copy Requirements (required)

  ●​ Access denied message source: {{xref:CDX-04}} | OPTIONAL​

  ●​ Upsell/request-access message source: {{xref:CDX-02}} | OPTIONAL​



5) Compliance Checks (required)

  ●​ All restricted destinations have deterministic handling: {{checks.coverage_complete}}​

  ●​ No restricted resource data shown pre-check: {{checks.no_precheck_render}}​



Cross-References
  ●​ Upstream: {{xref:IAN-01}} | OPTIONAL, {{xref:PRD-03}} | OPTIONAL, {{xref:BRP-02}} |
     OPTIONAL, {{xref:IAM-03}} | OPTIONAL​
  ●​ Downstream: {{xref:IAN-02}} | OPTIONAL, {{xref:FE-01}} | OPTIONAL, {{xref:MOB-01}} |
     OPTIONAL, {{xref:QA-02}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Define modes + deep link behavior + default rules.​

  ●​ intermediate: Required. Add overrides and copy pointers.​

  ●​ advanced: Required. Add telemetry + security checks and enterprise policy notes if
     needed.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: org_policies, audit_trail_needs, notes, overrides​

  ●​ If deep link restricted handling is UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.IAN​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ gating_modes_present == true​

         ○​ rule_table_present == true​

         ○​ deeplink_handling_present == true​

         ○​ coverage_complete == true​

         ○​ placeholder_resolution == true​
○​ no_unapproved_unknowns == true
Accessibility Design (A11YD)
Accessibility Design (A11YD)​
A11YD-01 Accessibility Requirements Checklist (WCAG-aligned)​
A11YD-02 Keyboard/Focus Order Spec​
A11YD-03 Screen Reader & Labels Spec (aria/alt/roles)​
A11YD-04 Color Contrast & Visual Accessibility Spec​
A11YD-05 Accessible Error Messaging Rules
