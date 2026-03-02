ERR-03
ERR-03 — API Error Contract (shape,
status mapping, localization hooks)
Header Block
   ●​ template_id: ERR-03​

   ●​ title: API Error Contract (shape, status mapping, localization hooks)​

   ●​ type: error_model_reason_codes​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/errors/ERR-03_API_Error_Contract.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ERRORS​

   ●​ upstream_dependencies: ["ERR-01", "ERR-02", "APIG-01", "DGP-01"]​

   ●​ inputs_required: ["ERR-01", "ERR-02", "APIG-01", "DGP-01", "CDX-04",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical error response contract for APIs: payload shape, required fields, status
mapping rules, localization hooks, correlation ID inclusion, and safe disclosure/redaction rules.
This ensures every API returns errors consistently.


Inputs Required
   ●​ ERR-01: {{xref:ERR-01}} | OPTIONAL​

   ●​ ERR-02: {{xref:ERR-02}} | OPTIONAL​

   ●​ APIG-01: {{xref:APIG-01}} | OPTIONAL​
  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ CDX-04: {{xref:CDX-04}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Error payload schema (canonical fields)​

  ●​ Required fields:​

         ○​ error_id (unique per occurrence)​

         ○​ reason_code (rc_*)​

         ○​ error_class​

         ○​ message_key (localization hook) OR safe_message (if allowed)​

         ○​ http_status​

         ○​ correlation_id (trace/request)​

         ○​ timestamp​

  ●​ Optional fields:​

         ○​ field_errors (per input field)​

         ○​ retry_after (for rate limits)​

         ○​ docs_url (optional)​

         ○​ debug_ref (internal-only)​

  ●​ Status mapping rules:​

         ○​ error_class/category → status code​

         ○​ specific reason_code overrides​
   ●​ Localization rules:​

           ○​ how clients map reason_code → localized copy​

           ○​ server-side vs client-side localization policy​

   ●​ Redaction rules:​

           ○​ what fields never returned​

           ○​ what can be returned for debug​

   ●​ Contract test requirements (baseline set)​



Optional Fields
   ●​ GraphQL error mapping notes | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ reason_code is mandatory for all non-2xx errors (except truly unknown fallback with
      explicit rc_unknown).​

   ●​ Error payload must not leak internal stack traces or sensitive identifiers.​

   ●​ Status codes must be consistent across endpoints; do not “choose per endpoint.”​

   ●​ Field errors must use stable input field names (aligned to API schemas).​

   ●​ Correlation ID must always be present and consistent with observability propagation.​



Output Format
1) Canonical Error Payload Schema (required)
{
 "error_id": "{{error.error_id}}",
 "reason_code": "{{error.reason_code}}",
 "error_class": "{{error.error_class}}",
 "http_status": {{error.http_status}},
 "message_key": "{{error.message_key}}",
 "safe_message": "{{error.safe_message}}",
 "correlation_id": "{{error.correlation_id}}",
 "timestamp": "{{error.timestamp}}",
 "field_errors": [
   {
     "field": "{{error.field_errors[0].field}}",
     "reason_code": "{{error.field_errors[0].reason_code}}",
     "message_key": "{{error.field_errors[0].message_key}}"
   }
 ],
 "retry_after": {{error.retry_after}},
 "docs_url": "{{error.docs_url}}"
}

2) Required/Optional Fields (required)

   ●​ Required: error_id, reason_code, error_class, http_status, correlation_id, timestamp,
      (message_key OR safe_message)​

   ●​ Optional: field_errors, retry_after, docs_url, debug_ref​



3) Status Mapping Rules (required)
 error_class          default_status         overrides (reason_code                notes
                                                    → status)

 validation      {{status.validation.defau   {{status.validation.overrid   {{status.validation.note
                 lt}}                        es}}                          s}}

 authz           {{status.authz.default}}    {{status.authz.overrides}}    {{status.authz.notes}}

 domain_rule     {{status.domain.default}    {{status.domain.overrides     {{status.domain.notes}
                 }                           }}                            }

 dependency      {{status.dependency.def     {{status.dependency.overr     {{status.dependency.n
                 ault}}                      ides}}                        otes}}

 system_unkn     {{status.system.default}}   {{status.system.overrides}    {{status.system.notes}
 own                                         }                             }


4) Localization Hooks (required)
  ●​ Server localization policy: {{l10n.server_policy}}​

  ●​ Client localization policy: {{l10n.client_policy}}​

  ●​ message_key format: {{l10n.message_key_format}} | OPTIONAL​

  ●​ If safe_message used, constraints: {{l10n.safe_message_constraints}}​



5) Redaction Rules (required)

  ●​ Never return: {{redaction.never_return}}​

  ●​ Allowed (safe debug): {{redaction.allowed_debug}} | OPTIONAL​

  ●​ debug_ref policy: {{redaction.debug_ref_policy}} | OPTIONAL​



6) Contract Tests (required)

  ●​ Must test presence of required fields: {{tests.required_fields}}​

  ●​ Must test status mapping correctness: {{tests.status_mapping}}​

  ●​ Must test no leakage (no stack traces): {{tests.no_leakage}}​

  ●​ Must test field_errors shape: {{tests.field_errors}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:ERR-01}} | OPTIONAL, {{xref:ERR-02}} | OPTIONAL, {{xref:DGP-01}} |
     OPTIONAL​

  ●​ Downstream: {{xref:API-03}} | OPTIONAL, {{xref:ERR-04}} | OPTIONAL, {{xref:QA-03}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
 ●​ beginner: Required. Payload schema + required fields + default status mapping.​

 ●​ intermediate: Required. Add localization policy and redaction rules.​

 ●​ advanced: Required. Add overrides and contract test requirements.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: graphql_notes, docs_url_policy, notes, overrides (if
    none)​

 ●​ If reason_code is not mandatory → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.ERRORS​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ payload_schema_present == true​

        ○​ status_mapping_present == true​

        ○​ redaction_rules_present == true​

        ○​ contract_tests_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true​
