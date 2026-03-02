APIG-01
APIG-01 — API Standards (naming,
pagination, filtering, consistency)
Header Block
   ●​ template_id: APIG-01​

   ●​ title: API Standards (naming, pagination, filtering, consistency)​

   ●​ type: api_governance_versioning​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/api_governance/APIG-01_API_Standards.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.APIG​

   ●​ upstream_dependencies: ["DMG-01", "ERR-03", "APIG-02"]​

   ●​ inputs_required: ["DMG-01", "ERR-03", "APIG-02", "PFS-01", "RLIM-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the enforceable API standards for all endpoints: naming conventions, resource modeling,
request/response consistency, pagination/filtering/sorting rules, envelope patterns, error
handling shape, and compatibility expectations.


Inputs Required
   ●​ DMG-01: {{xref:DMG-01}} | OPTIONAL​

   ●​ ERR-03: {{xref:ERR-03}} | OPTIONAL​

   ●​ APIG-02: {{xref:APIG-02}} | OPTIONAL​
  ●​ PFS-01: {{xref:PFS-01}} | OPTIONAL​

  ●​ RLIM-01: {{xref:RLIM-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Naming conventions:​

         ○​ endpoint paths​

         ○​ resource naming (singular/plural)​

         ○​ query parameter naming​

         ○​ header naming​

  ●​ Request/response standards:​

         ○​ envelope policy (yes/no)​

         ○​ consistent field naming (snake/camel)​

         ○​ timestamps format (ISO)​

         ○​ id fields naming​

  ●​ Pagination standard:​

         ○​ cursor vs offset​

         ○​ required params​

         ○​ response fields​

  ●​ Filtering/sorting standard:​

         ○​ allowed operators​

         ○​ how to express sort​
  ●​ Error contract compliance rule (ERR-03)​

  ●​ Idempotency and retries policy pointer (ERR-05)​

  ●​ Rate limit standard pointer (RLIM)​

  ●​ Security standards (auth headers, scopes) pointer​

  ●​ Compatibility statement (old clients)​



Optional Fields
  ●​ GraphQL standards | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Every endpoint must comply with naming and pagination standards if list returns.​

  ●​ Error payload must comply with ERR-03.​

  ●​ Filtering/sorting must be deterministic and documented.​

  ●​ No breaking changes without versioning policy compliance (APIG-02/APIG-03).​



Output Format
1) Naming Conventions (required)

  ●​ Path style: {{naming.paths}}​

  ●​ Resource nouns: {{naming.resources}}​

  ●​ Query params: {{naming.query_params}}​

  ●​ Headers: {{naming.headers}} | OPTIONAL​
2) Request/Response Standards (required)

   ●​ Envelope policy: {{standards.envelope}}​

   ●​ Field casing: {{standards.casing}}​

   ●​ Timestamp format: {{standards.timestamp}}​

   ●​ ID fields: {{standards.id_fields}}​



3) Pagination Standard (required)

   ●​ Pagination type: {{pagination.type}} (cursor/offset)​

   ●​ Request params: {{pagination.request_params}}​

   ●​ Response fields: {{pagination.response_fields}}​

   ●​ Limits policy: {{pagination.limits_policy}} | OPTIONAL​



4) Filtering/Sorting Standard (required)

   ●​ Filter operators: {{filters.operators}}​

   ●​ Filter expression format: {{filters.format}}​

   ●​ Sort format: {{sort.format}}​

   ●​ Default sort: {{sort.default}} | OPTIONAL​



5) Error + Retry + Rate Limit Standards (required)

   ●​ Error contract: {{xref:ERR-03}} | OPTIONAL​

   ●​ Retry/idempotency policy: {{xref:ERR-05}} | OPTIONAL​

   ●​ Rate limit standard: {{xref:RLIM-01}} | OPTIONAL​



6) Compatibility Statement (required)
  ●​ Backward compatibility rule: {{compat.backward}}​

  ●​ Deprecation rule pointer: {{xref:APIG-03}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:DMG-01}} | OPTIONAL, {{xref:ERR-03}} | OPTIONAL​

  ●​ Downstream: {{xref:API-02}} | OPTIONAL, {{xref:APIG-04}} | OPTIONAL,
     {{xref:APIG-05}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Naming + basic request/response + error contract pointer.​

  ●​ intermediate: Required. Add pagination and filtering/sorting.​

  ●​ advanced: Required. Add compatibility and deprecation constraints.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: graphql_standards, headers, envelope_policy (if
     decided later), notes​

  ●​ If pagination type is UNKNOWN for list endpoints → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.APIG​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​
○​ naming_conventions_present == true​

○​ pagination_standard_present == true​

○​ filtering_sorting_present == true​

○​ error_contract_pointer_present == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true​
