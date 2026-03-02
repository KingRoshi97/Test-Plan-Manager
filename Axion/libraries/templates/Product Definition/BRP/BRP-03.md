BRP-03
BRP-03 — Pricing/Permission Policy
Rules (if applicable)
Header Block
   ●​   template_id: BRP-03
   ●​   title: Pricing/Permission Policy Rules
   ●​   type: business_rules_policy
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/policy/BRP-03_Pricing_Permission_Policy.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.POLICY
   ●​   upstream_dependencies: ["BRP-02"]
   ●​   inputs_required: ["BRP-02", "PRD-04", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}


Purpose
Capture policy rules that govern pricing, billing permissions, and paywall behavior (if the product
has monetization). This informs PAY/REVOPS, UI gating, and entitlements enforcement.


Inputs Required
   ●​   BRP-02: {{xref:BRP-02}} | OPTIONAL
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL
   ●​   Pricing notes: {{inputs.pricing_notes}} | OPTIONAL


Required Fields
   ●​   Policy applicability (true/false) (if false, explicitly mark N/A)
   ●​   Pricing constructs (plans, tiers, add-ons)
   ●​   Permission rules for billing actions (who can purchase/cancel/refund)
   ●​   Paywall rules (what happens when not entitled)
   ●​   Upgrade/downgrade rules (effective timing)
   ●​   Proration/refund policy pointer (if applicable)


Optional Fields
   ●​ Taxes/invoicing policy pointer | OPTIONAL
   ●​ Promotions/coupons | OPTIONAL
   ●​ Open questions | OPTIONAL


Rules
   ●​ If applicable == false, include only: rationale + references, and mark remaining sections
      00_NA.
   ●​ Paywall behavior must map to entitlements from BRP-02.
   ●​ Billing permissions must map to roles from PRD-03/IAM.


Output Format
1) Applicability

   ●​ applies: {{pricing.applies}} (true/false)
   ●​ rationale: {{pricing.rationale}} | OPTIONAL

2) Pricing Constructs (if applies)
 plan_i          name          included_entitlement_i             limits                 notes
   d                                    ds

plan_0     {{plans[0].name}}   {{plans[0].ent_ids}}         {{plans[0].limits}}    {{plans[0].notes}}
1


3) Billing Permissions (if applies)
 action             allowed_role_ids                            notes

purchas     {{billing_perms.purchase.roles}}      {{billing_perms.purchase.notes}}
e

cancel      {{billing_perms.cancel.roles}}        {{billing_perms.cancel.notes}}

refund      {{billing_perms.refund.roles}}        {{billing_perms.refund.notes}}


4) Paywall Rules (if applies)
 rule_i        condition           user_experien       enforcement_points               notes
   d                                    ce

pw_0      {{paywall[0].condition   {{paywall[0].ux}   {{paywall[0].enforceme      {{paywall[0].notes
1         }}                       }                  nt}}                        }}
5) Upgrade/Downgrade Rules (if applies)

   ●​ {{changes.upgrade_rule}}
   ●​ {{changes.downgrade_rule}} | OPTIONAL

6) N/A Marker (if not applies)

   ●​ 00_NA: {{pricing.na_block}} | OPTIONAL

7) Open Questions (optional)

   ●​ {{open_questions[0]}} | OPTIONAL


Cross-References
   ●​ Upstream: {{xref:BRP-02}} | OPTIONAL
   ●​ Downstream: {{xref:REVOPS-}} | OPTIONAL, {{xref:PAY-}} | OPTIONAL, {{xref:FE-*}} |
      OPTIONAL, {{xref:QA-02}} | OPTIONAL
   ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
   ●​ beginner: Not required unless monetization exists.
   ●​ intermediate: Required if monetization exists.
   ●​ advanced: Required if monetization exists and multiple plans/roles.


Unknown Handling
   ●​ UNKNOWN_ALLOWED: promotions, tax_policy, open_questions, notes
   ●​ If applies == true and paywall rules are UNKNOWN → block Completeness Gate.


Completeness Gate
   ●​ Gate ID: TMP-05.PRIMARY.POLICY
   ●​ Pass conditions:
         ○​ required_fields_present == true
         ○​ if_applies_then_pricing_sections_complete == true
         ○​ placeholder_resolution == true
         ○​ no_unapproved_unknowns == true
