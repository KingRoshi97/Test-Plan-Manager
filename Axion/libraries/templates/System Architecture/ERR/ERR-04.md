ERR-04
ERR-04 — UX Error Mapping Rules
(reason_code → DES/CDX surfaces)
Header Block
   ●​ template_id: ERR-04​

   ●​ title: UX Error Mapping Rules (reason_code → DES/CDX surfaces)​

   ●​ type: error_model_reason_codes​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/errors/ERR-04_UX_Error_Mapping_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ERRORS​

   ●​ upstream_dependencies: ["ERR-02", "DES-07", "CDX-04", "A11YD-05"]​

   ●​ inputs_required: ["ERR-02", "DES-07", "CDX-04", "CDX-01", "A11YD-05",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define deterministic rules for how each reason_code is presented in the UX: which surface is
used (inline/toast/banner/modal), what copy key is used, whether retry is offered, and what
accessibility requirements apply. This prevents inconsistent error UX across screens and
platforms.


Inputs Required
   ●​ ERR-02: {{xref:ERR-02}} | OPTIONAL​

   ●​ DES-07: {{xref:DES-07}} | OPTIONAL​
  ●​ CDX-04: {{xref:CDX-04}} | OPTIONAL​

  ●​ CDX-01: {{xref:CDX-01}} | OPTIONAL​

  ●​ A11YD-05: {{xref:A11YD-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Mapping table (minimum 30 reason_code mappings; justify if smaller)​

  ●​ For each mapping:​

         ○​ reason_code​

         ○​ default_surface (inline/toast/banner/modal/fullscreen)​

         ○​ message_key or msg_id (from CDX-04)​

         ○​ user_guidance (short)​

         ○​ retry_allowed (true/false)​

         ○​ retry_action (what happens on retry) | OPTIONAL​

         ○​ escalation_action (contact support, report, etc.) | OPTIONAL​

         ○​ accessibility requirement (announce, focus move, etc.)​

         ○​ platform notes (web/mobile)​

  ●​ Global rules:​

         ○​ precedence rules (if multiple errors occur)​

         ○​ field error handling rules​

         ○​ unknown reason_code fallback behavior​



Optional Fields
  ●​ Screen-specific overrides | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Must align with DES-07 surface rules and A11YD-05 focus/announcement rules.​

  ●​ Every mapped reason_code must exist in ERR-02 registry.​

  ●​ Unknown reason_code must map to a safe generic message and correlation ID
     guidance policy.​

  ●​ Field-level validation errors must use inline + focus rules.​



Output Format
1) Reason Code → UX Mapping (canonical)
 reason_    surfac    cdx_m     guidan    retry   retry_ac    escalat    a11y     platfor    notes
   code       e       sg_id_      ce      _allo     tion      ion_act    _beh     m_not
                      or_key              wed                   ion      avior      es

{{map[0].   {{map[    {{map[    {{map[0 {{map     {{map[0]    {{map[0    {{map    {{map[     {{map
reason_     0].surf   0].cdx_   ].guida [0].ret   .retry_ac   ].escala   [0].a1   0].platf   [0].no
code}}      ace}}     ref}}     nce}}   ry}}      tion}}      tion}}     1y}}     orm}}      tes}}

{{map[1].   {{map[    {{map[    {{map[1 {{map     {{map[1]    {{map[1    {{map    {{map[     {{map
reason_     1].surf   1].cdx_   ].guida [1].ret   .retry_ac   ].escala   [1].a1   1].platf   [1].no
code}}      ace}}     ref}}     nce}}   ry}}      tion}}      tion}}     1y}}     orm}}      tes}}


2) Global Rules (required)

  ●​ Multiple errors precedence: {{rules.precedence}}​

  ●​ Field errors handling: {{rules.field_errors}}​

  ●​ Unknown reason_code fallback: {{rules.unknown_fallback}}​

  ●​ Correlation ID display policy: {{rules.correlation_display}} | OPTIONAL​
3) Overrides (optional)
 overri     screen_id         reason_code         surface_over      copy_overri        rationale
 de_id                                                 ride             de

ov_01     {{overrides[0].s   {{overrides[0].rea   {{overrides[0].   {{overrides[0   {{overrides[0].r
          creen_id}}         son_code}}           surface}}         ].copy}}        ationale}}


4) Coverage Checks (required)

   ●​ All reason_codes referenced exist: {{coverage.codes_exist}}​

   ●​ Minimum mappings met: {{coverage.min_met}}​

   ●​ A11y behaviors specified: {{coverage.a11y_complete}}​



Cross-References
   ●​ Upstream: {{xref:ERR-02}} | OPTIONAL, {{xref:DES-07}} | OPTIONAL, {{xref:CDX-04}} |
      OPTIONAL, {{xref:A11YD-05}} | OPTIONAL​

   ●​ Downstream: {{xref:FE-07}} | OPTIONAL, {{xref:MOB-*}} | OPTIONAL, {{xref:QA-02}} |
      OPTIONAL​

   ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Required. Mapping table + unknown fallback.​

   ●​ intermediate: Required. Add precedence rules and a11y behaviors.​

   ●​ advanced: Required. Add overrides and coverage checks.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: screen_overrides, notes, retry_action,
    escalation_action, platform_notes​

 ●​ If unknown fallback is UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.ERRORS​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ mappings_count >= 30 (or justified)​

        ○​ codes_exist == true​

        ○​ a11y_complete == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
