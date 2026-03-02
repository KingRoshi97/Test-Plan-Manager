ARC-06
ARC-06 — Error Model + Reason Codes
(canonical failure taxonomy)
Header Block
   ●​ template_id: ARC-06​

   ●​ title: Error Model + Reason Codes (canonical failure taxonomy)​

   ●​ type: system_architecture​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/architecture/ARC-06_Error_Model_Reason_Codes.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ARCH​

   ●​ upstream_dependencies: ["BRP-01", "DMG-03", "DES-07", "CDX-04"]​

   ●​ inputs_required: ["BRP-01", "DMG-03", "DES-07", "CDX-04", "ERR-01", "ERR-02",
      "ERR-03", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the system-wide error model and reason-code strategy so failures are predictable,
mappable to UX copy, and observable. This provides the canonical failure taxonomy that APIs,
workflows, and realtime systems must follow.


Inputs Required
   ●​ BRP-01: {{xref:BRP-01}} | OPTIONAL​

   ●​ DMG-03: {{xref:DMG-03}} | OPTIONAL​

   ●​ DES-07: {{xref:DES-07}} | OPTIONAL​
  ●​ CDX-04: {{xref:CDX-04}} | OPTIONAL​

  ●​ ERR-01: {{xref:ERR-01}} | OPTIONAL​

  ●​ ERR-02: {{xref:ERR-02}} | OPTIONAL​

  ●​ ERR-03: {{xref:ERR-03}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Error class model:​

         ○​ domain/business rule errors​

         ○​ validation errors​

         ○​ auth/authz errors​

         ○​ dependency/integration errors​

         ○​ system/unknown errors​

  ●​ Reason code rules:​

         ○​ rc_* naming convention​

         ○​ uniqueness and ownership​

         ○​ stability policy (never reuse)​

  ●​ Mapping rules:​

         ○​ error class → HTTP status (if applicable)​

         ○​ reason_code → UX surface/message policy​

         ○​ reason_code → retryability policy​

  ●​ Safe error payload policy (no leakage)​
   ●​ Correlation ID policy (whether shown to user)​

   ●​ Logging/telemetry required fields​



Optional Fields
   ●​ Versioning/deprecation policy for reason codes | OPTIONAL​

   ●​ Domain-specific extensions | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Every user-facing error must have a reason_code OR a policy-defined fallback reason.​

   ●​ Reason codes must be stable; deprecate, don’t reuse.​

   ●​ Errors must not leak sensitive internal information.​

   ●​ Retryability must align to idempotency rules (ERR-05 / WFO-03).​

   ●​ UX mapping must align to DES-07 and CDX-04.​



Output Format
1) Error Classes (required)
 error_cla     description             examples            default_surface      default_retryabil
    ss                                                                                 ity

domain_r     {{classes.domain     {{classes.domain.ex     {{classes.domain.s    {{classes.domain.
ule          .desc}}              amples}}                urface}}              retry}}

validation   {{classes.validati   {{classes.validation.   {{classes.validation {{classes.validati
             on.desc}}            examples}}              .surface}}           on.retry}}

authz        {{classes.authz.d    {{classes.authz.exa     {{classes.authz.sur   {{classes.authz.r
             esc}}                mples}}                 face}}                etry}}
dependen     {{classes.depend     {{classes.dependen     {{classes.depende    {{classes.depend
cy           ency.desc}}          cy.examples}}          ncy.surface}}        ency.retry}}

system_u     {{classes.system.    {{classes.system.ex    {{classes.system.s   {{classes.system.
nknown       desc}}               amples}}               urface}}             retry}}


2) Reason Code Rules (required)

   ●​ Naming convention: {{reason_codes.naming}} (rc_<domain>_<slug>)​

   ●​ Ownership rule: {{reason_codes.ownership}}​

   ●​ Stability rule: {{reason_codes.stability}}​

   ●​ Fallback reason_code: {{reason_codes.fallback}}​



3) Mappings (required)

   ●​ Error class → status mapping pointer: {{xref:ERR-03}} | OPTIONAL​

   ●​ Reason code → UX mapping pointer: {{xref:ERR-04}} | OPTIONAL​

   ●​ Reason code → retry mapping pointer: {{xref:ERR-05}} | OPTIONAL​



4) Safe Payload Policy (required)

   ●​ Allowed fields: {{payload.allowed_fields}}​

   ●​ Forbidden fields: {{payload.forbidden_fields}}​

   ●​ Internal debug fields policy: {{payload.debug_policy}} | OPTIONAL​



5) Correlation ID Policy (required)

   ●​ Generated where: {{correlation.generated_where}}​

   ●​ Returned to client: {{correlation.returned_to_client}}​

   ●​ Shown to user: {{correlation.shown_to_user}}​
  ●​ Copy pointer (if shown): {{xref:CDX-04}} | OPTIONAL​



6) Logging/Telemetry Requirements (required)

  ●​ Required log fields: {{telemetry.required_log_fields}}​

  ●​ Required metric tags: {{telemetry.required_metric_tags}} | OPTIONAL​

  ●​ Trace correlation rules: {{telemetry.trace_rules}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:DES-07}} | OPTIONAL, {{xref:CDX-04}} | OPTIONAL, {{xref:BRP-01}} |
     OPTIONAL​

  ●​ Downstream: {{xref:ERR-01}}, {{xref:ERR-02}}, {{xref:ERR-03}}, {{xref:ERR-04}},
     {{xref:ERR-05}}, {{xref:ERR-06}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Define classes + reason-code rules + safe payload policy.​

  ●​ intermediate: Required. Add mapping pointers and correlation ID policy.​

  ●​ advanced: Required. Add telemetry requirements and deprecation policy.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: deprecation_policy, domain_extensions, notes,
     metric_tags, trace_rules​

  ●​ If fallback reason_code policy is UNKNOWN → block Completeness Gate.​
Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.ARCH​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ error_classes_present == true​

        ○​ reason_code_rules_present == true​

        ○​ safe_payload_policy_present == true​

        ○​ correlation_policy_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true​
