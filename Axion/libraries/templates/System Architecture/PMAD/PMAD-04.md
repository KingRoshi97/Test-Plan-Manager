PMAD-04
PMAD-04 — Permission Check Patterns
(standard decision flow + reason codes)
Header Block
   ●​ template_id: PMAD-04​

   ●​ title: Permission Check Patterns (standard decision flow + reason codes)​

   ●​ type: permission_model_authorization_design​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/authz/PMAD-04_Permission_Check_Patterns.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.AUTHZ​

   ●​ upstream_dependencies: ["PMAD-02", "ERR-02", "ERR-03"]​

   ●​ inputs_required: ["PMAD-02", "ERR-02", "ERR-03", "ARC-06", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the standard pattern for performing permission checks and generating consistent deny
outcomes: what inputs are required, how decisions are logged, which reason codes to emit, and
how to avoid inconsistent authz logic across services.


Inputs Required
   ●​ PMAD-02: {{xref:PMAD-02}} | OPTIONAL​

   ●​ ERR-02: {{xref:ERR-02}} | OPTIONAL​

   ●​ ERR-03: {{xref:ERR-03}} | OPTIONAL​
  ●​ ARC-06: {{xref:ARC-06}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Standard decision flow (step-by-step)​

  ●​ Required inputs (subject/resource/action/context)​

  ●​ Decision outcomes (allow/deny/unknown) and handling rules​

  ●​ Deny response rules:​

         ○​ status mapping​

         ○​ reason_code mapping​

         ○​ redaction rules​

  ●​ Logging/audit rules:​

         ○​ what to log​

         ○​ what not to log​

         ○​ correlation ID inclusion​

  ●​ Performance rules (caching/short-circuit rules) (high level)​

  ●​ Example patterns (minimum 3):​

         ○​ owner-only access​

         ○​ role-based access​

         ○​ conditional (ABAC) access​

  ●​ Test requirements (what must be tested)​



Optional Fields
  ●​ Policy evaluation caching design | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Unknown evaluation results must default to deny (per PMAD-01 default-deny).​

  ●​ Deny must always output a reason_code (policy-defined or fallback).​

  ●​ Logging must be redacted; never log secrets or sensitive resource contents.​

  ●​ If caching decisions, cache must be scoped by subject + resource + action + context.​



Output Format
1) Standard Decision Flow (required)

  1.​ Collect inputs: {{flow.step1}}​

  2.​ Normalize context: {{flow.step2}}​

  3.​ Evaluate matching policies: {{flow.step3}}​

  4.​ Resolve conflicts: {{flow.step4}}​

  5.​ Emit decision + reason_code: {{flow.step5}}​

  6.​ Log/audit event: {{flow.step6}}​

  7.​ Return response: {{flow.step7}}​



2) Required Inputs (required)

  ●​ subject: {{inputs.subject}}​

  ●​ resource: {{inputs.resource}}​

  ●​ action: {{inputs.action}}​
  ●​ context: {{inputs.context}}​



3) Outcomes (required)
 outco             meaning                          response            reason_code_rule
  me

allow    {{outcomes.allow.meaning}       {{outcomes.allow.response   {{outcomes.allow.rc_rule}
         }                               }}                          }

deny     {{outcomes.deny.meaning}        {{outcomes.deny.response    {{outcomes.deny.rc_rule}}
         }                               }}

unkno    {{outcomes.unknown.mea          {{outcomes.unknown.respo {{outcomes.unknown.rc_r
wn       ning}}                          nse}}                    ule}}


4) Deny Response Rules (required)

  ●​ Status mapping pointer: {{xref:ERR-03}} | OPTIONAL​

  ●​ Fallback deny reason_code: {{deny.fallback_reason_code}}​

  ●​ Redaction rule: {{deny.redaction}}​

  ●​ Correlation ID policy: {{deny.correlation_id}} | OPTIONAL​



5) Logging/Audit Rules (required)

  ●​ Must log: {{log.must_log}}​

  ●​ Must not log: {{log.must_not_log}}​

  ●​ Audit event name: {{log.audit_event_name}} | OPTIONAL​



6) Performance & Caching (required)

  ●​ Short-circuit rules: {{perf.short_circuit}}​

  ●​ Caching allowed: {{perf.caching_allowed}}​

  ●​ Cache key scope: {{perf.cache_key_scope}} | OPTIONAL​
7) Example Patterns (required, min 3)

Pattern A — Owner-only

   ●​ Rule form: {{examples.owner.rule}}​

   ●​ Inputs needed: {{examples.owner.inputs}}​

   ●​ Deny reason_code: {{examples.owner.deny_rc}}​


Pattern B — Role-based

   ●​ Rule form: {{examples.role.rule}}​

   ●​ Inputs needed: {{examples.role.inputs}}​

   ●​ Deny reason_code: {{examples.role.deny_rc}}​


Pattern C — ABAC conditional

   ●​ Rule form: {{examples.abac.rule}}​

   ●​ Inputs needed: {{examples.abac.inputs}}​

   ●​ Deny reason_code: {{examples.abac.deny_rc}}​



8) Test Requirements (required)

   ●​ Unit tests: {{tests.unit}}​

   ●​ Integration/contract tests: {{tests.contract}} | OPTIONAL​

   ●​ E2E coverage: {{tests.e2e}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:PMAD-02}} | OPTIONAL, {{xref:ERR-02}} | OPTIONAL, {{xref:ARC-06}}
      | OPTIONAL​
  ●​ Downstream: {{xref:PMAD-03}} | OPTIONAL, {{xref:PMAD-06}} | OPTIONAL,
     {{xref:TINF-*}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Decision flow + outcomes + deny rules.​

  ●​ intermediate: Required. Add logging rules and examples.​

  ●​ advanced: Required. Add caching/perf constraints and test requirements depth.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: policy_eval_caching, notes, audit_event_name,
     correlation_id​

  ●​ If fallback deny reason_code is UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.AUTHZ​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ decision_flow_present == true​

         ○​ outcomes_defined == true​

         ○​ deny_rules_present == true​

         ○​ examples_count >= 3​

         ○​ placeholder_resolution == true​
○​ no_unapproved_unknowns == true
