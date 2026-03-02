DES-07
DES-07 — Error Handling UX (toasts,
banners, inline errors, retries)
Header Block
   ●​   template_id: DES-07
   ●​   title: Error Handling UX (toasts, banners, inline errors, retries)
   ●​   type: design_ux
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/design/DES-07_Error_Handling_UX.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.DESIGN
   ●​   upstream_dependencies: ["DES-05", "ARC-06", "API-03"]
   ●​   inputs_required: ["DES-05", "ARC-06", "API-03", "CDX-04", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define consistent UX rules for error presentation and recovery across the app: where errors
appear, what they say, whether actions are available, and how retries/backoff behave.


Inputs Required
   ●​   DES-05: {{xref:DES-05}}
   ●​   ARC-06: {{xref:ARC-06}} | OPTIONAL
   ●​   API-03: {{xref:API-03}} | OPTIONAL
   ●​   CDX-04: {{xref:CDX-04}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​   Error surface rules (inline vs banner vs toast vs modal)
   ●​   Error categories (validation/network/server/permission/unknown)
   ●​   Retry rules (when allowed, backoff, max attempts)
   ●​   Fallback rules (when to show generic message)
   ●​   Logging/telemetry pointer rules (what gets recorded)
   ●​   Accessibility rules (announcements, focus)
Optional Fields
  ●​ Support escalation UI (contact support) | OPTIONAL
  ●​ Offline-specific errors | OPTIONAL
  ●​ Notes | OPTIONAL


Rules
  ●​     Error messages must be actionable and consistent; do not leak sensitive details.
  ●​     Permission errors must align to IAM/BRP entitlements.
  ●​     Server errors should map reason codes when available (ARC-06).
  ●​     Retry must not create destructive repeats unless idempotent.


Output Format
1) Error Surface Rules (required)
error_      preferred_surface         when_used              user_action               notes
 type

validat    {{surfaces.validation   {{surfaces.validatio   {{surfaces.validatio   {{surfaces.validatio
ion        .surface}}              n.when}}               n.action}}             n.notes}}

networ {{surfaces.network.s        {{surfaces.network. {{surfaces.network.       {{surfaces.network
k      urface}}                    when}}              action}}                  .notes}}

server     {{surfaces.server.su    {{surfaces.server.w    {{surfaces.server.a    {{surfaces.server.n
           rface}}                 hen}}                  ction}}                otes}}

permis {{surfaces.permissio        {{surfaces.permissi    {{surfaces.permissi    {{surfaces.permissi
sion   n.surface}}                 on.when}}              on.action}}            on.notes}}

unkno      {{surfaces.unknown.     {{surfaces.unknow      {{surfaces.unknown {{surfaces.unknow
wn         surface}}               n.when}}               .action}}          n.notes}}


2) Retry Rules (required)

  ●​     When retry is shown: {{retry.when}}
  ●​     Backoff: {{retry.backoff}}
  ●​     Max attempts: {{retry.max_attempts}}
  ●​     Idempotency note: {{retry.idempotency_note}} | OPTIONAL

3) Fallback Rules (required)
   ●​ Generic message conditions: {{fallback.when_generic}}
   ●​ Sensitive detail redaction: {{fallback.redaction}}
   ●​ Unknown error path: {{fallback.unknown_path}}

4) Accessibility (required)

   ●​ Announce errors: {{a11y.announce}}
   ●​ Focus management: {{a11y.focus}}
   ●​ Toast timing considerations: {{a11y.toast_timing}} | OPTIONAL

5) Logging/Telemetry (required)

   ●​ What to log: {{telemetry.what}}
   ●​ Correlation ID display policy: {{telemetry.correlation_id_policy}} | OPTIONAL

6) Support Escalation (optional)

   ●​ {{support.ui}} | OPTIONAL


Cross-References
   ●​ Upstream: {{xref:DES-05}}, {{xref:ARC-06}} | OPTIONAL, {{xref:API-03}} | OPTIONAL
   ●​ Downstream: {{xref:CER-*}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL, {{xref:OBS-01}} |
      OPTIONAL
   ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
   ●​ beginner: Required. Define surfaces and retry basics.
   ●​ intermediate: Required. Add fallback and telemetry rules.
   ●​ advanced: Required. Add idempotency constraints and support escalation patterns.


Unknown Handling
   ●​ UNKNOWN_ALLOWED: support_escalation_ui, offline_specific, notes
   ●​ If retry rules are UNKNOWN → block Completeness Gate.


Completeness Gate
   ●​ Gate ID: TMP-05.PRIMARY.DESIGN
   ●​ Pass conditions:
         ○​ required_fields_present == true
○​   surfaces_defined == true
○​   retry_rules_present == true
○​   fallback_rules_present == true
○​   placeholder_resolution == true
○​   no_unapproved_unknowns == true
